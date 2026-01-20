import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'icons');

// Simple bell icon SVG with DinnDone colors
const createIconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <!-- Background circle - Sage Green -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#4F6E44"/>

  <!-- Bell body - Harvest Hug bg color -->
  <g transform="translate(${size * 0.15}, ${size * 0.12}) scale(${size/512 * 0.7})">
    <!-- Bell dome -->
    <path d="M256 64c-88.4 0-160 71.6-160 160v80c0 26.5-21.5 48-48 48h416c-26.5 0-48-21.5-48-48v-80c0-88.4-71.6-160-160-160z" fill="#FAF3E6"/>
    <!-- Bell bottom rim -->
    <ellipse cx="256" cy="368" rx="176" ry="32" fill="#FAF3E6"/>
    <!-- Bell clapper -->
    <circle cx="256" cy="416" r="32" fill="#E2A93B"/>
    <!-- Bell top -->
    <circle cx="256" cy="48" r="32" fill="#FAF3E6"/>
  </g>
</svg>
`;

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = createIconSvg(size);
    const outputPath = join(publicDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated ${outputPath}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
