import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function Terminal({ lines = [], className }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className={clsx(
      'bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden',
      className
    )}>
      {/* Terminal header */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161b22] border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-amber-500/70" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-xs text-slate-500 font-mono">Terminal</span>
      </div>

      {/* Terminal body */}
      <div className="p-4 overflow-y-auto max-h-56 terminal-text">
        {lines.length === 0 ? (
          <span className="text-slate-600">Waiting for output...</span>
        ) : (
          lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                'leading-relaxed',
                line.type === 'stderr' ? 'text-amber-400' : 'text-emerald-300',
                line.type === 'system' && 'text-blue-400'
              )}
            >
              {line.type === 'system' ? (
                <span className="text-slate-500">$ </span>
              ) : null}
              {line.text}
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
