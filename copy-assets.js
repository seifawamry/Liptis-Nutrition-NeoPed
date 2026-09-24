const fs = require('fs');
const path = require('path');

const srcLogo1 = 'C:/Users/seif.elawamry/.gemini/antigravity/brain/426d4ee4-852c-4045-bc85-d16ee0682636/.user_uploaded/media_1789902877557.png';
const srcLogo2 = 'C:/Users/seif.elawamry/.gemini/antigravity/brain/426d4ee4-852c-4045-bc85-d16ee0682636/.user_uploaded/media_1789902887415.png';

const targetDir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(srcLogo1, path.join(targetDir, 'liptis-nutrition.png'));
fs.copyFileSync(srcLogo2, path.join(targetDir, 'pediamil-lbw.png'));

console.log('Successfully copied logos to public/logos!');
