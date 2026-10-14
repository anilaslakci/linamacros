import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Kullanım: node scripts/optimize-mascots.mjs <kaynak-klasör>");

const destination = path.join(process.cwd(), "src", "assets", "images", "mascots");
await mkdir(destination, { recursive: true });

const images = [
  { name: "lina-mascot-main", width: 720 },
  { name: "lina-mascot-faq-right", width: 520 },
  { name: "lina-mascot-support", width: 620 },
  { name: "lina-mascot-trust", width: 620 },
  { name: "lina-mascot-corner", width: 300 }
];

for (const image of images) {
  const png = path.join(source, `${image.name}.png`);
  const preserved = path.join(destination, `${image.name}.png`);
  const webp = path.join(destination, `${image.name}.webp`);
  await copyFile(png, preserved);
  await sharp(png)
    .resize({ width: image.width, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(webp);
  const metadata = await sharp(webp).metadata();
  const file = await stat(webp);
  console.log(`${path.basename(webp)}\t${metadata.width}x${metadata.height}\t${file.size} bytes`);
}
