import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import useAppStore from '../../stores/useAppStore'
import ProgressBar from '../ui/ProgressBar'

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function FileRow({ file }) {
  const { removeQueuedFile } = useAppStore()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 bg-white/5 border border-white/8 rounded-xl"
    >
      {/* File icon */}
      <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-lg shrink-0">
        {file.name.endsWith('.pdf') ? '📕' : '🖼️'}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-slate-500 text-xs">{formatSize(file.size)}</span>
          {file.status === 'processing' && (
            <ProgressBar progress={file.progress} size="sm" color="blue" className="flex-1" />
          )}
          {file.status === 'done' && (
            <span className="text-emerald-400 text-xs">✓ Complete</span>
          )}
          {file.status === 'error' && (
            <span className="text-red-400 text-xs truncate">✗ {file.error}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {file.status === 'done' && file.outputPath && (
          <button
            onClick={() => window.api.shell.openPath(file.outputPath)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors titlebar-no-drag"
            title="Open file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}
        {file.status !== 'processing' && (
          <button
            onClick={() => removeQueuedFile(file.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors titlebar-no-drag"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function ConversionProgress() {
  const { queuedFiles, clearQueue } = useAppStore()

  if (queuedFiles.length === 0) return null

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-medium">Files ({queuedFiles.length})</h3>
        <button
          onClick={clearQueue}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors titlebar-no-drag"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {queuedFiles.map(file => (
            <FileRow key={file.id} file={file} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
