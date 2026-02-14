const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Sprite sheet configurations
const spriteConfigs = [
  {
    file: 'icons-gradient-set1.png',
    cols: 4,
    rows: 2,
    icons: [
      { name: 'naruto', row: 0, col: 0 },
      { name: 'driving', row: 0, col: 1 },
      { name: 'arcade', row: 0, col: 2 },
      { name: 'popcorn', row: 1, col: 0 },
      { name: 'coke', row: 1, col: 1 },
      { name: 'flower', row: 1, col: 2 },
    ]
  },
  {
    file: 'icons-gradient-set2.png',
    cols: 3,
    rows: 2,
    icons: [
      { name: 'photos', row: 0, col: 0 },
      { name: 'love', row: 0, col: 1 },
      { name: 'cuddle', row: 0, col: 2 },
      { name: 'movies', row: 1, col: 0 },
      { name: 'anime', row: 1, col: 1 },
      { name: 'drama', row: 1, col: 2 },
    ]
  },
  {
    file: 'icons-gradient-set3.png',
    cols: 3,
    rows: 2,
    icons: [
      { name: 'speech', row: 0, col: 0 },
      { name: 'hug', row: 0, col: 1 },
      { name: 'mute', row: 0, col: 2 },
      { name: 'sleep', row: 1, col: 0 },
      { name: 'phone', row: 1, col: 1 },
      { name: 'cold', row: 1, col: 2 },
    ]
  },
  {
    file: 'icons-gradient-set4.png',
    cols: 3,
    rows: 2,
    icons: [
      { name: 'planner', row: 0, col: 0 },
      { name: 'thinker', row: 0, col: 1 },
      { name: 'adventure', row: 0, col: 2 },
      { name: 'nature', row: 1, col: 0 },
      { name: 'clothes', row: 1, col: 1 },
      { name: 'bathtub', row: 1, col: 2 },
    ]
  },
  {
    file: 'icons-gradient-set5.png',
    cols: 3,
    rows: 2,
    icons: [
      { name: 'ninja', row: 0, col: 0 },
      { name: 'kunai', row: 0, col: 1 },
      { name: 'shuriken', row: 0, col: 2 },
      { name: 'scroll', row: 1, col: 0 },
      { name: 'chest', row: 1, col: 1 },
      { name: 'sparkle', row: 1, col: 2 },
    ]
  },
  {
    file: 'icons-gradient-set6.png',
    cols: 3,
    rows: 2,
    icons: [
      { name: 'storm', row: 0, col: 0 },
      { name: 'together', row: 0, col: 1 },
      { name: 'treasure', row: 0, col: 2 },
      { name: 'heart1', row: 1, col: 0 },
      { name: 'heart2', row: 1, col: 1 },
      { name: 'heart3', row: 1, col: 2 },
    ]
  },
  {
    file: 'icons-gradient-hearts.png',
    cols: 3,
    rows: 2,
    icons: [
      { name: 'heart4', row: 0, col: 0 },
      { name: 'heart5', row: 0, col: 1 },
      { name: 'heart6', row: 0, col: 2 },
      { name: 'heart7', row: 1, col: 0 },
      { name: 'heart8', row: 1, col: 1 },
      { name: 'heart9', row: 1, col: 2 },
    ]
  },
];

const iconsDir = path.join(__dirname, '../public/icons');

async function extractIcons() {
  console.log('Starting icon extraction...\n');

  for (const config of spriteConfigs) {
    const spriteSheetPath = path.join(iconsDir, config.file);
    
    if (!fs.existsSync(spriteSheetPath)) {
      console.log(`⚠️  Skipping ${config.file} (file not found)`);
      continue;
    }

    console.log(`Processing ${config.file}...`);
    
    // Get sprite sheet dimensions
    const metadata = await sharp(spriteSheetPath).metadata();
    const iconWidth = Math.floor(metadata.width / config.cols);
    const iconHeight = Math.floor(metadata.height / config.rows);
    
    console.log(`  Sheet size: ${metadata.width}x${metadata.height}`);
    console.log(`  Icon size: ${iconWidth}x${iconHeight}`);
    
    // Extract each icon
    for (const icon of config.icons) {
      const left = icon.col * iconWidth;
      const top = icon.row * iconHeight;
      
      const outputPath = path.join(iconsDir, `${icon.name}.png`);
      
      await sharp(spriteSheetPath)
        .extract({
          left: left,
          top: top,
          width: iconWidth,
          height: iconHeight,
        })
        .toFile(outputPath);
      
      console.log(`  ✓ Extracted ${icon.name}.png`);
    }
    
    console.log('');
  }

  console.log('✅ Icon extraction complete!');
}

// Run the extraction
extractIcons().catch(err => {
  console.error('❌ Error extracting icons:', err);
  process.exit(1);
});
