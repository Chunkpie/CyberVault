import { NextResponse } from 'next/server'
import { get } from '@/lib/db'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

function addPageFooter(doc: any) {
  const footerText = `CyberVault • ${new Date().toLocaleDateString()} • Page ${doc.page.number}`
  doc.fontSize(9).fillColor('#6b7280').text(footerText, doc.page.margins.left, doc.page.height - doc.page.margins.bottom - 24, {
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    align: 'center',
  })
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
  const note = await get('SELECT * FROM notes WHERE id=$1', [id])
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const doc = new PDFDocument({ size: 'A4', margin: 50, font: 'Helvetica' })
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  doc.on('end', () => {})
  doc.on('pageAdded', () => addPageFooter(doc))

  doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827').text(note.title || 'Note')
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor('#6b7280').text(`Created: ${new Date(note.created_at).toLocaleString()}`)

  const metadata = note.meta || {}
  if (metadata.severity || metadata.cvss || metadata.cve || metadata.references?.length || note.tags?.length) {
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text('Metadata')
    doc.moveDown(0.2)
    doc.font('Helvetica').fontSize(10).fillColor('#111827')
    if (metadata.severity) doc.text(`Severity: ${metadata.severity}`)
    if (metadata.cvss != null) doc.text(`CVSS: ${metadata.cvss}`)
    if (metadata.cve) doc.text(`CVE: ${metadata.cve}`)
    if (metadata.references?.length) doc.text(`References: ${metadata.references.join(', ')}`)
    if (note.tags?.length) doc.text(`Tags: ${note.tags.join(', ')}`)
    doc.moveDown()
  }

  const content: string = note.content || ''
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
      'Content-Disposition': `attachment; filename="${(note.title || 'note').replace(/[^a-z0-9\-]/gi, '_').toLowerCase()}.pdf"`,
    },
  })
}
