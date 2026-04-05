// scripts/generate-icons.cjs
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="115" fill="#4f46e5"/>
  <path d="M 320 80 L 210 280 L 270 280 L 190 430 L 380 210 L 310 210 Z" fill="white"/>
</svg>`;

const svgBuffer = Buffer.from(svgContent);

async function generate() {
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const sizes = [16, 32, 180, 192, 512];
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Explicit named copies used by manifest
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));

  // Apple touch icon at root of public
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  // Favicon PNG
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(__dirname, '../public/favicon.png'));

  console.log('All icons generated!');
}

generate().catch(console.error);
