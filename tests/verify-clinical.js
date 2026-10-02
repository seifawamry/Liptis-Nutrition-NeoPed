/**
 * Node.js Test Launcher for verify-clinical.ts
 * Uses local project tsx to execute canonical TypeScript test suite
 */

const { execSync } = require("child_process");
const path = require("path");

const testFile = path.join(__dirname, "verify-clinical.ts");

try {
  execSync(`npx tsx "${testFile}"`, { stdio: "inherit" });
} catch (err) {
  process.exit(1);
}
