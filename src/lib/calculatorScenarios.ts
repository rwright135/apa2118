import type { RetentionOutcomeId } from './retentionOutcomes'

export const CALCULATOR_SCENARIOS: {
  id: RetentionOutcomeId
  body: string
}[] = [
  {
    id: 'A',
    body: 'You accept the Tentative Agreement. The model follows bridge-agreement pay from ratification through JCBA, with post-JCBA rates reflecting the stronger position of having ratified the TA.',
  },
  {
    id: 'B',
    body: 'You vote No, and a second bridge offer arrives before JCBA closes. The model keeps you on current CBA pay until that offer, then follows the improved second-offer rates through JCBA and beyond.',
  },
  {
    id: 'C',
    body: 'You vote No, and no second offer arrives before JCBA. The model keeps you on current CBA pay through JCBA completion, with a weaker post-JCBA outcome than Scenario A.',
  },
]
