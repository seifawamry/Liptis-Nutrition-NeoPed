const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PORT = 3099;
const CDP_PORT = 9235;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHttp(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
    } catch {
      // retry
    }
    await sleep(300);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve());
      this.ws.addEventListener("error", (e) => reject(e));
      this.ws.addEventListener("message", (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(new Error(JSON.stringify(msg.error)));
          else res(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log("1. Starting Next.js server on port", PORT);
  const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
  const serverProc = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: path.join(__dirname, ".."),
    stdio: "pipe",
  });

  let chromeProc = null;
  const userDataDir = path.join(__dirname, "chrome-tmp-profile-2");
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  try {
    await waitForHttp(`http://localhost:${PORT}`);
    console.log("   Next.js server ready.");

    console.log("2. Launching Headless Chrome on CDP port", CDP_PORT);
    chromeProc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${userDataDir}`,
        `--remote-debugging-port=${CDP_PORT}`,
        "--window-size=1440,1200",
        "--hide-scrollbars",
        `http://localhost:${PORT}`,
      ],
      { stdio: "pipe" }
    );

    const targetsJson = await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json`);
    const targets = JSON.parse(targetsJson);
    const pageTarget = targets.find((t) => t.type === "page") || targets[0];
    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error("Could not find page target WebSocket URL");
    }

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1200,
      deviceScaleFactor: 2,
      mobile: false,
    });

    await sleep(1800);

    // Click "Yes, I am a Licensed HCP" button on the HCP Gate Modal
    const gateClicked = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const hcpBtn = btns.find(b => b.textContent && b.textContent.includes('Yes, I am a Licensed HCP'));
          if (hcpBtn) {
            hcpBtn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log("   HCP Gate clicked:", gateClicked.result.value);
    await sleep(1000);

    async function captureRect(filename, clipRect) {
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "png",
        clip: {
          x: Math.max(0, Math.round(clipRect.x)),
          y: Math.max(0, Math.round(clipRect.y)),
          width: Math.round(clipRect.width),
          height: Math.round(clipRect.height),
          scale: 1,
        },
        captureBeyondViewport: true,
      });
      const outPath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(outPath, Buffer.from(data, "base64"));
      console.log(`   Saved screenshot: ${filename} (${Math.round(clipRect.width)}x${Math.round(clipRect.height)})`);
    }

    async function getPageHeight() {
      const res = await cdp.send("Runtime.evaluate", {
        expression: `Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)`,
        returnByValue: true,
      });
      return res.result.value || 1400;
    }

    // --- SCREENSHOT 1: Tab 1 (Fenton / WHO Growth Plotter - Curve & Ages View) ---
    console.log("3. Capturing Tab 1 (Fenton / WHO Growth Plotter - Curve & Ages View)...");
    const tab1Height = await getPageHeight();
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: tab1Height + 40,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(500);

    // Get the exact bounds of the top part of Tab 1 (Header + Demographics + Ages + Anthropometrics + Curve + Evaluation Card)
    const tab1RectsRes = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const findCard = (text) => {
            const els = Array.from(document.querySelectorAll('h2, h3, div'));
            const match = els.find(el => el.children.length === 0 && el.textContent && el.textContent.includes(text));
            if (!match) return null;
            const card = match.closest('.rounded-2xl') || match.parentElement;
            const r = card.getBoundingClientRect();
            return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
          };
          return {
            anthroCard: findCard('Anthropometric Measurements'),
            fuelSnapshot: findCard('Patient Delivered Macronutrient Growth Fuel Snapshot'),
          };
        })()
      `,
      returnByValue: true,
    });
    const t1Rects = tab1RectsRes.result.value;
    console.log("   Tab 1 rects:", JSON.stringify(t1Rects));

    await captureRect("tab1-demographics-ages-curve.png", {
      x: 0,
      y: 0,
      width: 1440,
      height: 1380,
    });

    // --- SCREENSHOT 2: Tab 1 (Longitudinal Velocity + Delivered Growth Fuel Snapshot) ---
    console.log("4. Switching Tab 1 right panel to Longitudinal Velocity view...");
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
          const longTab = tabs.find(b => b.textContent && b.textContent.includes('Longitudinal'));
          if (longTab) longTab.click();
        })()
      `,
    });
    await sleep(700);
    const t1LongHeight = await getPageHeight();
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: t1LongHeight + 40,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(400);

    const panelGrowthRectRes = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const p = document.getElementById('panel-growth');
          const r = p.getBoundingClientRect();
          return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
        })()
      `,
      returnByValue: true,
    });
    const pgRect = panelGrowthRectRes.result.value;
    await captureRect("tab1-longitudinal-velocity.png", {
      x: 0,
      y: Math.max(0, pgRect.top - 12),
      width: 1440,
      height: Math.min(pgRect.height + 24, 1450),
    });

    // --- SWITCH TO TAB 2 (Nutritional Feeds & Macro Engine) ---
    console.log("5. Switching to Tab 2 (Nutritional Feeds & Macro Engine)...");
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.getElementById('tab-nutrition');
          if (btn) btn.click();
          window.scrollTo(0, 0);
        })()
      `,
    });
    await sleep(900);

    const tab2FullHeight = await getPageHeight();
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: Math.min(tab2FullHeight + 60, 6500),
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(500);

    const tab2RectsRes = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const findCardByHeading = (text) => {
            const headings = Array.from(document.querySelectorAll('h2, h3'));
            const match = headings.find(h => h.textContent && h.textContent.includes(text));
            if (!match) return null;
            const card = match.closest('.bg-white.rounded-xl') || match.closest('.rounded-2xl') || match.parentElement.parentElement.parentElement.parentElement;
            const r = card.getBoundingClientRect();
            return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
          };
          return {
            step1: findCardByHeading('1. Enteral Feeding Prescriber'),
            step2: findCardByHeading('2. What Does This Volume & Scoops Deliver'),
            payload: findCardByHeading('Patient Daily Delivered Nutrient Payload'),
            step4: findCardByHeading('Clinical Enteral Feeding Order & Calculation Sheet'),
          };
        })()
      `,
      returnByValue: true,
    });
    const rects = tab2RectsRes.result.value;
    console.log("   Tab 2 card rects:", JSON.stringify(rects));

    if (rects.step1) {
      await captureRect("tab2-step1-volume-scoops.png", {
        x: 0,
        y: Math.max(0, rects.step1.top - 16),
        width: 1440,
        height: Math.min(rects.step1.height + 32, 1300),
      });
    }

    if (rects.step2) {
      await captureRect("tab2-step2-fuel-gauges.png", {
        x: 0,
        y: Math.max(0, rects.step2.top - 16),
        width: 1440,
        height: Math.min(rects.step2.height + 32, 1380),
      });
    }

    if (rects.payload) {
      await captureRect("tab2-step3-nutrient-payload.png", {
        x: 0,
        y: Math.max(0, rects.payload.top - 16),
        width: 1440,
        height: Math.min(rects.payload.height + 32, 1420),
      });
    }

    if (rects.step4) {
      await captureRect("tab2-step4-calculation-sheet.png", {
        x: 0,
        y: Math.max(0, rects.step4.top - 16),
        width: 1440,
        height: Math.min(rects.step4.height + 32, 1320),
      });
    }

    // --- SCREENSHOT 7: Printable 7-Section Hospital Feed Sheet Modal ---
    console.log("6. Opening Printable Hospital Feed Sheet Modal...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1180,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          window.scrollTo(0, 0);
          const btn = document.getElementById('generate-feed-sheet-btn');
          if (btn) btn.click();
        })()
      `,
    });
    await sleep(800);
    await captureRect("modal-hospital-feed-sheet.png", {
      x: 0,
      y: 0,
      width: 1440,
      height: 1150,
    });

    cdp.close();
    console.log("7. All screenshots captured successfully!");
  } finally {
    if (chromeProc) {
      try {
        chromeProc.kill();
      } catch {}
    }
    try {
      serverProc.kill();
    } catch {}
  }
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
