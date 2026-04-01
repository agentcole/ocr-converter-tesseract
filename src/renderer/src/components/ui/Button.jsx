import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 titlebar-no-drag'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white focus:ring-blue-500 shadow-lg shadow-blue-500/25',
    secondary: 'bg-white/10 hover:bg-white/20 active:bg-white/5 text-white border border-white/20 focus:ring-white/30',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/10 focus:ring-white/20',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, variants[variant], sizes[size], disabled && 'opacity-40 cursor-not-allowed', className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
