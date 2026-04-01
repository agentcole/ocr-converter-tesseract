import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import useAppStore from '../../stores/useAppStore'

export default function CompleteStep({ onFinish }) {
  const { selectedLanguages, systemInfo } = useAppStore()

  useEffect(() => {
    // Persist onboarding complete
    window.api.store.set('onboardingComplete', true)
    window.api.store.set('installedLanguages', selectedLanguages)
    // Resize to main app window
    window.api.window.resize({ width: 1100, height: 700, resizable: true })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-10 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-8"
      >
        <h1 className="text-3xl font-bold text-white">You're all set!</h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Tesseract has been installed with {selectedLanguages.length} language(s).
          You're ready to convert documents.
        </p>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3 mb-10"
      >
        <div className="px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">{selectedLanguages.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Languages</p>
        </div>
        <div className="px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-xs text-slate-400 mt-0.5">Output Formats</p>
        </div>
        <div className="px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-center">
          <p className="text-sm font-bold text-white capitalize">
            {systemInfo?.platform === 'darwin' ? 'macOS' : systemInfo?.platform === 'win32' ? 'Windows' : 'Linux'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Platform</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={onFinish} size="lg" variant="success">
          Start Converting ✨
        </Button>
      </motion.div>
    </div>
  )
}
