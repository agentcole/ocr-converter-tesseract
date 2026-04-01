import { spawn } from 'child_process'
import { join } from 'path'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export async function convertImages(imageDataUrls, outputFormat, outputDir, baseName, languages) {
  const tempDir = join(tmpdir(), `ocr-${Date.now()}`)
  mkdirSync(tempDir, { recursive: true })

  try {
    // Save images to temp files
    const imagePaths = []
    for (let i = 0; i < imageDataUrls.length; i++) {
      const dataUrl = imageDataUrls[i]
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const imgPath = join(tempDir, `page-${String(i + 1).padStart(3, '0')}.png`)
      writeFileSync(imgPath, Buffer.from(base64, 'base64'))
      imagePaths.push(imgPath)
    }

    // Create image list file for batch processing
    const listFile = join(tempDir, 'pages.txt')
    writeFileSync(listFile, imagePaths.join('\n'))

    const langStr = languages.join('+') || 'eng'
    const outputBase = join(outputDir, baseName)

    if (outputFormat === 'txt') {
      await runTesseract(listFile, outputBase, ['txt'], langStr)
      return { success: true, outputPath: outputBase + '.txt' }
    }

    if (outputFormat === 'pdf') {
      await runTesseract(listFile, outputBase, ['pdf'], langStr)
      return { success: true, outputPath: outputBase + '.pdf' }
    }

    if (outputFormat === 'docx') {
      const txtOutput = join(tempDir, 'ocr_output')
      await runTesseract(listFile, txtOutput, ['txt'], langStr)
      const text = readFileSync(txtOutput + '.txt', 'utf8')
      const docxPath = outputBase + '.docx'
      await createDocx(text, docxPath, baseName)
      return { success: true, outputPath: docxPath }
    }

    throw new Error('Unsupported output format')
  } finally {
    // Cleanup temp files
    try {
      const { rmSync } = await import('fs')
      rmSync(tempDir, { recursive: true, force: true })
    } catch {}
  }
}

function runTesseract(inputFile, outputBase, formats, lang) {
  return new Promise((resolve, reject) => {
    const args = [inputFile, outputBase, '-l', lang, ...formats]
    const proc = spawn('tesseract', args)
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Tesseract failed (${code}): ${stderr}`))
    })
    proc.on('error', reject)
  })
}

async function createDocx(text, outputPath, title) {
  const paragraphs = text.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return new Paragraph({ text: '', spacing: { after: 200 } })
    return new Paragraph({
      children: [new TextRun({ text: trimmed, size: 24 })],
      spacing: { after: 120 },
    })
  })

  const doc = new Document({
    creator: 'OCR Converter',
    title: title,
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        }),
        ...paragraphs
      ]
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  writeFileSync(outputPath, buffer)
}
