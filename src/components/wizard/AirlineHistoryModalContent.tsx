import {
  AIRLINE_SECOND_OFFER_HISTORY,
  ECONOMIC_INCREASE_FOOTNOTE,
  articleLinkTypeLabel,
  formatArrivalMonths,
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
    <div className="mt-1.5 text-xs flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {record.articleLinks.map((link, index) => (
        <span key={link.url} className="flex items-center gap-x-1.5">
          {index > 0 && <span style={{ color: 'var(--text-faint)' }}>|</span>}
          <ArticleLink label={articleLinkTypeLabel(record, index)} url={link.url} />
        </span>
      ))}
    </div>
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
              <img src={record.logoSrc} alt="" className="h-6 w-auto max-w-[56px] object-contain" />
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

export function AirlineHistoryTable({ showIncreaseColumn = true }: { showIncreaseColumn?: boolean }) {
  return (
    <table className="w-full min-w-[640px] text-xs border-collapse">
      <thead>
        <tr style={{ color: 'var(--text-faint)' }}>
          <th className="text-left font-semibold pb-3 pr-3">Airline</th>
          <th className="text-left font-semibold pb-3 pr-3">First TA Rejected</th>
          <th className="text-left font-semibold pb-3 pr-3">Second TA Ratified</th>
          <th className={showIncreaseColumn ? 'text-left font-semibold pb-3 pr-3' : 'text-left font-semibold pb-3'}>Time Between</th>
          {showIncreaseColumn && <th className="text-left font-semibold pb-3">Approx. Increase*</th>}
        </tr>
      </thead>
      <tbody>
        {AIRLINE_SECOND_OFFER_HISTORY.map((record) => (
          <tr key={record.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <td className="py-3 pr-3 align-top">
              <div className="flex items-center justify-center" style={{ width: 72, height: 28 }}>
                <img src={record.logoSrc} alt={record.airline} className="h-full w-full object-contain" />
              </div>
            </td>
            <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.firstTARejected}</td>
            <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.secondTARatified}</td>
            <td className={showIncreaseColumn ? 'py-3 pr-3 align-top tabular-nums' : 'py-3 align-top tabular-nums'} style={{ color: 'var(--text-muted)' }}>
              {record.daysBetween} days
              <div style={{ color: 'var(--text-faint)' }}>~{formatArrivalMonths(record.approximateMonths)} mo</div>
            </td>
            {showIncreaseColumn && (
              <td className="py-3 align-top" style={{ color: 'var(--text-muted)' }}>{record.economicIncrease}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
