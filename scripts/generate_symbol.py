from pathlib import Path
import svgwrite

out_path = Path('public/symbol.svg')
out_path.parent.mkdir(exist_ok=True)

svg = svgwrite.Drawing(str(out_path), size=('512px', '512px'))

svg.add(svg.rect(
    insert=(40, 40),
    size=(432, 432),
    rx=72,
    ry=72,
    fill='none',
    stroke='#0f172a',
    stroke_width=24,
))

svg.add(svg.polygon(
    points=[(180, 150), (332, 150), (372, 210), (256, 372), (140, 210)],
    fill='#22c55e',
))

svg.add(svg.path(d='M208 188 L304 188', stroke='white', stroke_width=12, stroke_linecap='round'))
svg.add(svg.path(d='M208 188 L256 320', stroke='white', stroke_width=12, stroke_linecap='round'))
svg.add(svg.path(d='M304 188 L256 320', stroke='white', stroke_width=12, stroke_linecap='round'))

svg.add(svg.circle(cx=352, cy=120, r=13, fill='#f87171'))
svg.add(svg.circle(cx=392, cy=92, r=13, fill='#f87171'))
svg.add(svg.circle(cx=418, cy=132, r=13, fill='#f87171'))

svg.save()
print(out_path)
