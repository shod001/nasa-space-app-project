"""Merge cover.pdf + body.pdf into the final deliverable (A4-normalized)."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89
SRC = '/home/z/my-project/pdf-report/code-pdf'
OUT = '/home/z/my-project/pdf-report/code-pdf/outpost-director-code-explained.pdf'

def normalize(page):
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    if abs(w - A4_W) > 0.1 or abs(h - A4_H) > 0.1:
        page.scale_to(A4_W, A4_H)
    return page

writer = PdfWriter()
writer.add_page(normalize(PdfReader(f'{SRC}/cover.pdf').pages[0]))
for p in PdfReader(f'{SRC}/body.pdf').pages:
    writer.add_page(normalize(p))
writer.add_metadata({
    '/Title': 'Outpost Director: Moon & Mars - Code & Architecture Explained',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Technical walkthrough of the Outpost Director game code: '
                'architecture, game logic, state management, components, '
                'NASA API integration, styling and deployment',
})
with open(OUT, 'wb') as f:
    writer.write(f)

r = PdfReader(OUT)
print('final pages:', len(r.pages))
for i, p in enumerate(r.pages):
    print(f'  p{i+1}: {float(p.mediabox.width):.1f} x {float(p.mediabox.height):.1f}')
