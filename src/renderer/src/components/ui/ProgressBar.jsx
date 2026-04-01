import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function ProgressBar({ progress = 0, color = 'blue', size = 'md', animated = true, label, className }) {
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-white/10 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          className={clsx(colors[color], heights[size], 'rounded-full', animated && 'transition-all')}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
