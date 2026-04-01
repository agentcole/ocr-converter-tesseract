import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import Terminal from '../ui/Terminal'
import useAppStore from '../../stores/useAppStore'
import { clsx } from 'clsx'

const PLATFORM_NAMES = { darwin: 'macOS', win32: 'Windows', linux: 'Linux' }
const PM_NAMES = {
  homebrew: 'Homebrew', macports: 'MacPorts', winget: 'WinGet',
  choco: 'Chocolatey', apt: 'APT', dnf: 'DNF', yum: 'YUM', pacman: 'Pacman',
}
const PM_INSTALL_LABEL = {
  darwin: 'Install Homebrew',
  win32: 'Get WinGet (App Installer)',
}

function StatusDot({ status }) {
  if (status === 'loading') return (
    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
  )
  if (status === 'ok') return (
    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
  if (status === 'warn') return (
    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
      <span className="text-[10px] text-white font-bold">!</span>
    </div>
  )
  return (
    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
      <span className="text-[10px] text-white font-bold">✕</span>
    </div>
  )
}

function CheckCard({ icon, label, value, status, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
    >
      <div className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">{label}</p>
        <p className="text-white text-sm font-medium truncate">{value}</p>
      </div>
      <StatusDot status={status} />
    </motion.div>
  )
}

export default function SystemCheckStep({ onNext, onBack }) {
  const { setSystemInfo, systemInfo } = useAppStore()
  const [checking, setChecking] = useState(!systemInfo)
  const [bootstrapState, setBootstrapState] = useState('idle') // idle | running | done | error
  const [bootstrapLog, setBootstrapLog] = useState([])
  const cleanupRef = useRef(null)

  useEffect(() => {
    return () => { if (cleanupRef.current) cleanupRef.current() }
  }, [])

  async function runDetect() {
    setChecking(true)
    await new Promise(r => setTimeout(r, 600))
    const info = await window.api.system.detect()
    setSystemInfo(info)
    setChecking(false)
  }

  useEffect(() => {
    if (!systemInfo) runDetect()
  }, [])

  async function installPackageManager() {
    setBootstrapState('running')
    setBootstrapLog([])

    const cleanup = window.api.install.onOutput(({ data, type }) => {
      data.split('\n').filter(Boolean).forEach(line =>
        setBootstrapLog(l => [...l, { text: line, type }])
      )
    })
    cleanupRef.current = cleanup

    const result = await window.api.install.bootstrap({ platform: systemInfo.platform })
    cleanup()
    cleanupRef.current = null

    if (result.success) {
      setBootstrapState('done')
      // Update stored systemInfo with the newly detected package manager
      setSystemInfo({ ...systemInfo, packageManager: result.packageManager })
    } else {
      setBootstrapState('error')
      setBootstrapLog(l => [...l, { text: `Error: ${result.error}`, type: 'stderr' }])
    }
  }

  const platform = systemInfo?.platform
  const pm = systemInfo?.packageManager
  const tesseract = systemInfo?.tesseract

  const needsBootstrap = !checking && !pm && !tesseract?.installed
  const canProceed = !checking && (pm || tesseract?.installed) && bootstrapState !== 'running'

  return (
    <div className="flex flex-col h-full py-8 px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-1">System Check</h2>
        <p className="text-slate-400 text-sm mb-5">
          {checking ? 'Scanning your system...' : "Here's what we found on your machine."}
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <CheckCard icon="💻" label="Operating System"
          value={platform ? PLATFORM_NAMES[platform] || platform : 'Detecting...'}
          status={checking ? 'loading' : platform ? 'ok' : 'error'}
          delay={0.1}
        />
        <CheckCard icon="📦" label="Package Manager"
          value={
            checking ? 'Detecting...' :
            pm ? PM_NAMES[pm] || pm :
            bootstrapState === 'done' ? 'Installed' :
            'Not found'
          }
          status={
            checking ? 'loading' :
            pm || bootstrapState === 'done' ? 'ok' :
            needsBootstrap ? 'warn' : 'warn'
          }
          delay={0.2}
        />
        <CheckCard icon="🔬" label="Tesseract OCR"
          value={
            checking ? 'Checking...' :
            tesseract?.installed ? `Installed (v${tesseract.version})` :
            "Not installed — we'll install it next"
          }
          status={checking ? 'loading' : tesseract?.installed ? 'ok' : 'warn'}
          delay={0.3}
        />

        <AnimatePresence mode="wait">
          {/* No package manager — show bootstrap UI */}
          {needsBootstrap && bootstrapState === 'idle' && (
            <motion.div
              key="bootstrap-prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            >
              <p className="text-amber-400 text-sm font-semibold mb-1">
                {platform === 'darwin' ? 'Homebrew is required' : 'WinGet is required'}
              </p>
              <p className="text-amber-400/70 text-xs mb-3">
                {platform === 'darwin'
                  ? 'Homebrew is the easiest way to install Tesseract on macOS. We can install it for you now.'
                  : 'WinGet (App Installer) is needed to install Tesseract on Windows.'}
              </p>
              <Button onClick={installPackageManager} size="sm">
                {PM_INSTALL_LABEL[platform] || 'Install Package Manager'}
              </Button>
            </motion.div>
          )}

          {/* Bootstrap terminal */}
          {(bootstrapState === 'running' || bootstrapState === 'error') && (
            <motion.div
              key="bootstrap-terminal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              {bootstrapState === 'running' && (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-400 text-xs">Installing...</span>
                </div>
              )}
              {bootstrapState === 'error' && (
                <div className="flex items-center justify-between">
                  <span className="text-red-400 text-xs">Installation failed</span>
                  <button
                    onClick={() => { setBootstrapState('idle'); setBootstrapLog([]) }}
                    className="text-xs text-slate-500 hover:text-white titlebar-no-drag"
                  >
                    Retry
                  </button>
                </div>
              )}
              <Terminal lines={bootstrapLog} className="flex-1 min-h-0" />
            </motion.div>
          )}

          {/* Bootstrap succeeded */}
          {bootstrapState === 'done' && (
            <motion.div
              key="bootstrap-done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
              <p className="text-emerald-400 text-sm font-semibold">Package manager installed!</p>
              <p className="text-emerald-400/60 text-xs mt-0.5">
                Click Continue to select languages and install Tesseract.
              </p>
            </motion.div>
          )}

          {/* Tesseract already installed */}
          {!checking && tesseract?.installed && bootstrapState === 'idle' && (
            <motion.div
              key="tess-ok"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
              <p className="text-emerald-400 text-sm font-semibold">
                Tesseract is already installed with {tesseract.languages?.length || 0} language(s).
              </p>
              <p className="text-emerald-400/60 text-xs mt-0.5">
                You can still add more languages on the next step.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button onClick={onBack} variant="ghost">← Back</Button>
        <div className="flex items-center gap-2">
          {/* Re-check after manual install */}
          {!checking && !canProceed && bootstrapState === 'idle' && (
            <Button onClick={runDetect} variant="secondary" size="sm">
              Re-check
            </Button>
          )}
          <Button onClick={onNext} disabled={!canProceed}>
            Continue →
          </Button>
        </div>
      </div>
    </div>
  )
}
