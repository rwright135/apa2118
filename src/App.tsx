import { useEffect } from 'react'
import { useStore } from './state/store'
import { loadFromLocalStorage, decodeFromURL } from './state/persistence'

import { StepWelcome } from './components/wizard/StepWelcome'
import { StepSeat } from './components/wizard/StepSeat'
import { StepUpgrade } from './components/wizard/StepUpgrade'
import { StepLongevity } from './components/wizard/StepLongevity'
import { StepAnniversary } from './components/wizard/StepAnniversary'
import { StepLineType } from './components/wizard/StepLineType'
import { StepExtraHours } from './components/wizard/StepExtraHours'
import { StepDOB } from './components/wizard/StepDOB'
import { StepProfitSharing } from './components/wizard/StepProfitSharing'
import { StepScenariosIntro } from './components/wizard/StepScenariosIntro'
import { StepRetention } from './components/wizard/StepRetention'
import { StepInvestmentRate } from './components/wizard/StepInvestmentRate'
import { StepVoteNo } from './components/wizard/StepVoteNo'
import { StepPayRaise } from './components/wizard/StepPayRaise'
import { StepAdvanced } from './components/wizard/StepAdvanced'
import { ResultsScreen } from './components/results/ResultsScreen'
import { LoadingScreen } from './components/shared/LoadingScreen'

function App() {
  const { currentStep, isComputing, setInputs } = useStore()

  // useEffect MUST come before any conditional returns — Rules of Hooks
  useEffect(() => {
    const fromURL = decodeFromURL()
    if (fromURL) {
      setInputs(fromURL)
      return
    }
    const fromStorage = loadFromLocalStorage()
    if (fromStorage) {
      setInputs(fromStorage)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isComputing) return <LoadingScreen />

  switch (currentStep) {
    case 'welcome':      return <StepWelcome />
    case 'seat':         return <StepSeat />
    case 'upgrade':      return <StepUpgrade />
    case 'longevity':    return <StepLongevity />
    case 'anniversary':  return <StepAnniversary />
    case 'lineType':     return <StepLineType />
    case 'extraHours':   return <StepExtraHours />
    case 'dob':          return <StepDOB />
    case 'profitSharing':return <StepProfitSharing />
    case 'investmentRate':return <StepInvestmentRate />
    case 'scenariosIntro': return <StepScenariosIntro />
    case 'retention':    return <StepRetention />
    case 'voteNo':       return <StepVoteNo />
    case 'payRaise':     return <StepPayRaise />
    case 'advanced':     return <StepAdvanced />
    case 'results':      return <ResultsScreen />
    default:             return <StepWelcome />
  }
}

export default App
