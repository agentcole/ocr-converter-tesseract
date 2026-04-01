import { useEffect, useState } from 'react'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import ConverterView from './components/converter/ConverterView'
import useAppStore from './stores/useAppStore'

export default function App() {
  const { onboardingComplete, setOnboardingComplete, setOutputDir } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const complete = await window.api.store.get('onboardingComplete')
        const savedLangs = await window.api.store.get('installedLanguages')
        const outputDir = await window.api.store.get('outputDir')

        if (complete) setOnboardingComplete(true)
        if (outputDir) setOutputDir(outputDir)

        // If onboarding is complete, resize window immediately
        if (complete) {
          await window.api.window.resize({ width: 1100, height: 700, resizable: true })
        }
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="w-screen h-screen gradient-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return onboardingComplete ? <ConverterView /> : <OnboardingFlow />
}
