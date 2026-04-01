import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import Button from '../ui/Button'
import DropZone from './DropZone'
import ConversionProgress from './ConversionProgress'
import useAppStore from '../../stores/useAppStore'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const OUTPUT_FORMATS = [
  { value: 'docx', label: 'Word Document', ext: '.docx', icon: '📝' },
  { value: 'pdf', label: 'Searchable PDF', ext: '.pdf', icon: '📄' },
  { value: 'txt', label: 'Plain Text', ext: '.txt', icon: '📃' },
]

async function renderPDFToImages(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const images = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')
    await page.render({ canvasContext: context, viewport }).promise
    images.push(canvas.toDataURL('image/png'))
  }

  return images
}

async function getImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ConverterView() {
  const { queuedFiles, updateFileStatus, outputFormat, setOutputFormat, outputDir, setOutputDir, selectedLanguages } = useAppStore()
  const [isConverting, setIsConverting] = useState(false)

  async function pickOutputDir() {
    const result = await window.api.dialog.openDir()
    if (!result.canceled && result.filePaths.length > 0) {
      setOutputDir(result.filePaths[0])
    }
  }

  async function runConversion() {
    const pending = queuedFiles.filter(f => f.status === 'queued' || f.status === 'error')
    if (pending.length === 0) return

    setIsConverting(true)

    for (const fileItem of pending) {
      updateFileStatus(fileItem.id, { status: 'processing', progress: 10 })

      try {
        let imageDataUrls = []
        const file = fileItem.file

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          imageDataUrls = await renderPDFToImages(file)
        } else {
          const dataUrl = await getImageDataUrl(file)
          imageDataUrls = [dataUrl]
        }

        updateFileStatus(fileItem.id, { progress: 40 })

        const baseName = file.name.replace(/\.[^/.]+$/, '')
        const dir = outputDir || (await window.api.store.get('outputDir'))

        const result = await window.api.convert.files({
          imageDataUrls,
          outputFormat,
          outputDir: dir,
          baseName,
          languages: selectedLanguages
        })

        if (result.success) {
          updateFileStatus(fileItem.id, { status: 'done', progress: 100, outputPath: result.outputPath })
        } else {
          updateFileStatus(fileItem.id, { status: 'error', error: result.error })
        }
      } catch (err) {
        updateFileStatus(fileItem.id, { status: 'error', error: err.message })
      }
    }

    setIsConverting(false)
  }

  const pendingCount = queuedFiles.filter(f => f.status === 'queued' || f.status === 'error').length
  const hasFiles = queuedFiles.length > 0

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-white/8 flex flex-col bg-[#0a0f1e]">
        {/* Titlebar */}
        <div className="h-12 titlebar-drag shrink-0" />

        {/* Logo */}
        <div className="px-5 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-base">📄</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">OCR Converter</p>
            <p className="text-slate-500 text-xs">Powered by Tesseract</p>
          </div>
        </div>

        <div className="px-4 flex-1 overflow-y-auto">
          {/* Output format */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Output Format</p>
            {OUTPUT_FORMATS.map(fmt => (
              <button
                key={fmt.value}
                onClick={() => setOutputFormat(fmt.value)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1 transition-all titlebar-no-drag',
                  outputFormat === fmt.value
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span>{fmt.icon}</span>
                <span className="flex-1 text-left">{fmt.label}</span>
                <span className="text-xs opacity-50">{fmt.ext}</span>
              </button>
            ))}
          </div>

          {/* Output directory */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Output Directory</p>
            <button
              onClick={pickOutputDir}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-left titlebar-no-drag hover:bg-white/8 transition-colors"
            >
              <p className="text-xs text-slate-500 mb-0.5">Save to</p>
              <p className="text-slate-300 text-xs truncate">
                {outputDir || '~/Documents (default)'}
              </p>
            </button>
          </div>

          {/* Languages */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Active Languages</p>
            <div className="flex flex-wrap gap-1">
              {selectedLanguages.map(lang => (
                <span key={lang} className="px-2 py-0.5 bg-white/8 border border-white/10 rounded-md text-xs text-slate-400">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Titlebar */}
        <div className="h-12 titlebar-drag shrink-0 border-b border-white/5 flex items-center px-6 gap-3">
          <div className="flex-1" />
          <p className="text-xs text-slate-500">
            {selectedLanguages.length} language(s) active
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-white mb-1">Convert Documents</h1>
              <p className="text-slate-400 text-sm">
                Drop files below to extract text using OCR and export to your chosen format.
              </p>
            </motion.div>

            <DropZone />
            <ConversionProgress />
          </div>
        </div>

        {/* Bottom action bar */}
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/8 px-6 py-4 flex items-center justify-between bg-[#0a0f1e]"
          >
            <p className="text-sm text-slate-400">
              {pendingCount > 0 ? `${pendingCount} file(s) ready to convert` : 'All conversions complete!'}
            </p>
            <Button
              onClick={runConversion}
              disabled={isConverting || pendingCount === 0}
              size="md"
            >
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Converting...
                </>
              ) : (
                `Convert ${pendingCount > 0 ? pendingCount : ''} File(s) →`
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
