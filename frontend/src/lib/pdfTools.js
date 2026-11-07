// Browser-side PDF processing. Files never leave the visitor's device.
export const LIMITS = { maxFileMB: 10, maxImages: 20, maxPages: 500 };

export const MESSAGES = {
  tooLarge: "File exceeds the 10 MB limit. Please upload a smaller file.",
  tooMany: "You can upload a maximum of 20 images at a time.",
  unsupported: "This file format is not supported. Please select a supported file.",
  empty: "Please select at least one file to continue.",
};

export class ToolError extends Error {}

const bytesOf = async (file) => new Uint8Array(await file.arrayBuffer());
const isPdf = (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;
const imageType = (b) => {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  return null;
};

export function checkFile(file, kind) {
  const name = file.name.toLowerCase();
  const okType = kind === "image"
    ? /\.(jpe?g|png)$/.test(name) || ["image/jpeg", "image/png"].includes(file.type)
    : name.endsWith(".pdf") || file.type === "application/pdf";
  if (!okType) return MESSAGES.unsupported;
  if (file.size > LIMITS.maxFileMB * 1024 * 1024) return MESSAGES.tooLarge;
  if (file.size === 0) return MESSAGES.unsupported;
  return "";
}

async function openPdf(file) {
  const { PDFDocument } = await import("pdf-lib");
  if (file.size > LIMITS.maxFileMB * 1024 * 1024) throw new ToolError(MESSAGES.tooLarge);
  const bytes = await bytesOf(file);
  if (!isPdf(bytes)) throw new ToolError(`"${file.name}" is not a valid PDF document.`);
  let doc;
  try {
    doc = await PDFDocument.load(bytes);
  } catch (e) {
    if (/encrypt/i.test(e.message)) throw new ToolError("Password-protected PDFs are not supported. Please unlock the file first.");
    throw new ToolError(`"${file.name}" is corrupted or unreadable.`);
  }
  const n = doc.getPageCount();
  if (n === 0) throw new ToolError("The PDF has no pages.");
  if (n > LIMITS.maxPages) throw new ToolError(`PDF exceeds the ${LIMITS.maxPages}-page limit.`);
  return { doc, bytes };
}

function toInt(x) {
  if (!/^\d+$/.test(x)) throw new ToolError(`'${x}' is not a valid page number.`);
  return parseInt(x, 10);
}

export function parsePages(spec, total) {
  const out = [];
  for (const part of String(spec).replace(/\s/g, "").split(",")) {
    if (!part) continue;
    const [a, b] = part.includes("-") ? part.split("-", 2) : [part, part];
    const start = toInt(a);
    const end = toInt(b);
    if (start > end) throw new ToolError(`Invalid range '${part}'.`);
    if (start < 1 || end > total) throw new ToolError(`Page number out of range (document has ${total} pages).`);
    for (let p = start; p <= end; p++) out.push(p - 1);
  }
  if (!out.length) throw new ToolError("Please enter at least one page number.");
  return out;
}

const pdfBlob = (bytes) => new Blob([bytes], { type: "application/pdf" });

async function copyInto(src, indices) {
  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  return out;
}

async function merge(files) {
  if (files.length < 2) throw new ToolError("Please upload at least two PDF files to merge.");
  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.create();
  for (const f of files) {
    const { doc } = await openPdf(f);
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return { blob: pdfBlob(await out.save()), name: "merged.pdf" };
}

async function split([file], { mode, ranges }) {
  const { doc } = await openPdf(file);
  const total = doc.getPageCount();
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  if (mode === "ranges" && String(ranges || "").trim()) {
    for (const part of ranges.replace(/\s/g, "").split(",").filter(Boolean)) {
      const idx = parsePages(part, total);
      const out = await copyInto(doc, idx);
      zip.file(`pages_${idx[0] + 1}-${idx[idx.length - 1] + 1}.pdf`, await out.save());
    }
  } else {
    for (let i = 0; i < total; i++) {
      const out = await copyInto(doc, [i]);
      zip.file(`page_${i + 1}.pdf`, await out.save());
    }
  }
  return { blob: await zip.generateAsync({ type: "blob" }), name: "split_pages.zip" };
}

async function removePages([file], { pages }) {
  const { doc } = await openPdf(file);
  const total = doc.getPageCount();
  const drop = new Set(parsePages(pages, total));
  if (drop.size >= total) throw new ToolError("You cannot remove every page.");
  const keep = doc.getPageIndices().filter((i) => !drop.has(i));
  const out = await copyInto(doc, keep);
  return { blob: pdfBlob(await out.save()), name: "edited.pdf" };
}

async function organize([file], { order }) {
  const { doc } = await openPdf(file);
  const total = doc.getPageCount();
  const idx = String(order || "").replace(/\s/g, "").split(",").filter(Boolean).map((x) => toInt(x) - 1);
  if (!idx.length) throw new ToolError("No page order provided.");
  if (idx.some((p) => p < 0 || p >= total)) throw new ToolError(`Page number out of range (document has ${total} pages).`);
  const out = await copyInto(doc, idx);
  return { blob: pdfBlob(await out.save()), name: "organized.pdf" };
}

async function rotate([file], { angle, pages }) {
  const { degrees } = await import("pdf-lib");
  const { doc } = await openPdf(file);
  const total = doc.getPageCount();
  const target = String(pages || "").trim() ? new Set(parsePages(pages, total)) : null;
  doc.getPages().forEach((p, i) => {
    if (!target || target.has(i)) p.setRotation(degrees((p.getRotation().angle + Number(angle || 90)) % 360));
  });
  return { blob: pdfBlob(await doc.save()), name: "rotated.pdf" };
}

async function jpgToPdf(files) {
  if (!files.length) throw new ToolError(MESSAGES.empty);
  if (files.length > LIMITS.maxImages) throw new ToolError(MESSAGES.tooMany);
  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.create();
  for (const f of files) {
    if (f.size > LIMITS.maxFileMB * 1024 * 1024) throw new ToolError(MESSAGES.tooLarge);
    const b = await bytesOf(f);
    const type = imageType(b);
    if (!type) throw new ToolError(`"${f.name}": ${MESSAGES.unsupported}`);
    let img;
    try {
      img = type === "jpg" ? await out.embedJpg(b) : await out.embedPng(b);
    } catch {
      throw new ToolError(`"${f.name}" could not be read as an image.`);
    }
    const w = img.width * 0.75;
    const h = img.height * 0.75;
    out.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h });
  }
  return { blob: pdfBlob(await out.save()), name: "images.pdf" };
}

async function rasterize(bytes, scale, quality) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const { PDFDocument } = await import("pdf-lib");
  const src = await pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
  const out = await PDFDocument.create();
  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const jpg = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    const img = await out.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
    out.addPage([base.width, base.height]).drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
    canvas.width = 0;
  }
  return out.save();
}

async function compress([file], { level }) {
  const { doc, bytes } = await openPdf(file);
  const result = level === "low"
    ? await doc.save({ useObjectStreams: true })
    : await rasterize(bytes, level === "high" ? 1.0 : 1.5, level === "high" ? 0.5 : 0.7);
  if (result.length >= bytes.length) {
    return { blob: pdfBlob(bytes), name: "compressed.pdf", note: "This PDF is already well optimized, so your original file is returned unchanged." };
  }
  return { blob: pdfBlob(result), name: "compressed.pdf" };
}

const RUNNERS = {
  merge, split, compress, organize, rotate,
  "remove-pages": removePages,
  "jpg-to-pdf": jpgToPdf,
};

export async function runTool(endpoint, files, opts) {
  if (!files.length) throw new ToolError(MESSAGES.empty);
  const fn = RUNNERS[endpoint];
  if (!fn) throw new ToolError("This tool is not available yet.");
  return fn(files, opts);
}
