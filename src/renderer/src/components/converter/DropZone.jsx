import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import useAppStore from '../../stores/useAppStore'

export default function DropZone() {
  const { addQueuedFiles } = useAppStore()

  const onDrop = useCallback((acceptedFiles) => {
    addQueuedFiles(acceptedFiles)
  }, [addQueuedFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/tiff': ['.tiff', '.tif'],
      'image/bmp': ['.bmp'],
    },
    multiple: true
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 titlebar-no-drag',
        isDragActive
          ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
          : 'border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5'
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {isDragActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-5xl mb-3">📂</div>
            <p className="text-blue-400 font-medium">Drop files here!</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="text-white font-medium mb-1">Drop files here</p>
            <p className="text-slate-500 text-sm">PDF, PNG, JPEG, TIFF — or click to browse</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
