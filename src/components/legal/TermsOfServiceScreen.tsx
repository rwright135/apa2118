import { ThemeToggle } from '../shared/ThemeToggle'

interface Props {
  onBack: () => void
}

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By using the APA Local 2118 Contract Comparison Calculator ("the Tool"), you agree to these Terms of Service. If you do not agree, do not use the Tool.`,
  },
  {
    title: '2. What This Tool Is',
    body: `The Tool is an educational calculator designed to help Allegiant Air pilots compare hypothetical financial outcomes under different contract voting scenarios. It is intended to assist your personal decision-making process. It is not a recommendation to vote yes or no, and it does not tell you what you should do.`,
  },
  {
    title: '3. No Collection of Personal Information',
    body: `The Tool does not require a username, password, or account. We do not collect personally identifiable information (PII). Your answers and inputs are processed locally in your browser and are not transmitted to or stored on our servers unless you explicitly choose to share a link or export.`,
  },
  {
    title: '4. No Professional Advice',
    body: `The Tool does not provide legal, financial, tax, investment, retirement planning, or career advice. Nothing in the Tool should be interpreted as a certified financial statement, audited projection, fiduciary recommendation, or substitute for advice from a qualified professional. You are solely responsible for your own voting decision and financial choices.`,
  },
  {
    title: '5. Accuracy and Good-Faith Limitations',
    body: `Calculations are based on contract data, assumptions you enter, and modeling logic that has been prepared and reviewed in good faith. However, we do not warrant or guarantee that any output is complete, accurate, or current. Pay rates, contract terms, timelines, and personal circumstances may differ from the model. You should verify critical inputs independently before relying on any result.`,
  },
  {
    title: '6. Assumptions and User Responsibility',
    body: `Results depend heavily on the assumptions you provide, including longevity, hours, profit sharing, retention bonus estimates, vote-no scenarios, and investment return rates. Small changes in assumptions can materially change outcomes. You are responsible for reviewing the assumptions you enter and understanding how they affect the results.`,
  },
  {
    title: '7. Web and Device Risks',
    body: `The Tool runs in a web browser and may use local storage on your device to remember your inputs. As with any web-based application, use of the Tool involves ordinary internet and device risks, including browser compatibility issues, local storage loss, unauthorized access to your device, malware, phishing, and third-party analytics or hosting dependencies outside our direct control. Use a trusted device and browser and follow your organization's security practices.`,
  },
  {
    title: '8. No Reliance / Limitation of Liability',
    body: `To the fullest extent permitted by law, APA Local 2118 and the contributors to the Tool disclaim liability for any decision you make or any loss, damage, or outcome arising from use of or reliance on the Tool. By using the Tool, you agree that you will not hold APA Local 2118 or its officers, members, or contributors responsible if you are dissatisfied with a decision you make, including any claim that the Tool "convinced" you to act in a particular way.`,
  },
  {
    title: '9. Changes',
    body: `These Terms may be updated from time to time. Continued use of the Tool after changes are posted constitutes acceptance of the revised Terms.`,
  },
  {
    title: '10. Contact',
    body: `Questions about these Terms may be directed to APA Teamsters Local 2118 through your usual union communication channels.`,
  },
]

export function TermsOfServiceScreen({ onBack }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      <div
        className="px-4 pt-4 pb-2 flex items-center gap-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <button
          onClick={onBack}
          className="p-1 -ml-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-base)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
        </button>
        <h1 className="flex-1 text-lg font-bold">Terms of Service</h1>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full">
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
          Last updated: June 2026
        </p>

        <div className="space-y-6">
          {SECTIONS.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
                {title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
