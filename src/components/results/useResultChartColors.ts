import { useEffect, useState } from 'react'
import { readVoteNoColor, readVoteYesColor, VOTE_NO_FALLBACK, VOTE_YES_FALLBACK } from '../../lib/resultColors'

export function useResultChartColors() {
  const [colors, setColors] = useState({
    voteYes: VOTE_YES_FALLBACK,
    voteNo: VOTE_NO_FALLBACK,
  })

  useEffect(() => {
    const update = () => {
      setColors({
        voteYes: readVoteYesColor(),
        voteNo: readVoteNoColor(),
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
