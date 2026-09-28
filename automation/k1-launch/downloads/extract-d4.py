"""D-4 Printable Worksheets: copy the worksheet pages out of the final Playbook PDF.

Usage: python downloads/extract-d4.py "<path to 1K-Club-Playbook.pdf>" 9,10,14,...   (1-based page numbers)
Writes downloads/dist/D-4-Printable-Worksheets.pdf
"""
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter

src, pages = sys.argv[1], [int(p) for p in sys.argv[2].split(',') if p.strip()]
reader = PdfReader(src)
writer = PdfWriter()
for p in pages:
    if not 1 <= p <= len(reader.pages):
        sys.exit(f'page {p} is outside 1..{len(reader.pages)}')
    writer.add_page(reader.pages[p - 1])
writer.add_metadata({'/Title': '$1K Club Playbook: Printable Worksheets (D-4)', '/Author': 'Scrolly'})
out = Path(__file__).parent / 'dist' / 'D-4-Printable-Worksheets.pdf'
with open(out, 'wb') as f:
    writer.write(f)
print(f'{out}: {len(pages)} pages from {src} ({len(reader.pages)} pages)')
