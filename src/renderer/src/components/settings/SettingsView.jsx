import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import useAppStore from '../../stores/useAppStore'
import Button from '../ui/Button'

const OUTPUT_FORMATS = [
  { value: 'docx', label: 'Word Document', ext: '.docx', icon: '📝' },
  { value: 'pdf',  label: 'Searchable PDF', ext: '.pdf',  icon: '📄' },
  { value: 'txt',  label: 'Plain Text',     ext: '.txt',  icon: '📃' },
]

function Section({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
        {title}
      </h2>
      <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/8">
        {children}
      </div>
    </motion.div>
  )
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsView() {
  const {
    setCurrentView,
    resetOnboarding,
    outputFormat, setOutputFormat,
    outputDir, setOutputDir,
    selectedLanguages,
  } = useAppStore()

  const [tesseract, setTesseract] = useState(null)
  const [rechecking, setRechecking] = useState(false)

  useEffect(() => {
    window.api.tesseract.check().then(setTesseract)
  }, [])

  async function recheck() {
    setRechecking(true)
    const result = await window.api.tesseract.check()
    setTesseract(result)
    setRechecking(false)
  }

  async function pickOutputDir() {
    const result = await window.api.dialog.openDir()
    if (!result.canceled && result.filePaths.length > 0) {
      const dir = result.filePaths[0]
      setOutputDir(dir)
      window.api.store.set('outputDir', dir)
    }
  }

  async function handleResetOnboarding() {
    await window.api.store.set('onboardingComplete', false)
    await window.api.window.resize({ width: 900, height: 620, resizable: false })
    resetOnboarding()
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Sidebar — same shell as ConverterView */}
      <div className="w-64 shrink-0 border-r border-white/8 flex flex-col bg-[#0a0f1e]">
        <div className="h-12 titlebar-drag shrink-0" />
        <div className="px-5 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-base">📄</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">OCR Converter</p>
            <p className="text-slate-500 text-xs">Powered by Tesseract</p>
          </div>
        </div>

        <nav className="px-3 flex-1">
          <button
            onClick={() => setCurrentView('converter')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all titlebar-no-drag"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Converter
          </button>
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-white/8 text-white border border-white/10 titlebar-no-drag"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 titlebar-drag shrink-0 border-b border-white/5" />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-slate-400 text-sm mt-1">Manage Tesseract, output preferences, and your setup.</p>
            </motion.div>

            {/* Tesseract */}
            <Section title="Tesseract OCR">
              <Row
                label="Status"
                description={tesseract?.installed ? `Version ${tesseract.version}` : 'Not detected'}
              >
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    tesseract?.installed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {tesseract?.installed ? 'Installed' : 'Missing'}
                  </span>
                  <button
                    onClick={recheck}
                    disabled={rechecking}
                    className="text-slate-500 hover:text-white transition-colors titlebar-no-drag"
                    title="Re-check"
                  >
                    <svg className={clsx('w-4 h-4', rechecking && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </Row>

              <Row
                label="Installed Languages"
                description={tesseract?.languages?.length ? `${tesseract.languages.length} language pack(s)` : 'Run setup to add languages'}
              >
                <div className="flex flex-wrap gap-1 max-w-[180px] justify-end">
                  {(tesseract?.languages ?? []).slice(0, 5).map(l => (
                    <span key={l} className="px-1.5 py-0.5 bg-white/8 border border-white/10 rounded text-xs text-slate-400">{l}</span>
                  ))}
                  {(tesseract?.languages?.length ?? 0) > 5 && (
                    <span className="px-1.5 py-0.5 bg-white/8 border border-white/10 rounded text-xs text-slate-500">
                      +{tesseract.languages.length - 5} more
                    </span>
                  )}
                </div>
              </Row>
            </Section>

            {/* Output */}
            <Section title="Output">
              <Row label="Default Format" description="Applied to all new conversions">
                <div className="flex gap-1">
                  {OUTPUT_FORMATS.map(fmt => (
                    <button
                      key={fmt.value}
                      onClick={() => {
                        setOutputFormat(fmt.value)
                        window.api.store.set('outputFormat', fmt.value)
                      }}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-all titlebar-no-drag',
                        outputFormat === fmt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/8 text-slate-400 hover:bg-white/15 hover:text-white'
                      )}
                    >
                      {fmt.ext}
                    </button>
                  ))}
                </div>
              </Row>

              <Row label="Save Location" description={outputDir || 'Documents folder (default)'}>
                <Button onClick={pickOutputDir} variant="secondary" size="sm">
                  Browse
                </Button>
              </Row>
            </Section>

            {/* Setup */}
            <Section title="Setup">
              <Row
                label="Re-run Setup Wizard"
                description="Re-install Tesseract, add languages, or change settings"
              >
                <Button onClick={handleResetOnboarding} variant="secondary" size="sm">
                  Open Setup
                </Button>
              </Row>
            </Section>

            {/* About */}
            <Section title="About">
              <Row label="OCR Converter" description="Powered by Tesseract OCR">
                <span className="text-xs text-slate-500">v1.0.0</span>
              </Row>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}
