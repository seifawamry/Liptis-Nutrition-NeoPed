const fs = require('fs');

async function queryPedi(sex, week, w, l, h) {
  const params = new URLSearchParams();
  params.append('sex', sex === 'male' ? '1' : '2');
  params.append('cga', `${week} 0/7`);
  if (w !== undefined && w !== null) params.append('weight', String(w));
  if (l !== undefined && l !== null) params.append('length', String(l));
  if (h !== undefined && h !== null) params.append('head', String(h));

  const res = await fetch('https://peditools.org/fenton2013/index.php', { method: 'POST', body: params });
  const text = await res.text();
  const match = text.match(/<TBODY>([\s\S]*?)<\/TBODY>/i);
  if (!match) return null;
  const lines = match[1].split('<TR align="center">').map(r => r.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const out = {};
  lines.forEach(line => {
    const parts = line.split(' ');
    const label = parts[0];
    const pctIdx = parts.findIndex(p => p.endsWith('%'));
    const pct = parseFloat(parts[pctIdx]);
    const z = parseFloat(parts[pctIdx + 1]);
    const p50 = parseFloat(parts[pctIdx + 2].replace(/,/g, ''));
    out[label] = { z, pct, p50 };
  });
  return out;
}

const fentonData = JSON.parse(fs.readFileSync('calibrated_fenton_2013.json', 'utf8'));
const testAges = [22, 24, 28, 30, 32, 36, 40, 42, 46, 50];

function calcZ(val, lms) {
  const { L, M, S } = lms;
  if (val <= 0 || M <= 0 || S <= 0) return 0;
  if (Math.abs(L) < 1e-4) return Math.log(val / M) / S;
  return (Math.pow(val / M, L) - 1) / (L * S);
}

async function runValidation() {
  console.log('================================================================================');
  console.log('QUANTIFIED VALIDATION: CALIBRATED FENTON 2013 VS PEDITOOLS REFERENCE CALCULATOR');
  console.log('================================================================================\n');

  let maxWeightZDiff = 0;
  let maxLengthZDiff = 0;
  let maxHeadZDiff = 0;
  let testCount = 0;

  for (const sex of ['male', 'female']) {
    console.log(`--- Checking ${sex.toUpperCase()} ---`);
    const points = fentonData[sex];

    for (const age of testAges) {
      const pt = points.find(p => p.age === age);

      // Test p3, p10, p50, p90, p97 for weight
      const weightTests = [
        { label: 'p3', val: pt.weight.p3 },
        { label: 'p10', val: pt.weight.p10 },
        { label: 'p50', val: pt.weight.p50 },
        { label: 'p90', val: pt.weight.p90 },
        { label: 'p97', val: pt.weight.p97 },
      ];
      for (const wt of weightTests) {
        testCount++;
        const pRes = await queryPedi(sex, age, wt.val, null, null);
        const engineZ = calcZ(wt.val, pt.weight);
        const zDiff = Math.abs(engineZ - pRes.Weight.z);
        if (zDiff > maxWeightZDiff) maxWeightZDiff = zDiff;
      }

      // Test p50 for length and head
      testCount += 2;
      const lhRes = await queryPedi(sex, age, null, pt.length.p50, pt.headCircumference.p50);
      const engLZ = calcZ(pt.length.p50, pt.length);
      const engHZ = calcZ(pt.headCircumference.p50, pt.headCircumference);
      const lDiff = Math.abs(engLZ - lhRes.Length.z);
      const hDiff = Math.abs(engHZ - lhRes.Head.z);
      if (lDiff > maxLengthZDiff) maxLengthZDiff = lDiff;
      if (hDiff > maxHeadZDiff) maxHeadZDiff = hDiff;

      console.log(`Age ${age}w: Weight maxZDiff=${maxWeightZDiff.toFixed(2)}, Length Diff=${lDiff.toFixed(2)}, HC Diff=${hDiff.toFixed(2)}`);
    }
  }

  console.log('\n================================================================================');
  console.log(`SUMMARY: ${testCount} comparisons executed.`);
  console.log(`Max Weight Z-score deviation: ${maxWeightZDiff.toFixed(3)} SD`);
  console.log(`Max Length Z-score deviation: ${maxLengthZDiff.toFixed(3)} SD`);
  console.log(`Max Head Circumference Z-score deviation: ${maxHeadZDiff.toFixed(3)} SD`);
  console.log('================================================================================');
}

runValidation().catch(e => console.error(e));
