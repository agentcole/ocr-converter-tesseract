import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'
import Terminal from '../ui/Terminal'
import useAppStore from '../../stores/useAppStore'

export default function InstallStep({ onNext, onBack }) {
  const { systemInfo, selectedLanguages, installLog, appendInstallLog, clearInstallLog, installStatus, setInstallStatus } = useAppStore()
  const [progress, setProgress] = useState(0)
  const [commands, setCommands] = useState([])
  const cleanupRef = useRef(null)

  useEffect(() => {
    async function loadCommands() {
      if (!systemInfo) return
      const cmds = await window.api.install.getCommands({
        platform: systemInfo.platform,
        packageManager: systemInfo.packageManager,
        languages: selectedLanguages,
        distro: systemInfo.distro
      })
      setCommands(cmds)
    }
    loadCommands()
  }, [systemInfo, selectedLanguages])

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  async function startInstall() {
    clearInstallLog()
    setInstallStatus('running')
    setProgress(5)

    // Show commands being run
    commands.forEach(cmd => appendInstallLog({ text: cmd, type: 'system' }))

    const cleanup = window.api.install.onOutput(({ data, type }) => {
      data.split('\n').filter(Boolean).forEach(line => {
        appendInstallLog({ text: line, type })
      })
      // Fake incremental progress based on output
      setProgress(p => Math.min(90, p + Math.random() * 3))
    })
    cleanupRef.current = cleanup

    try {
      const result = await window.api.install.run({
        platform: systemInfo.platform,
        packageManager: systemInfo.packageManager,
        languages: selectedLanguages,
        distro: systemInfo.distro
      })

      cleanup()
      cleanupRef.current = null

      if (result.success) {
        setProgress(100)
        setInstallStatus('success')
        appendInstallLog({ text: '✓ Installation complete!', type: 'system' })
      } else {
        setInstallStatus('error')
        appendInstallLog({ text: `✗ Error: ${result.error}`, type: 'stderr' })
      }
    } catch (err) {
      cleanup()
      setInstallStatus('error')
      appendInstallLog({ text: `✗ Error: ${err.message}`, type: 'stderr' })
    }
  }

  const isRunning = installStatus === 'running'
  const isSuccess = installStatus === 'success'
  const isError = installStatus === 'error'
  const isIdle = installStatus === 'idle'

  return (
    <div className="flex flex-col h-full py-8 px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isSuccess ? 'Installation Complete!' : isError ? 'Installation Failed' : 'Installing Tesseract'}
        </h2>
        <p className="text-slate-400 text-sm mb-5">
          {isIdle && 'Ready to install Tesseract and selected language packs.'}
          {isRunning && "This may take a few minutes. Please don't close the window."}
          {isSuccess && `Successfully installed Tesseract with ${selectedLanguages.length} language(s).`}
          {isError && 'Something went wrong. Check the output below for details.'}
        </p>
      </motion.div>

      {/* Command preview when idle */}
      {isIdle && commands.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Commands that will run:</p>
          {commands.map((cmd, i) => (
            <p key={i} className="text-sm font-mono text-slate-300 break-all">{cmd}</p>
          ))}
        </motion.div>
      )}

      {/* Progress bar */}
      {(isRunning || isSuccess || isError) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <ProgressBar
            progress={progress}
            color={isError ? 'red' : isSuccess ? 'emerald' : 'blue'}
            size="md"
            label={isRunning ? 'Installing...' : isSuccess ? 'Complete' : 'Failed'}
          />
        </motion.div>
      )}

      {/* Terminal output */}
      {(isRunning || isSuccess || isError) && (
        <Terminal lines={installLog} className="flex-1" />
      )}

      {/* Placeholder when idle */}
      {isIdle && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <p className="text-slate-500 text-sm">Click "Install" to begin</p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost" disabled={isRunning}>← Back</Button>
        {isIdle && (
          <Button onClick={startInstall} disabled={!systemInfo?.packageManager && !systemInfo?.tesseract?.installed}>
            Install →
          </Button>
        )}
        {isRunning && (
          <Button disabled variant="secondary">
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
            Installing...
          </Button>
        )}
        {isSuccess && (
          <Button onClick={onNext} variant="success">
            Continue →
          </Button>
        )}
        {isError && (
          <div className="flex gap-2">
            <Button onClick={() => { clearInstallLog(); setInstallStatus('idle'); setProgress(0) }} variant="secondary">
              Retry
            </Button>
            <Button onClick={onNext} variant="ghost">Skip</Button>
          </div>
        )}
      </div>
    </div>
  )
}
