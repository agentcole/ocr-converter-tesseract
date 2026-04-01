import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const STEPS = [
  { label: 'Welcome', icon: '👋' },
  { label: 'System Check', icon: '🔍' },
  { label: 'Languages', icon: '🌍' },
  { label: 'Install', icon: '⚙️' },
  { label: 'Complete', icon: '✅' },
]

export default function StepSidebar({ currentStep }) {
  return (
    <div className="w-52 flex flex-col py-8 px-5 bg-slate-900/80 border-r border-white/5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-base">
          📄
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">OCR Converter</span>
      </div>

      {/* Steps */}
      <nav className="flex flex-col gap-1">
        {STEPS.map((step, i) => {
          const isComplete = i < currentStep
          const isCurrent = i === currentStep
          const isFuture = i > currentStep

          return (
            <div key={i} className="flex items-center gap-3 relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className={clsx(
                  'absolute left-[14px] top-8 w-0.5 h-6',
                  isComplete ? 'bg-blue-500' : 'bg-white/10'
                )} />
              )}

              {/* Step indicator */}
              <motion.div
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isComplete ? '#3b82f6' : isCurrent ? '#2563eb' : 'rgba(255,255,255,0.06)'
                }}
                transition={{ duration: 0.3 }}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border border-white/10"
              >
                {isComplete ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold text-white/60">{i + 1}</span>
                )}
              </motion.div>

              {/* Step label */}
              <span className={clsx(
                'text-sm transition-colors duration-200',
                isCurrent ? 'text-white font-medium' : isComplete ? 'text-slate-400' : 'text-slate-600'
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Bottom app version */}
      <div className="mt-auto">
        <p className="text-xs text-slate-700">v1.0.0</p>
      </div>
    </div>
  )
}
