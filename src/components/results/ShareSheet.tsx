import { useState, useRef, useEffect } from 'react'


// ── Capture helpers ───────────────────────────────────────────────────────────

function getResultsEl() {
  return document.getElementById('results-container')
}

/** Capture the results container up to and including the cumulative chart
 *  as a PNG data URL. The sticky toolbar and month-by-month table are hidden
 *  during capture so the exported image is clean and not excessively tall.
 */
async function captureImage(): Promise<string> {
  const el = getResultsEl()
  if (!el) throw new Error('Results container not found')

  const toolbar = document.getElementById('results-toolbar')
  const table   = el.querySelector<HTMLElement>(':scope > div > .rounded-2xl.overflow-hidden:last-of-type')
  const exportEnd = document.getElementById('results-export-end')

  const prevToolbar = toolbar?.style.display ?? null
  const prevTable   = table?.style.display   ?? null

  if (toolbar)   toolbar.style.display = 'none'
  if (table)     table.style.display   = 'none'

  try {
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    const { toPng } = await import('html-to-image')
    const bgColor   = getComputedStyle(el).backgroundColor || '#ffffff'

    // Measure height to crop — stop right after the chart section
    let cropHeight: number | undefined
    if (exportEnd) {
      const containerRect = el.getBoundingClientRect()
      const endRect       = exportEnd.getBoundingClientRect()
      const scrollTop     = el.scrollTop || document.documentElement.scrollTop
      const ratio         = el.offsetWidth > 0 ? (el.scrollWidth / el.offsetWidth) : 1
      cropHeight = Math.ceil((endRect.bottom - containerRect.top + scrollTop + 32) * ratio)
    }

    return await toPng(el, {
      cacheBust:       true,
      pixelRatio:      2,
      backgroundColor: bgColor,
      skipFonts:       false,
      height:          cropHeight,
    })
  } finally {
    if (toolbar && prevToolbar !== null) toolbar.style.display = prevToolbar
    if (table   && prevTable   !== null) table.style.display   = prevTable
  }
}

async function exportPDF() {
  const el = getResultsEl()
  if (!el) throw new Error('Results container not found')

  // Measure where each major card starts (relative to container top, in CSS px)
  // BEFORE hiding the toolbar so we can compute the toolbar shift.
  const toolbar = document.getElementById('results-toolbar')
  const toolbarH = toolbar ? toolbar.offsetHeight : 0
  const containerRect = el.getBoundingClientRect()

  const sectionTopsCssPx: number[] = []
  el.querySelectorAll<HTMLElement>('.rounded-2xl').forEach(card => {
    const rect = card.getBoundingClientRect()
    // When the toolbar is hidden during capture, all content below shifts up by toolbarH
    const relY = (rect.top - containerRect.top) - toolbarH
    if (relY > 4) sectionTopsCssPx.push(relY)
  })

  const dataUrl = await captureImage()
  const { jsPDF } = await import('jspdf')

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  const MARGIN_MM  = 10
  const pdf        = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm    = pdf.internal.pageSize.getWidth()
  const pageHmm    = pdf.internal.pageSize.getHeight()
  const contentWmm = pageWmm  - MARGIN_MM * 2
  const contentHmm = pageHmm  - MARGIN_MM * 2
  const imgAspect  = img.naturalHeight / img.naturalWidth
  const scaledHmm  = contentWmm * imgAspect

  if (scaledHmm <= contentHmm) {
    // Fits on one page — center vertically
    const offsetY = MARGIN_MM + (contentHmm - scaledHmm) / 2
    pdf.addImage(dataUrl, 'PNG', MARGIN_MM, offsetY, contentWmm, scaledHmm)
  } else {
    const pxPerMm  = img.naturalWidth / contentWmm
    const sliceHpx = Math.floor(contentHmm * pxPerMm)

    // Convert section tops from CSS px to image px
    const scale = img.naturalWidth / el.offsetWidth
    const sectionBreaksPx = sectionTopsCssPx.map(y => Math.floor(y * scale))

    // Find the last section boundary that fits within this page, keeping a
    // minimum slice height to avoid hairline pages right after a boundary.
    const minSlice = Math.floor(sliceHpx * 0.15)
    const findBreak = (fromPx: number): number => {
      const maxCutPx = fromPx + sliceHpx
      if (maxCutPx >= img.naturalHeight) return img.naturalHeight
      let best = maxCutPx
      for (const bp of sectionBreaksPx) {
        if (bp >= fromPx + minSlice && bp <= maxCutPx) best = bp
      }
      return best
    }

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    const ctx = canvas.getContext('2d')!

    let page = 0
    let srcY = 0
    while (srcY < img.naturalHeight) {
      const cutY = findBreak(srcY)
      const srcH = cutY - srcY
      if (srcH <= 0) break
      canvas.height = srcH
      ctx.clearRect(0, 0, canvas.width, srcH)
      ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, 0, 0, img.naturalWidth, srcH)
      const slice = canvas.toDataURL('image/png')
      if (page > 0) pdf.addPage()
      pdf.addImage(slice, 'PNG', MARGIN_MM, MARGIN_MM, contentWmm, srcH / pxPerMm)
      srcY = cutY
      page++
    }
  }

  pdf.save(`APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.pdf`)
}

async function downloadImage() {
  const dataUrl = await captureImage()
  const link = document.createElement('a')
  link.download = `APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.png`
  link.href = dataUrl
  link.click()
}

// ── Share item ────────────────────────────────────────────────────────────────

interface SheetItem {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void | Promise<void>
  loading?: boolean
}

const Spinner = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
)

function SheetRow({ icon, label, sublabel, onClick, loading }: SheetItem) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-4 px-5 py-4 transition-colors disabled:opacity-50 text-left"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {loading ? <Spinner /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: 'var(--text-base)' }}>{label}</div>
        {sublabel && <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-faint)' }}>{sublabel}</div>}
      </div>
      <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-faint)" strokeWidth="2">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ShareSheet() {
  const [open, setOpen]     = useState(false)
  const [busy, setBusy]     = useState<null | 'pdf' | 'image'>(null)
  const [error, setError]   = useState<string | null>(null)
  const sheetRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])


  const handlePDF = async () => {
    setOpen(false)
    setBusy('pdf'); setError(null)
    try {
      await exportPDF()
    } catch (e) {
      setError(`PDF failed: ${(e as Error).message}`)
      setOpen(true)
    } finally { setBusy(null) }
  }

  const handleImage = async () => {
    setOpen(false)
    setBusy('image'); setError(null)
    try {
      await downloadImage()
    } catch (e) {
      setError(`Image failed: ${(e as Error).message}`)
      setOpen(true)
    } finally { setBusy(null) }
  }

  const busyLabel = busy === 'pdf' ? 'Generating PDF…' : busy === 'image' ? 'Saving image…' : null

  return (
    <div className="relative" ref={sheetRef}>
      {/* Trigger */}
      <button
        onClick={() => { setOpen(v => !v); setError(null) }}
        disabled={!!busy}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-60"
        style={{ color: 'var(--accent)', background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
      >
        {busy ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        )}
        {busyLabel ?? 'Share'}
      </button>

      {/* Sheet */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 'min(340px, 92vw)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <div className="font-bold" style={{ color: 'var(--text-base)' }}>Export Results</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>APA2118 Contract Comparison</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>

          <SheetRow
            icon="📄"
            label="Download as PDF"
            sublabel="Results through the cumulative chart, print-ready"
            onClick={handlePDF}
            loading={busy === 'pdf'}
          />
          <SheetRow
            icon="⬇️"
            label="Download as image"
            sublabel="Save a PNG of your results (through the chart)"
            onClick={handleImage}
            loading={busy === 'image'}
          />

          {/* Error */}
          {error && (
            <div className="px-5 py-3 text-xs border-t" style={{ color: 'var(--negative)', borderColor: 'var(--border-subtle)' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
