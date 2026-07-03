import { useEffect, useState } from 'react'
import {
  readScenarioAverageColor,
  readScenarioOfferColor,
  readScenarioWorstColor,
  readTextFaintColor,
  readTextMutedColor,
  readVoteNoColor,
  readVoteYesColor,
  SCENARIO_AVERAGE_FALLBACK,
  SCENARIO_OFFER_FALLBACK,
  SCENARIO_WORST_FALLBACK,
  TEXT_FAINT_FALLBACK,
  TEXT_MUTED_FALLBACK,
  VOTE_NO_FALLBACK,
  VOTE_YES_FALLBACK,
} from '../../lib/resultColors'

export function useResultChartColors() {
  const [colors, setColors] = useState({
    voteYes: VOTE_YES_FALLBACK,
    voteNo: VOTE_NO_FALLBACK,
    textMuted: TEXT_MUTED_FALLBACK,
    textFaint: TEXT_FAINT_FALLBACK,
    scenarioAverage: SCENARIO_AVERAGE_FALLBACK,
    scenarioOffer: SCENARIO_OFFER_FALLBACK,
    scenarioWorst: SCENARIO_WORST_FALLBACK,
  })

  useEffect(() => {
    const update = () => {
      setColors({
        voteYes: readVoteYesColor(),
        voteNo: readVoteNoColor(),
        textMuted: readTextMutedColor(),
        textFaint: readTextFaintColor(),
        scenarioAverage: readScenarioAverageColor(),
        scenarioOffer: readScenarioOfferColor(),
        scenarioWorst: readScenarioWorstColor(),
      })
    }

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}
