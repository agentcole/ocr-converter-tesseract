import { AnimatePresence, motion } from 'framer-motion'
import useAppStore from '../../stores/useAppStore'
import StepSidebar from '../ui/StepSidebar'
import WelcomeStep from './WelcomeStep'
import SystemCheckStep from './SystemCheckStep'
import LanguagesStep from './LanguagesStep'
import InstallStep from './InstallStep'
import CompleteStep from './CompleteStep'

const STEPS = [WelcomeStep, SystemCheckStep, LanguagesStep, InstallStep, CompleteStep]

const pageVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 30 : -30,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir) => ({
    x: dir < 0 ? 30 : -30,
    opacity: 0
  })
}

export default function OnboardingFlow() {
  const { currentStep, nextStep, prevStep, setOnboardingComplete } = useAppStore()
  const StepComponent = STEPS[currentStep]

  function handleFinish() {
    setOnboardingComplete(true)
  }

  return (
    <div className="w-full h-screen gradient-bg flex items-center justify-center p-8">
      {/* Floating orbs for depth */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl h-[520px] glass rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <StepSidebar currentStep={currentStep} />

        {/* Content area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Titlebar drag region */}
          <div className="absolute top-0 left-0 right-0 h-8 titlebar-drag z-10" />

          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <StepComponent
                onNext={nextStep}
                onBack={prevStep}
                onFinish={handleFinish}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
