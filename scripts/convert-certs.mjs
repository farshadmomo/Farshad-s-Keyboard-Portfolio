// One-off: render page 1 of each certificate PDF to a PNG so the cards can show
// the certificate visually. Run: `node scripts/convert-certs.mjs`
import { pdf } from "pdf-to-img";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const SRC = "public/certificates";
const OUT = "public/certificates/img";

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => f.toLowerCase().endsWith(".pdf"));

for (const file of files) {
  const document = await pdf(join(SRC, file), { scale: 2.5 });
  const page = await document.getPage(1); // first page = the certificate
  const out = join(OUT, basename(file, extname(file)) + ".png");
  await writeFile(out, page);
  console.log("wrote", out);
}
console.log(`done — ${files.length} certificates`);
