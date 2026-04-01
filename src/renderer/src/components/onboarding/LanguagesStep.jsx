import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import useAppStore from '../../stores/useAppStore'
import { clsx } from 'clsx'

const LANGUAGES = [
  { code: 'eng', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'spa', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fra', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'deu', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ita', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'por', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'nld', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'pol', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'rus', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ara', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
  { code: 'chi_tra', name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼' },
  { code: 'jpn', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'hin', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tur', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
]

export default function LanguagesStep({ onNext, onBack }) {
  const { selectedLanguages, toggleLanguage } = useAppStore()
  const [search, setSearch] = useState('')

  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full py-8 px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Choose Languages</h2>
        <p className="text-slate-400 text-sm mb-4">
          Select the languages you'll be working with.{' '}
          <span className="text-blue-400">{selectedLanguages.length} selected</span>
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search languages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/8 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 titlebar-no-drag"
        />
      </div>

      {/* Language grid */}
      <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 pr-1">
        {filtered.map((lang, i) => {
          const isSelected = selectedLanguages.includes(lang.code)
          const isDisabled = lang.code === 'eng'

          return (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => toggleLanguage(lang.code)}
              disabled={isDisabled}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 titlebar-no-drag',
                isSelected
                  ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/40'
                  : 'bg-white/5 border-white/8 hover:bg-white/10',
                isDisabled && 'opacity-60 cursor-default'
              )}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{lang.name}</p>
                <p className="text-slate-500 text-[10px] truncate">{lang.native}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost">← Back</Button>
        <Button onClick={onNext}>
          Install {selectedLanguages.length > 1 ? `(${selectedLanguages.length} languages)` : '(English only)'} →
        </Button>
      </div>
    </div>
  )
}
