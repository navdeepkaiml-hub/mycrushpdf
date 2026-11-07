"""Generate fixture files for browser-tool UI tests into /tmp/fx."""
import io, os
import fitz
from PIL import Image

D = "/tmp/fx"
os.makedirs(D, exist_ok=True)


def make_pdf(path, n, label, with_image=False):
    doc = fitz.open()
    for i in range(n):
        page = doc.new_page()
        page.insert_text((72, 72), f"{label}{i + 1}", fontsize=24)
        if with_image:
            img = Image.effect_noise((900, 900), 80).convert("RGB")
            b = io.BytesIO(); img.save(b, "PNG")
            page.insert_image(fitz.Rect(50, 100, 550, 600), stream=b.getvalue())
    doc.save(path); doc.close()


make_pdf(f"{D}/A.pdf", 2, "A")
make_pdf(f"{D}/B.pdf", 3, "B")
make_pdf(f"{D}/C.pdf", 1, "C")
make_pdf(f"{D}/five.pdf", 5, "P")
make_pdf(f"{D}/three.pdf", 3, "P")
make_pdf(f"{D}/heavy.pdf", 3, "H", with_image=True)
# >10MB pdf (valid header, padded)
with open(f"{D}/big.pdf", "wb") as f:
    f.write(open(f"{D}/A.pdf", "rb").read() + b"%" + b"0" * (11 * 1024 * 1024))
open(f"{D}/fake.pdf", "w").write("this is plain text, not a pdf")
open(f"{D}/note.txt", "w").write("hello")
open(f"{D}/doc.docx", "wb").write(b"PK\x03\x04docx")
# encrypted
doc = fitz.open(f"{D}/A.pdf")
doc.save(f"{D}/enc.pdf", encryption=fitz.PDF_ENCRYPT_AES_256, user_pw="u", owner_pw="o")
doc.close()
for i in range(21):
    im = Image.new("RGB", (400 + i * 10, 300), (i * 10 % 255, 100, 150))
    if i % 2:
        im.save(f"{D}/img{i:02d}.png", "PNG")
    else:
        im.save(f"{D}/img{i:02d}.jpg", "JPEG")
print(sorted(os.listdir(D)))
