import { useState, useRef, useEffect } from 'react'
import { encodeToURL } from '../../state/persistence'
import type { UserInputs } from '../../lib/types'

interface Props { inputs: Partial<UserInputs> }

// ── helpers ──────────────────────────────────────────────────────────────────

function getResultsEl() {
  return document.getElementById('results-container')
}

async function exportPDF() {
  const el = getResultsEl()
  if (!el) throw new Error('Results container not found')

  // html-to-image handles CSS custom properties correctly (uses computed styles),
  // unlike html2canvas which cannot resolve var(--…) tokens.
  const { toPng } = await import('html-to-image')
  const { jsPDF } = await import('jspdf')

  // Read the actual background colour so the PDF matches the current theme.
  const bgColor = getComputedStyle(el).backgroundColor || '#ffffff'

  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 2,        // 2× for sharp text on retina / HiDPI
    backgroundColor: bgColor,
    skipFonts: false,
  })

  // Load the captured image so we can slice it into A4 pages.
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  const MARGIN_MM  = 8
  const pdf        = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm    = pdf.internal.pageSize.getWidth()   // 210 mm
  const pageHmm    = pdf.internal.pageSize.getHeight()  // 297 mm
  const contentWmm = pageWmm - MARGIN_MM * 2
  const contentHmm = pageHmm - MARGIN_MM * 2

  // Scale factor: how many px in the captured image correspond to 1 mm on the PDF.
  const pxPerMm    = img.naturalWidth / contentWmm
  const sliceHpx   = Math.floor(contentHmm * pxPerMm)
  const totalPages = Math.ceil(img.naturalHeight / sliceHpx)

  // Slice the full capture into page-sized strips using an offscreen canvas.
  const canvas     = document.createElement('canvas')
  canvas.width     = img.naturalWidth
  const ctx        = canvas.getContext('2d')!

  for (let page = 0; page < totalPages; page++) {
    const srcY     = page * sliceHpx
    const srcH     = Math.min(sliceHpx, img.naturalHeight - srcY)
    const destHmm  = srcH / pxPerMm   // actual height of this strip in mm (last page may be shorter)

    canvas.height  = srcH
    ctx.clearRect(0, 0, canvas.width, srcH)
    ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, 0, 0, img.naturalWidth, srcH)

    const slice = canvas.toDataURL('image/jpeg', 0.92)
    if (page > 0) pdf.addPage()
    pdf.addImage(slice, 'JPEG', MARGIN_MM, MARGIN_MM, contentWmm, destHmm)
  }

  pdf.save(`APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.pdf`)
}

async function exportImage(): Promise<void> {
  const el = getResultsEl()
  if (!el) throw new Error('Results container not found')
  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(el, { cacheBust: true, quality: 0.95 })
  const link = document.createElement('a')
  link.download = `APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.png`
  link.href = dataUrl
  link.click()
}

function smsLink(url: string) {
  // Works on iOS (sms:&body=…) and Android (sms:?body=…)
  const body = encodeURIComponent(`Check out my APA2118 contract comparison: ${url}`)
  return `sms:&body=${body}`
}

function whatsappLink(url: string) {
  const text = encodeURIComponent(`APA2118 contract comparison results: ${url}`)
  return `https://wa.me/?text=${text}`
}

// ── Share item ────────────────────────────────────────────────────────────────

interface SheetItem {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void | Promise<void>
  loading?: boolean
}

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
        {loading ? (
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        ) : icon}
      </div>
      <div>
        <div className="font-semibold text-sm" style={{ color: 'var(--text-base)' }}>{label}</div>
        {sublabel && <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sublabel}</div>}
      </div>
      <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-faint)" strokeWidth="2">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ShareSheet({ inputs }: Props) {
  const [open, setOpen]           = useState(false)
  const [copied, setCopied]       = useState(false)
  const [pdfLoading, setPdf]      = useState(false)
  const [imgLoading, setImg]      = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const sheetRef                  = useRef<HTMLDivElement>(null)

  const shareURL = encodeToURL(inputs)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareURL)
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
    } catch { setError('Copy failed') }
  }

  const handlePDF = async () => {
    // Close the sheet first so it is not visible in the capture.
    setOpen(false)
    setPdf(true); setError(null)
    try {
      // Wait two frames for the dropdown to fully unmount before capturing.
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await exportPDF()
    } catch (e) {
      setError(`PDF failed: ${(e as Error).message}`)
      setOpen(true)   // re-open so the user can see the error
    } finally { setPdf(false) }
  }

  const handleImage = async () => {
    setImg(true); setError(null)
    try {
      await exportImage()
      setOpen(false)
    } catch (e) {
      setError(`Image failed: ${(e as Error).message}`)
    } finally { setImg(false) }
  }

  const items: SheetItem[] = [
    {
      icon: '💬',
      label: 'Text Message / iMessage',
      sublabel: 'Opens your Messages app with a pre-filled link',
      onClick: () => { window.open(smsLink(shareURL), '_blank'); setOpen(false) },
    },
    {
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-6 h-6"/>,
      label: 'WhatsApp',
      sublabel: 'Share your results link on WhatsApp',
      onClick: () => { window.open(whatsappLink(shareURL), '_blank'); setOpen(false) },
    },
    {
      icon: copied ? '✓' : '🔗',
      label: copied ? 'Link copied!' : 'Copy Link',
      sublabel: 'Paste anywhere — all your inputs are encoded in the URL',
      onClick: handleCopy,
    },
    {
      icon: '📄',
      label: 'Download as PDF',
      sublabel: 'Full results page as a print-ready PDF',
      onClick: handlePDF,
      loading: pdfLoading,
    },
    {
      icon: '🖼️',
      label: 'Download as Image',
      sublabel: 'PNG screenshot of your results',
      onClick: handleImage,
      loading: imgLoading,
    },
  ]

  return (
    <div className="relative" ref={sheetRef}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(v => !v); setError(null) }}
        disabled={pdfLoading || imgLoading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-60"
        style={{ color: 'var(--accent)', background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
      >
        {pdfLoading || imgLoading ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        )}
        {pdfLoading ? 'Generating PDF…' : imgLoading ? 'Saving image…' : 'Share'}
      </button>

      {/* Sheet panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 'min(340px, 90vw)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <div className="font-bold" style={{ color: 'var(--text-base)' }}>Share Results</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                APA2118 Contract Comparison
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="last:[&>*]:border-b-0">
            {items.map(item => <SheetRow key={item.label} {...item} />)}
          </div>

          {/* Error */}
          {error && (
            <div className="px-5 py-3 text-xs" style={{ color: 'var(--negative)', borderTop: '1px solid var(--border-subtle)' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
