// Central definition of every PDF tool: routing, SEO content, options schema.
import {
  Combine, Minimize2, Scissors, FileX2, LayoutGrid, Image as ImageIcon,
  FileType2, RotateCw,
} from "lucide-react";

export const CATEGORIES = [
  { id: "organize", label: "Organize PDF" },
  { id: "optimize", label: "Optimize PDF" },
  { id: "convert", label: "Convert PDF" },
  { id: "edit", label: "Edit PDF" },
];

const ALL_TOOLS = [
  {
    slug: "merge-pdf",
    endpoint: "merge",
    name: "Merge PDF",
    tagline: "Combine multiple PDFs into one file",
    category: "organize",
    icon: Combine,
    color: "#4F46E5",
    accept: ".pdf",
    multiple: true,
    minFiles: 2,
    fileKind: "pdf",
    options: [],
    seoTitle: "Merge PDF — Combine PDF Files Online Free | mycrushpdf",
    seoDescription:
      "Merge two or more PDF files into a single document online. Fast, secure and free. No signup, no watermark. Reorder files before combining.",
    intro:
      "Merge PDF lets you combine several PDF documents into one organized file in seconds. Drop your files, arrange them in the order you want and download a single merged PDF.",
    steps: [
      "Upload two or more PDF files using the upload area or drag and drop.",
      "Drag the file cards to arrange them in your preferred order.",
      "Click Merge PDF. Your browser combines them on your device.",
      "Download your single merged PDF file.",
    ],
    formats: "Input: PDF. Output: a single PDF.",
    limitations:
      "Files up to 10 MB each and 500 pages per file. Password-protected PDFs must be unlocked first.",
    example:
      "Combine a cover letter, a resume and a portfolio into one PDF before emailing a job application.",
    faqs: [
      { q: "Is there a limit on how many PDFs I can merge?", a: "You can merge many files in one go, as long as each file is within the 10 MB and 500-page limits." },
      { q: "Will the quality change after merging?", a: "No. Merging copies pages as-is without recompressing text or images." },
      { q: "Are my files kept private?", a: "Yes. The file is processed in your own browser and is never uploaded to our servers." },
    ],
    related: ["organize-pdf", "split-pdf", "compress-pdf"],
  },
  {
    slug: "compress-pdf",
    endpoint: "compress",
    name: "Compress PDF",
    tagline: "Reduce PDF file size while keeping quality",
    category: "optimize",
    icon: Minimize2,
    color: "#0EA5E9",
    accept: ".pdf",
    multiple: false,
    fileKind: "pdf",
    optionNote: "Less compression keeps your PDF exactly as it is and only removes wasted space. Recommended and Strong compression turn each page into an optimized image, so text will no longer be selectable or searchable.",
    options: [
      {
        key: "level", type: "select", label: "Compression level", default: "medium",
        choices: [
          { value: "low", label: "Less compression (best quality)" },
          { value: "medium", label: "Recommended (good balance)" },
          { value: "high", label: "Strong compression (smallest size)" },
        ],
      },
    ],
    seoTitle: "Compress PDF — Reduce PDF File Size Online | mycrushpdf",
    seoDescription:
      "Compress PDF files online to reduce size for email and upload. Choose a compression level to balance quality and file size. Free and secure.",
    intro:
      "Compress PDF makes your document smaller so it is easier to email, upload and store. Everything happens in your browser: choose a light, lossless clean-up, or a stronger setting that re-renders each page as an optimized image.",
    steps: [
      "Upload a single PDF file.",
      "Choose a compression level that fits your needs.",
      "Click Compress PDF to process the document.",
      "Download the smaller, optimized PDF.",
    ],
    formats: "Input: PDF. Output: an optimized PDF.",
    limitations:
      "Files up to 10 MB and 500 pages. Text-only PDFs may already be small and compress less.",
    example:
      "Shrink a scanned 8 MB application form so it fits under a 2 MB upload limit on a government or job portal.",
    faqs: [
      { q: "How much smaller will my PDF be?", a: "It depends on the content. Scanned and photo-heavy PDFs usually shrink a lot. If a PDF cannot be made smaller, we return your original file unchanged and tell you." },
      { q: "Will my text stay selectable?", a: "With Less compression, yes: the PDF is kept as-is. Recommended and Strong compression convert each page into an image, so text stays readable but can no longer be selected or searched." },
      { q: "Can I compress a scanned document?", a: "Yes. Scanned PDFs are mostly images, so they usually see the biggest size reduction." },
    ],
    related: ["merge-pdf", "split-pdf", "rotate-pdf"],
  },
  {
    slug: "split-pdf",
    endpoint: "split",
    name: "Split PDF",
    tagline: "Separate a PDF into multiple files",
    category: "organize",
    icon: Scissors,
    color: "#8B5CF6",
    accept: ".pdf",
    multiple: false,
    fileKind: "pdf",
    outputIsZip: true,
    options: [
      {
        key: "mode", type: "select", label: "Split mode", default: "all",
        choices: [
          { value: "all", label: "Split every page into its own PDF" },
          { value: "ranges", label: "Split by custom page ranges" },
        ],
      },
      {
        key: "ranges", type: "text", label: "Page ranges", placeholder: "e.g. 1-3, 4-6, 7-10",
        default: "", showWhen: { mode: "ranges" },
        hint: "Comma-separated ranges. Each range becomes a separate PDF.",
      },
    ],
    seoTitle: "Split PDF — Separate PDF Pages Online Free | mycrushpdf",
    seoDescription:
      "Split a PDF into separate files by page or by custom ranges. Download all results in a ZIP. Fast, free and secure online PDF splitter.",
    intro:
      "Split PDF breaks a large document into smaller files. Split every page into its own PDF, or define custom page ranges to extract exactly the sections you need.",
    steps: [
      "Upload the PDF you want to split.",
      "Choose to split every page or define custom page ranges.",
      "Click Split PDF to process the document.",
      "Download a ZIP containing all the resulting PDF files.",
    ],
    formats: "Input: PDF. Output: a ZIP archive of PDF files.",
    limitations: "Files up to 10 MB and 500 pages. Ranges must be within the document's page count.",
    example: "Extract chapters 1–3 and 4–6 of an ebook into two separate PDFs.",
    faqs: [
      { q: "How are split files delivered?", a: "All resulting PDFs are bundled into a single ZIP file for easy download." },
      { q: "What format do page ranges use?", a: "Use comma-separated ranges like 1-3, 4-6. Each range is saved as its own PDF." },
      { q: "Can I split just one page out?", a: "Yes. Use a single number as a range, for example 5-5, or use remove pages for the opposite." },
    ],
    related: ["merge-pdf", "remove-pdf-pages", "organize-pdf"],
  },
  {
    slug: "remove-pdf-pages",
    endpoint: "remove-pages",
    name: "Remove PDF Pages",
    tagline: "Delete unwanted pages from a PDF",
    category: "edit",
    icon: FileX2,
    color: "#EF4444",
    accept: ".pdf",
    multiple: false,
    fileKind: "pdf",
    options: [
      {
        key: "pages", type: "text", label: "Pages to remove", placeholder: "e.g. 2, 5, 8-10",
        default: "", required: true,
        hint: "Comma-separated page numbers or ranges to delete.",
      },
    ],
    seoTitle: "Remove PDF Pages — Delete Pages From PDF Online | mycrushpdf",
    seoDescription:
      "Delete specific pages from a PDF online. Remove blank, duplicate or unwanted pages by number or range. Free, fast and secure.",
    intro:
      "Remove PDF Pages deletes the pages you don't need and rebuilds a clean document with the remaining pages in their original order.",
    steps: [
      "Upload your PDF file.",
      "Enter the page numbers or ranges you want to remove.",
      "Click Remove Pages to process the document.",
      "Download the edited PDF.",
    ],
    formats: "Input: PDF. Output: a PDF without the removed pages.",
    limitations: "Files up to 10 MB and 500 pages. You cannot remove every page.",
    example: "Delete blank pages 2 and 7 from a scanned document before sharing it.",
    faqs: [
      { q: "How do I specify pages?", a: "Enter page numbers or ranges separated by commas, such as 2, 5, 8-10." },
      { q: "Does this change the remaining pages?", a: "No. Remaining pages keep their original order and content." },
      { q: "Can I remove the first and last page together?", a: "Yes, list both, for example 1, 12 for a 12-page document." },
    ],
    related: ["split-pdf", "organize-pdf", "merge-pdf"],
  },
  {
    slug: "organize-pdf",
    endpoint: "organize",
    name: "Organize PDF",
    tagline: "Reorder and arrange PDF pages",
    category: "organize",
    icon: LayoutGrid,
    color: "#F59E0B",
    accept: ".pdf",
    multiple: false,
    fileKind: "pdf",
    options: [
      {
        key: "order", type: "text", label: "New page order", placeholder: "e.g. 3, 1, 2, 4",
        default: "", required: true,
        hint: "List every page number in the order you want them to appear.",
      },
    ],
    seoTitle: "Organize PDF — Reorder PDF Pages Online Free | mycrushpdf",
    seoDescription:
      "Reorder and rearrange the pages of your PDF online. Define a custom page order and download the organized document. Free and secure.",
    intro:
      "Organize PDF lets you rearrange pages into any order you like. Specify the sequence and we rebuild your document with the pages in that exact order.",
    steps: [
      "Upload the PDF you want to reorganize.",
      "Enter the new page order as a comma-separated list.",
      "Click Organize PDF to rebuild the document.",
      "Download the reorganized PDF.",
    ],
    formats: "Input: PDF. Output: a reordered PDF.",
    limitations: "Files up to 10 MB and 500 pages. Every page number must be within range.",
    example: "Move a signature page to the front by entering 5, 1, 2, 3, 4.",
    faqs: [
      { q: "How do I set the order?", a: "Enter every page number once, in the sequence you want, separated by commas." },
      { q: "Can I repeat or drop pages?", a: "Use Organize to reorder. To drop pages use Remove PDF Pages instead." },
      { q: "Is the content preserved?", a: "Yes, pages are rearranged without altering their content." },
    ],
    related: ["remove-pdf-pages", "split-pdf", "merge-pdf"],
  },
  {
    slug: "jpg-to-pdf",
    endpoint: "jpg-to-pdf",
    name: "JPG to PDF",
    tagline: "Convert images into a PDF document",
    category: "convert",
    icon: ImageIcon,
    color: "#10B981",
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    multiple: true,
    minFiles: 1,
    fileKind: "image",
    options: [],
    seoTitle: "JPG to PDF — Convert Images to PDF Online Free | mycrushpdf",
    seoDescription:
      "Convert JPG and PNG images into a single PDF online. Combine multiple photos into one document. Free, fast and secure.",
    intro:
      "JPG to PDF turns your images into a clean PDF document. Upload one or many photos, arrange them, and download them as a single PDF — perfect for IDs, receipts and scans.",
    steps: [
      "Upload one or more JPG or PNG images.",
      "Drag the image cards to set the page order.",
      "Click Convert to PDF to build the document.",
      "Download your images as a single PDF.",
    ],
    formats: "Input: JPG and PNG images. Output: a single PDF.",
    limitations: "Up to 20 JPG or PNG images per batch, each up to 10 MB. Each image becomes one page at its native size.",
    example: "Combine photos of a receipt, an ID card and a form into one PDF for an application.",
    faqs: [
      { q: "Which image formats are supported?", a: "JPG and PNG are supported. Convert other formats such as HEIC or WebP to JPG first." },
      { q: "Can I control the page order?", a: "Yes. Drag the image cards to arrange them before converting." },
      { q: "Does each image become a page?", a: "Yes. Every uploaded image becomes one page in the resulting PDF." },
    ],
    related: ["merge-pdf", "compress-pdf", "rotate-pdf"],
  },
  {
    slug: "pdf-to-word",
    serverOnly: true,
    endpoint: "pdf-to-word",
    name: "PDF to Word",
    tagline: "Convert PDF into an editable Word document",
    category: "convert",
    icon: FileType2,
    color: "#2563EB",
    accept: ".pdf",
    multiple: false,
    fileKind: "pdf",
    options: [],
    seoTitle: "PDF to Word — Convert PDF to Editable DOCX Online | mycrushpdf",
    seoDescription:
      "Convert PDF to an editable Word (DOCX) document online. Keep text and layout where possible. Free, fast and secure PDF to Word converter.",
    intro:
      "PDF to Word converts your document into an editable .docx file, preserving text and layout where possible so you can make quick edits in Microsoft Word or Google Docs.",
    steps: [
      "Upload the PDF you want to convert.",
      "Click Convert to Word to start processing.",
      "Wait while the document is rebuilt as DOCX.",
      "Download your editable Word file.",
    ],
    formats: "Input: PDF with selectable text. Output: Word .docx.",
    limitations:
      "Works best on text-based PDFs. Scanned or image-only PDFs may not convert well without OCR (coming soon).",
    example: "Turn a PDF report into a Word document so you can update a few paragraphs.",
    faqs: [
      { q: "Will my formatting be preserved?", a: "Text and layout are preserved where possible. Complex designs may shift slightly." },
      { q: "Can I convert a scanned PDF?", a: "Scanned PDFs are images, so conversion is limited. OCR support is planned in a future release." },
      { q: "What file do I get?", a: "A standard .docx file that opens in Word, Google Docs and LibreOffice." },
    ],
    related: ["compress-pdf", "merge-pdf", "jpg-to-pdf"],
  },
  {
    slug: "rotate-pdf",
    endpoint: "rotate",
    name: "Rotate PDF",
    tagline: "Rotate PDF pages to the correct orientation",
    category: "edit",
    icon: RotateCw,
    color: "#DB2777",
    accept: ".pdf",
    multiple: false,
    fileKind: "pdf",
    options: [
      {
        key: "angle", type: "select", label: "Rotation", default: "90",
        choices: [
          { value: "90", label: "90° clockwise" },
          { value: "180", label: "180°" },
          { value: "270", label: "90° counter-clockwise" },
        ],
      },
      {
        key: "pages", type: "text", label: "Pages to rotate (optional)", placeholder: "Leave blank for all pages",
        default: "", hint: "Comma-separated pages or ranges. Blank rotates every page.",
      },
    ],
    seoTitle: "Rotate PDF — Rotate PDF Pages Online Free | mycrushpdf",
    seoDescription:
      "Rotate PDF pages 90, 180 or 270 degrees online. Fix sideways or upside-down scans and save the corrected PDF. Free and secure.",
    intro:
      "Rotate PDF fixes the orientation of your pages. Turn sideways scans upright or flip upside-down pages, for all pages or just the ones you choose.",
    steps: [
      "Upload your PDF file.",
      "Choose the rotation angle.",
      "Optionally specify which pages to rotate.",
      "Click Rotate PDF and download the corrected file.",
    ],
    formats: "Input: PDF. Output: a rotated PDF.",
    limitations: "Files up to 10 MB and 500 pages.",
    example: "Rotate a landscape scan 90° so it displays upright on every device.",
    faqs: [
      { q: "Can I rotate only some pages?", a: "Yes. Enter the specific pages or ranges, or leave the field blank to rotate all pages." },
      { q: "What angles are available?", a: "You can rotate 90°, 180° or 270°." },
      { q: "Does rotating reduce quality?", a: "No. Rotation changes orientation only and does not affect quality." },
    ],
    related: ["organize-pdf", "merge-pdf", "split-pdf"],
  },
];

// PDF to Word needs a server converter, so it stays hidden on the free static deployment.
export const TOOLS = ALL_TOOLS.filter((t) => !t.serverOnly);

export const POPULAR_SLUGS = ["merge-pdf", "compress-pdf", "split-pdf", "remove-pdf-pages", "organize-pdf", "jpg-to-pdf"];

export function getTool(slug) {
  return TOOLS.find((t) => t.slug === slug);
}
