const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateFavicons() {
  const inputImage = path.join(__dirname, '../public/images/travel-rizz.png');
  const publicDir = path.join(__dirname, '../public');

  const sizes = [
    { size: 16, name: 'favicon.ico' },
    { size: 32, name: 'icon.png' },
    { size: 180, name: 'apple-icon.png' }
  ];

  for (const { size, name } of sizes) {
    // Create a rounded white background using SVG
    const cornerRadius = Math.floor(size * 0.2); // 20% corner radius
    const svgBackground = Buffer.from(`
      <svg width="${size}" height="${size}">
        <rect
          x="0"
          y="0"
          width="${size}"
          height="${size}"
          rx="${cornerRadius}"
          ry="${cornerRadius}"
          fill="white"
        />
      </svg>
    `);

    const background = await sharp(svgBackground)
      .png()
      .toBuffer();

    // Resize the logo with padding
    const resizedLogo = await sharp(inputImage)
      .resize(Math.floor(size * 0.99), Math.floor(size * 0.99), {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    // Composite the logo onto the rounded background
    await sharp(background)
      .composite([
        {
          input: resizedLogo,
          gravity: 'center'
        }
      ])
      .toFile(path.join(publicDir, name));
  }

  console.log('Favicons generated successfully!');
}

generateFavicons().catch(console.error);
