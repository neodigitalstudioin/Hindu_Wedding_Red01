const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\supri\\.gemini\\antigravity-ide\\brain\\e3f459c6-c621-45be-af8d-2dd3c0a68ace\\ganapathi_emblem_1791366299117.jpg';
const outputPath = 'c:\\Users\\supri\\Desktop\\New folder\\assets\\ganapathi.png';

const jpegData = fs.readFileSync(inputPath);
const rawImageData = jpeg.decode(jpegData, { useTArray: true });

const width = rawImageData.width;
const height = rawImageData.height;
const png = new PNG({ width, height });

// Convert dark background to transparent alpha
// Gold linework has high luminance, dark background is close to 0-35
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const r = rawImageData.data[idx];
    const g = rawImageData.data[idx + 1];
    const b = rawImageData.data[idx + 2];

    // Compute brightness / max channel
    const maxVal = Math.max(r, g, b);
    
    // Background threshold
    if (maxVal < 38) {
      png.data[idx] = 0;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = 0;
    } else {
      // Calculate alpha based on luminance for smooth anti-aliased edge
      const alpha = Math.min(255, Math.floor(((maxVal - 35) / (255 - 35)) * 255 * 1.3));
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = alpha;
    }
  }
}

const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log('Successfully generated transparent Ganapathi PNG at', outputPath, 'Size:', buffer.length);
