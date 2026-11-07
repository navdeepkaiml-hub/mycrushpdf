// Blog articles. Original, hand-written guides. Body is an array of blocks.
export const ARTICLES = [
  {
    slug: "how-to-merge-pdf-files-online",
    title: "How to Merge PDF Files Online",
    description:
      "A step-by-step guide to combining multiple PDF documents into one file online, with tips on ordering, quality and privacy.",
    category: "Guides",
    readingTime: "4 min read",
    updated: "2026-01-12",
    tool: "merge-pdf",
    body: [
      { type: "p", text: "Combining several PDFs into a single document is one of the most common office tasks. Whether you are assembling a report, a set of invoices or a job application, a single file is easier to send, print and archive than a dozen separate ones. This guide walks through merging PDFs online with mycrushpdf and shares a few tips to get a clean result." },
      { type: "h2", text: "When you should merge PDFs" },
      { type: "p", text: "Merging makes sense whenever the order and grouping of documents matters. Common examples include a cover letter followed by a resume, a contract plus its appendices, or monthly statements collected into a yearly archive." },
      { type: "h2", text: "Step-by-step: merging PDFs" },
      { type: "ol", items: [
        "Open the Merge PDF tool and drag your files into the upload area.",
        "Review the file cards and use the up and down arrows to set the correct order.",
        "Click Merge PDF. Your browser combines them on your device.",
        "Download your single, merged PDF.",
      ] },
      { type: "h2", text: "Tips for a clean merge" },
      { type: "ul", items: [
        "Name files with a number prefix (01, 02, 03) so the order is obvious.",
        "Remove blank or duplicate pages first with the Remove Pages tool.",
        "If the final file is large, run it through Compress PDF afterwards.",
      ] },
      { type: "h2", text: "Is merging safe?" },
      { type: "p", text: "With mycrushpdf, merging happens in your browser, so your files are not uploaded to our servers. As with any website, use an up-to-date browser and avoid shared computers for confidential documents." },
      { type: "p", text: "Ready to try it? Head to the Merge PDF tool and combine your first documents in seconds." },
    ],
  },
  {
    slug: "how-to-compress-pdf-without-losing-quality",
    title: "How to Compress PDF Without Losing Too Much Quality",
    description:
      "Learn how PDF compression works, how to pick the right level, and how to shrink file size while keeping documents readable.",
    category: "Guides",
    readingTime: "5 min read",
    updated: "2026-01-14",
    tool: "compress-pdf",
    body: [
      { type: "p", text: "Large PDFs are a nuisance: they bounce off email size limits, upload slowly and fill up storage. The good news is that most PDFs can be made dramatically smaller without a noticeable drop in quality. This guide explains how compression works and how to choose a level that balances size and clarity." },
      { type: "h2", text: "Why PDFs get large" },
      { type: "p", text: "Most of a PDF's weight comes from embedded images — especially scans and photos. Text and vector graphics are already compact. That is why an image-heavy brochure can be ten times larger than a text report with the same page count." },
      { type: "h2", text: "How compression works" },
      { type: "p", text: "PDFs get large mainly because of high-resolution images and inefficient internal structure. On mycrushpdf, Less compression rewrites the file structure without touching content (lossless). Recommended and Strong compression render every page as an optimized JPEG image. That shrinks scans and photo-heavy files a lot, but text is no longer selectable, so keep your original if you need to copy or search text." },
      { type: "h2", text: "Choosing the right level" },
      { type: "ul", items: [
        "Less compression: best for documents you will print or that contain detailed images.",
        "Recommended: a good balance for everyday sharing and email.",
        "Strong compression: smallest size, ideal for screen-only reading and quick uploads.",
      ] },
      { type: "h2", text: "Step-by-step" },
      { type: "ol", items: [
        "Open the Compress PDF tool and upload your file.",
        "Pick a compression level.",
        "Click Compress PDF and wait for processing.",
        "Download and check the result; try a different level if needed.",
      ] },
      { type: "h2", text: "A realistic expectation" },
      { type: "p", text: "Text-only PDFs may barely shrink because there is little to optimize. Scanned and photo-heavy PDFs often shrink by half or more. Always open the result to confirm it still looks good before sending." },
    ],
  },
  {
    slug: "how-to-split-pdf-pages",
    title: "How to Split PDF Pages",
    description:
      "Split a large PDF into separate files by page or by custom ranges, and download everything neatly in a ZIP.",
    category: "Guides",
    readingTime: "4 min read",
    updated: "2026-01-15",
    tool: "split-pdf",
    body: [
      { type: "p", text: "Sometimes you only need part of a PDF, or you want to break a long document into manageable pieces. Splitting lets you separate pages into individual files or extract specific ranges. Here is how to do it quickly and correctly." },
      { type: "h2", text: "Two ways to split" },
      { type: "ul", items: [
        "Split every page: each page becomes its own one-page PDF.",
        "Split by ranges: define sections like 1-3 and 4-6 to extract specific chapters or parts.",
      ] },
      { type: "h2", text: "Step-by-step" },
      { type: "ol", items: [
        "Open the Split PDF tool and upload your document.",
        "Choose to split every page or define custom ranges.",
        "If using ranges, enter them comma-separated, for example 1-3, 4-6.",
        "Click Split PDF and download the ZIP containing your files.",
      ] },
      { type: "h2", text: "Understanding ranges" },
      { type: "p", text: "A range like 4-6 includes pages 4, 5 and 6 in one file. To pull a single page, use a range such as 5-5. Each range you list becomes a separate PDF inside the ZIP." },
      { type: "h2", text: "Split vs. remove pages" },
      { type: "p", text: "Use Split to keep sections as separate files. If instead you want one document with certain pages deleted, use the Remove PDF Pages tool." },
    ],
  },
  {
    slug: "how-to-convert-jpg-images-to-pdf",
    title: "How to Convert JPG Images to PDF",
    description:
      "Turn one or many photos into a single, shareable PDF, with tips on ordering, orientation and file size.",
    category: "Guides",
    readingTime: "4 min read",
    updated: "2026-01-16",
    tool: "jpg-to-pdf",
    body: [
      { type: "p", text: "Images are convenient to capture but awkward to share in bulk. Converting them to a single PDF makes photos of receipts, IDs, whiteboards and forms far easier to send and print. This guide shows how to convert JPG and PNG images into one tidy PDF." },
      { type: "h2", text: "Why convert images to PDF" },
      { type: "ul", items: [
        "One file instead of many attachments.",
        "Consistent page layout for printing.",
        "A professional look for applications and submissions.",
      ] },
      { type: "h2", text: "Step-by-step" },
      { type: "ol", items: [
        "Open the JPG to PDF tool and upload your images.",
        "Use the up and down arrows on each image to set the page order.",
        "Click Convert to PDF.",
        "Download the single combined PDF.",
      ] },
      { type: "h2", text: "Tips for good results" },
      { type: "ul", items: [
        "Rotate images to the correct orientation before converting.",
        "Crop out backgrounds so documents fill the page.",
        "If the PDF is large, compress it afterwards for easier emailing.",
      ] },
      { type: "p", text: "Each image becomes one page, so the order you set is the order you get. Arrange carefully before converting." },
    ],
  },
  {
    slug: "how-to-organize-and-remove-pdf-pages",
    title: "How to Organize and Remove PDF Pages",
    description:
      "Reorder pages into the perfect sequence and delete the ones you don't need, all online and in seconds.",
    category: "Guides",
    readingTime: "5 min read",
    updated: "2026-01-18",
    tool: "organize-pdf",
    tools: ["remove-pdf-pages"],
    body: [
      { type: "p", text: "A well-organized PDF reads better and looks more professional. Two tools make this easy: Organize PDF to rearrange pages, and Remove PDF Pages to delete the ones you don't want. This guide covers both." },
      { type: "h2", text: "Reordering pages" },
      { type: "p", text: "Organize PDF rebuilds your document in a page order you define. This is useful when a signature page belongs at the front, or when scanned pages came out in the wrong sequence." },
      { type: "ol", items: [
        "Open the Organize PDF tool and upload your file.",
        "Enter the new order as a comma-separated list, for example 3, 1, 2, 4.",
        "Click Organize PDF and download the result.",
      ] },
      { type: "h2", text: "Removing pages" },
      { type: "p", text: "Remove PDF Pages deletes specific pages and keeps the rest in their original order — ideal for dropping blank, duplicate or confidential pages." },
      { type: "ol", items: [
        "Open the Remove PDF Pages tool and upload your file.",
        "Enter the pages to delete, for example 2, 5, 8-10.",
        "Click Remove Pages and download the cleaned-up PDF.",
      ] },
      { type: "h2", text: "Combining the two" },
      { type: "p", text: "For a full cleanup, remove unwanted pages first, then organize the remaining pages into the ideal order. For splitting a document into multiple files instead, use the Split PDF tool." },
    ],
  },
];

export function getArticle(slug) {
  return ARTICLES.find((a) => a.slug === slug);
}
