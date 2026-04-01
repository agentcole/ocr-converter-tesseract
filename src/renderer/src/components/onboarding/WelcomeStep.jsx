import { motion } from 'framer-motion'
import Button from '../ui/Button'

export default function WelcomeStep({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-10 text-center">
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8 relative"
      >
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
          <span className="text-5xl" style={{ animation: 'float 3s ease-in-out infinite' }}>📄</span>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          <span className="text-xl">✨</span>
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 mb-10"
      >
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Welcome to<br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            OCR Converter
          </span>
        </h1>
        <p className="text-slate-400 text-base max-w-xs mx-auto leading-relaxed">
          Transform PDFs and images into editable Word documents using industry-grade OCR technology.
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 flex-wrap justify-center mb-10"
      >
        {['100+ Languages', 'PDF → DOCX', 'Batch Processing', 'Privacy First'].map(f => (
          <span key={f} className="px-3 py-1 bg-white/8 border border-white/10 rounded-full text-xs text-slate-300">
            {f}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button onClick={onNext} size="lg">
          Get Started
          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Button>
      </motion.div>
    </div>
  )
}
