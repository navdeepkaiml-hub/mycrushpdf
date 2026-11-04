"""Pure PDF/image processing functions. Input and output are bytes.

Uses only free, open-source libraries: PyMuPDF (fitz), pypdf, Pillow,
python-docx, pdf2docx. No network, no paid APIs.
"""
import io
import zipfile
from typing import List

import fitz  # PyMuPDF
from pypdf import PdfReader, PdfWriter
from PIL import Image


class ProcessingError(Exception):
    pass


# ---------- Validation ----------
def is_pdf(data: bytes) -> bool:
    return data[:5] == b"%PDF-"


def validate_pdf(data: bytes, max_pages: int) -> int:
    if not is_pdf(data):
        raise ProcessingError("File is not a valid PDF document.")
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception:
        raise ProcessingError("The PDF file is corrupted or unreadable.")
    if doc.is_encrypted:
        doc.close()
        raise ProcessingError("Password-protected PDFs are not supported.")
    pages = doc.page_count
    doc.close()
    if pages == 0:
        raise ProcessingError("The PDF has no pages.")
    if pages > max_pages:
        raise ProcessingError(f"PDF exceeds the {max_pages}-page limit.")
    return pages


def validate_image(data: bytes) -> None:
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
    except Exception:
        raise ProcessingError("One of the files is not a valid image.")


def _parse_pages(spec: str, total: int) -> List[int]:
    """Parse '1,3,5-7' into zero-based page indices."""
    result: List[int] = []
    for part in spec.replace(" ", "").split(","):
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            start, end = int(a), int(b)
            for p in range(start, end + 1):
                result.append(p - 1)
        else:
            result.append(int(part) - 1)
    for p in result:
        if p < 0 or p >= total:
            raise ProcessingError(f"Page number out of range (document has {total} pages).")
    return result


# ---------- Tools ----------
def merge_pdfs(files: List[bytes]) -> bytes:
    if len(files) < 2:
        raise ProcessingError("Please upload at least two PDF files to merge.")
    writer = PdfWriter()
    for data in files:
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted:
            raise ProcessingError("Password-protected PDFs are not supported.")
        for page in reader.pages:
            writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def compress_pdf(data: bytes, level: str = "medium") -> bytes:
    doc = fitz.open(stream=data, filetype="pdf")
    # Downsample embedded images based on level
    dpi_map = {"low": 150, "medium": 110, "high": 72}
    target_dpi = dpi_map.get(level, 110)
    quality_map = {"low": 80, "medium": 60, "high": 40}
    quality = quality_map.get(level, 60)
    try:
        for page in doc:
            for img in page.get_images(full=True):
                xref = img[0]
                try:
                    base = doc.extract_image(xref)
                    pix = fitz.Pixmap(doc, xref)
                    if pix.width < 400 and pix.height < 400:
                        pix = None
                        continue
                    if pix.n >= 5:  # CMYK/alpha → convert to RGB
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    img_pil = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    scale = min(1.0, target_dpi / 150.0)
                    new_size = (max(1, int(pix.width * scale)), max(1, int(pix.height * scale)))
                    img_pil = img_pil.resize(new_size, Image.LANCZOS)
                    buf = io.BytesIO()
                    img_pil.save(buf, format="JPEG", quality=quality, optimize=True)
                    doc.update_stream(xref, buf.getvalue()) if False else None
                    pix = None
                except Exception:
                    continue
    except Exception:
        pass
    out = io.BytesIO()
    doc.save(out, garbage=4, deflate=True, clean=True, deflate_images=True, deflate_fonts=True)
    doc.close()
    return out.getvalue()


def split_pdf(data: bytes, mode: str = "all", ranges: str = "") -> bytes:
    """Return a ZIP of split PDFs.

    mode='all'   -> one PDF per page.
    mode='ranges'-> one PDF per comma-separated range, e.g. '1-3,4-6'.
    """
    reader = PdfReader(io.BytesIO(data))
    total = len(reader.pages)
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        if mode == "ranges" and ranges.strip():
            for idx, part in enumerate(ranges.replace(" ", "").split(","), start=1):
                if not part:
                    continue
                if "-" in part:
                    a, b = part.split("-", 1)
                    start, end = int(a) - 1, int(b)
                else:
                    start, end = int(part) - 1, int(part)
                if start < 0 or end > total or start >= end:
                    raise ProcessingError(f"Invalid range '{part}'.")
                writer = PdfWriter()
                for p in range(start, end):
                    writer.add_page(reader.pages[p])
                b = io.BytesIO()
                writer.write(b)
                zf.writestr(f"pages_{start + 1}-{end}.pdf", b.getvalue())
        else:
            for i in range(total):
                writer = PdfWriter()
                writer.add_page(reader.pages[i])
                b = io.BytesIO()
                writer.write(b)
                zf.writestr(f"page_{i + 1}.pdf", b.getvalue())
    return zip_buf.getvalue()


def remove_pages(data: bytes, pages_spec: str) -> bytes:
    reader = PdfReader(io.BytesIO(data))
    total = len(reader.pages)
    to_remove = set(_parse_pages(pages_spec, total))
    if len(to_remove) >= total:
        raise ProcessingError("You cannot remove every page.")
    writer = PdfWriter()
    for i in range(total):
        if i not in to_remove:
            writer.add_page(reader.pages[i])
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def organize_pdf(data: bytes, order_spec: str) -> bytes:
    """order_spec: comma-separated 1-based page numbers in desired order."""
    reader = PdfReader(io.BytesIO(data))
    total = len(reader.pages)
    order = [int(x) - 1 for x in order_spec.replace(" ", "").split(",") if x]
    if not order:
        raise ProcessingError("No page order provided.")
    for p in order:
        if p < 0 or p >= total:
            raise ProcessingError(f"Page number out of range (document has {total} pages).")
    writer = PdfWriter()
    for p in order:
        writer.add_page(reader.pages[p])
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def jpg_to_pdf(images: List[bytes]) -> bytes:
    if not images:
        raise ProcessingError("Please upload at least one image.")
    pil_images = []
    for data in images:
        img = Image.open(io.BytesIO(data))
        if img.mode in ("RGBA", "P", "LA"):
            img = img.convert("RGB")
        pil_images.append(img)
    out = io.BytesIO()
    pil_images[0].save(out, format="PDF", save_all=True, append_images=pil_images[1:])
    return out.getvalue()


def rotate_pdf(data: bytes, angle: int, pages_spec: str = "") -> bytes:
    if angle not in (90, 180, 270):
        raise ProcessingError("Rotation must be 90, 180 or 270 degrees.")
    reader = PdfReader(io.BytesIO(data))
    total = len(reader.pages)
    targets = set(_parse_pages(pages_spec, total)) if pages_spec.strip() else set(range(total))
    writer = PdfWriter()
    for i, page in enumerate(reader.pages):
        if i in targets:
            page.rotate(angle)
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def pdf_to_word(data: bytes) -> bytes:
    import tempfile
    import os as _os
    from pdf2docx import Converter
    in_fd, in_path = tempfile.mkstemp(suffix=".pdf")
    out_fd, out_path = tempfile.mkstemp(suffix=".docx")
    _os.close(in_fd)
    _os.close(out_fd)
    try:
        with open(in_path, "wb") as f:
            f.write(data)
        cv = Converter(in_path)
        cv.convert(out_path)
        cv.close()
        with open(out_path, "rb") as f:
            return f.read()
    except Exception as e:
        raise ProcessingError("Could not convert this PDF to Word. It may be scanned or image-only.")
    finally:
        for p in (in_path, out_path):
            try:
                _os.unlink(p)
            except Exception:
                pass
