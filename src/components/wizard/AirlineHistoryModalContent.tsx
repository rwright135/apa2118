import {
  AIRLINE_SECOND_OFFER_HISTORY,
  ECONOMIC_INCREASE_FOOTNOTE,
  articleLinkTypeLabel,
  type AirlineSecondOfferRecord,
} from '../../data/airlineSecondOfferHistory'

function ArticleLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:opacity-80 transition-opacity"
      style={{ color: 'var(--accent)' }}
    >
      {label}
    </a>
  )
}

function AirlineArticleLinks({ record }: { record: AirlineSecondOfferRecord }) {
  return (
    <ul className="space-y-1 mt-1.5">
      {record.articleLinks.map((link, index) => (
        <li key={link.url}>
          <span style={{ color: 'var(--text-faint)' }}>{articleLinkTypeLabel(record, index)}: </span>
          <ArticleLink label={link.label} url={link.url} />
        </li>
      ))}
    </ul>
  )
}

export function AirlineHistorySources() {
  return (
    <div
      className="rounded-xl p-4 mt-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="font-semibold text-xs mb-3" style={{ color: 'var(--gold)' }}>Sources</div>
      <div className="space-y-4">
        {AIRLINE_SECOND_OFFER_HISTORY.map((record) => (
          <div key={record.id}>
            <div className="flex items-center gap-2">
              <img src={record.logoSrc} alt="" className="w-6 h-6 rounded object-contain bg-white p-0.5" />
              <span className="font-semibold text-xs" style={{ color: 'var(--text-base)' }}>{record.airline}</span>
            </div>
            <AirlineArticleLinks record={record} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AirlineHistoryFootnote() {
  return (
    <p className="text-[11px] mt-4 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
      * {ECONOMIC_INCREASE_FOOTNOTE}
    </p>
  )
}

export function AirlineHistoryTable() {
  return (
    <table className="w-full min-w-[640px] text-xs border-collapse">
      <thead>
        <tr style={{ color: 'var(--text-faint)' }}>
          <th className="text-left font-semibold pb-3 pr-3">Airline</th>
          <th className="text-left font-semibold pb-3 pr-3">First TA Rejected</th>
          <th className="text-left font-semibold pb-3 pr-3">Second TA Ratified</th>
          <th className="text-left font-semibold pb-3 pr-3">Time Between</th>
          <th className="text-left font-semibold pb-3">Approx. Increase*</th>
        </tr>
      </thead>
      <tbody>
        {AIRLINE_SECOND_OFFER_HISTORY.map((record) => (
          <tr key={record.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <td className="py-3 pr-3 align-top">
              <div className="flex items-center gap-2">
                <img src={record.logoSrc} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{record.airline}</span>
              </div>
            </td>
            <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.firstTARejected}</td>
            <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.secondTARatified}</td>
            <td className="py-3 pr-3 align-top tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {record.daysBetween} days
              <div style={{ color: 'var(--text-faint)' }}>~{record.approximateMonths} mo</div>
            </td>
            <td className="py-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.economicIncrease}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
