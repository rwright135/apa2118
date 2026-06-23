import { useEffect } from 'react'
import { useStore } from './state/store'
import { loadFromLocalStorage, decodeFromURL } from './state/persistence'

import { StepWelcome } from './components/wizard/StepWelcome'
import { StepSeat } from './components/wizard/StepSeat'
import { StepLongevity } from './components/wizard/StepLongevity'
import { StepAnniversary } from './components/wizard/StepAnniversary'
import { StepLineType } from './components/wizard/StepLineType'
import { StepExtraHours } from './components/wizard/StepExtraHours'
import { StepDOB } from './components/wizard/StepDOB'
import { StepProfitSharing } from './components/wizard/StepProfitSharing'
import { StepRetention } from './components/wizard/StepRetention'
import { StepInvestmentRate } from './components/wizard/StepInvestmentRate'
import { StepVoteNo } from './components/wizard/StepVoteNo'
import { StepJCBA } from './components/wizard/StepJCBA'
import { StepAdvanced } from './components/wizard/StepAdvanced'
import { ReviewScreen } from './components/review/ReviewScreen'
import { ResultsPlaceholder } from './components/results/ResultsPlaceholder'

function App() {
  const { currentStep, setInputs } = useStore()

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
  }, [])

  switch (currentStep) {
    case 'welcome': return <StepWelcome />
    case 'seat': return <StepSeat />
    case 'longevity': return <StepLongevity />
    case 'anniversary': return <StepAnniversary />
    case 'lineType': return <StepLineType />
    case 'extraHours': return <StepExtraHours />
    case 'dob': return <StepDOB />
    case 'profitSharing': return <StepProfitSharing />
    case 'retention': return <StepRetention />
    case 'investmentRate': return <StepInvestmentRate />
    case 'voteNo': return <StepVoteNo />
    case 'jcba': return <StepJCBA />
    case 'advanced': return <StepAdvanced />
    case 'review': return <ReviewScreen />
    case 'results': return <ResultsPlaceholder />
    default: return <StepWelcome />
  }
}

export default App
