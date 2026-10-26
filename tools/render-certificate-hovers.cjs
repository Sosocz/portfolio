// Flatten the existing certificate compositions, including their original blur.
// No layout, certificate, palette or hover timing is changed.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'dist/assets/certs/hover-blur');
const output = path.join(root, 'dist/assets/certs/hover-responsive');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  let originalBytes = 0, desktopBytes = 0, mobileBytes = 0;
  for (let n = 9; n <= 16; n++) {
    const id = String(n).padStart(2, '0');
    const input = path.join(source, n === 16 ? 'certificate-hover-16-microsoft.svg' : `certificate-hover-${id}.svg`);
    const data = fs.readFileSync(input);
    originalBytes += data.length;
    // librsvg does not decode embedded WebP on every host; normalize embedded
    // bitmaps to PNG before rasterizing, while retaining their exact pixels.
    let svg = data.toString('utf8');
    const embedded = [...new Set(svg.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g) || [])];
    for (const uri of embedded) {
      const png = await sharp(Buffer.from(uri.split(',')[1], 'base64')).png().toBuffer();
      svg = svg.split(uri).join('data:image/png;base64,' + png.toString('base64'));
    }
    const master = await sharp(Buffer.from(svg), { density: 72 }).png().toBuffer();
    const stats = await sharp(master).stats();
    if (!stats.channels.some(channel => channel.stdev > 10)) throw new Error(`Empty certificate render: ${id}`);
    for (const width of [640, 1000]) {
      const result = await sharp(master)
        .resize(width, Math.round(width * 1010 / 1000))
        .webp({ quality: 94, effort: 5, smartSubsample: true })
        .toFile(path.join(output, `certificate-hover-${id}-${width}.webp`));
      if (width === 1000) desktopBytes += result.size;
      else mobileBytes += result.size;
    }
  }
  console.log(JSON.stringify({ certificates: 8, originalBytes, desktopBytes, mobileBytes }));
})().catch(error => { console.error(error); process.exit(1); });
