import { NextResponse } from 'next/server'
import { get } from '@/lib/db'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const fontPath = path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data')

function addPageFooter(doc: any) {
  const footerText = `CyberVault • ${new Date().toLocaleDateString()} • Page ${doc.page.number}`
  doc.fontSize(9).fillColor('#6b7280').text(footerText, doc.page.margins.left, doc.page.height - doc.page.margins.bottom - 24, {
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    align: 'center',
  })
}

function registerFonts(doc: any) {
  const fonts = {
    Helvetica: path.join(fontPath, 'Helvetica.afm'),
    'Helvetica-Bold': path.join(fontPath, 'Helvetica-Bold.afm'),
    Courier: path.join(fontPath, 'Courier.afm'),
    'Courier-Bold': path.join(fontPath, 'Courier-Bold.afm'),
  }

  for (const [name, file] of Object.entries(fonts)) {
    if (fs.existsSync(file)) {
      doc.registerFont(name, file)
    }
  }
}

function renderText(doc: any, text: string) {
  const lines = text.split('\n')
  let inCode = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode
      doc.moveDown(0.3)
      doc.font(inCode ? 'Courier' : 'Helvetica').fontSize(inCode ? 10 : 11).fillColor('#111827')
      continue
    }

    if (inCode) {
      doc.font('Courier').fontSize(10).fillColor('#111827').text(line, {
        indent: 10,
        lineGap: 2,
      })
      continue
    }

    if (!line.trim()) {
      doc.moveDown(0.4)
      continue
    }

    if (line.startsWith('# ')) {
      doc.moveDown(0.4)
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#111827').text(line.replace(/^#\s+/, ''))
      doc.moveDown(0.2)
      continue
    }

    if (line.startsWith('## ')) {
      doc.moveDown(0.3)
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text(line.replace(/^##\s+/, ''))
      doc.moveDown(0.1)
      continue
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`• ${line.trim().slice(2)}`, {
        indent: 12,
        paragraphGap: 2,
      })
      continue
    }

    doc.font('Helvetica').fontSize(11).fillColor('#111827').text(line)
  }
}

async function embedImage(doc: any, src: string, caption?: string) {
  try {
    let buffer: Buffer | null = null
    if (src.startsWith('http')) {
      const res = await fetch(src)
      if (!res.ok) return
      buffer = Buffer.from(await res.arrayBuffer())
    } else if (src.startsWith('/')) {
      const p = path.join(process.cwd(), 'public', src.replace(/^\//, ''))
      if (fs.existsSync(p)) buffer = fs.readFileSync(p)
    } else if (fs.existsSync(src)) {
      buffer = fs.readFileSync(src)
    }

    if (buffer) {
      doc.image(buffer, { fit: [480, 300], align: 'center' })
      if (caption) {
        doc.moveDown(0.25)
        doc.fontSize(9).fillColor('#6b7280').text(caption, { align: 'center' })
      }
      doc.moveDown(0.5)
    }
  } catch (err) {
    console.error('Failed embedding image', err)
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await get('SELECT r.*, e.name as engagement_name FROM reports r LEFT JOIN engagements e ON r.engagement_id = e.id WHERE r.id=$1', [id])
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const defaultFont = path.join(fontPath, 'Helvetica.afm')
  const doc = new PDFDocument({ size: 'A4', margin: 50, font: fs.existsSync(defaultFont) ? defaultFont : undefined })
  registerFonts(doc)
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  doc.on('end', () => {})
  doc.on('pageAdded', () => addPageFooter(doc))

  doc.rect(doc.x - 10, doc.y - 10, 520, 60).fill('#0f172a').fillColor('white')
  doc.fontSize(20).font('Helvetica-Bold').fillColor('white').text(report.title || 'Report', doc.x, doc.y + 8)
  doc.fontSize(8).fillColor('white').text(`Generated: ${new Date(report.created_at).toLocaleString()}`, { align: 'right' })
  doc.moveDown(2)
  doc.fillColor('black')

  if (report.engagement_name) {
    doc.fontSize(11).font('Helvetica').text(`Engagement: ${report.engagement_name}`)
  }
  doc.fontSize(10).fillColor('#6b7280').text(`Type: ${report.type || 'Report'}`)
  if (report.status) doc.text(`Status: ${report.status}`)
  doc.moveDown(0.5)

  doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke()
  doc.moveDown()

  const content: string = report.content || ''
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = imageRegex.exec(content)) !== null) {
    const imgStart = match.index
    const caption = match[1]
    const imgUrl = match[2]
    const before = content.substring(lastIndex, imgStart)
    renderText(doc, before)
    await embedImage(doc, imgUrl, caption)
    lastIndex = imageRegex.lastIndex
  }

  if (lastIndex < content.length) renderText(doc, content.substring(lastIndex))

  addPageFooter(doc)
  doc.end()

  const result = Buffer.concat(chunks)
  return new NextResponse(result, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${(report.title || 'report').replace(/[^a-z0-9\-]/gi, '_').toLowerCase()}.pdf"`,
    },
  })
}
