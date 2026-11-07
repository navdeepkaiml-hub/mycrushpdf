"""Verify browser-generated outputs saved in /tmp/dl."""
import io, os, zipfile
from pypdf import PdfReader

D = "/tmp/dl"


def texts(b):
    r = PdfReader(io.BytesIO(b))
    return [p.extract_text().strip() for p in r.pages]


def rd(n):
    return open(os.path.join(D, n), "rb").read()


print("merged:", texts(rd("merged.pdf")))
heavy = os.path.getsize("/tmp/fx/heavy.pdf")
for n in ["c_low.pdf", "c_med.pdf", "c_high.pdf"]:
    b = rd(n)
    print(n, len(b), "vs", heavy, "pages", len(PdfReader(io.BytesIO(b)).pages), "smaller" if len(b) < heavy else "NOT SMALLER")
print("c_small identical to input:", rd("c_small.pdf") == open("/tmp/fx/A.pdf", "rb").read())
for z in ["split_all.zip", "split_ranges.zip"]:
    zf = zipfile.ZipFile(io.BytesIO(rd(z)))
    print(z, [(n, texts(zf.read(n))) for n in zf.namelist()])
print("removed:", texts(rd("removed.pdf")))
print("organized:", texts(rd("organized.pdf")))
r = PdfReader(io.BytesIO(rd("images.pdf")))
print("images pages:", [(round(float(p.mediabox.width)), round(float(p.mediabox.height))) for p in r.pages])
r = PdfReader(io.BytesIO(rd("rotated.pdf")))
print("rotated:", [p.rotation for p in r.pages])
