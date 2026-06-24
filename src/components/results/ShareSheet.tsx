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
  const mod = await import('html2pdf.js')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (mod.default || mod) as any
  await html2pdf()
    .set({
      margin: [8, 8, 8, 8],
      filename: `APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .from(el)
    .save()
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
    setPdf(true); setError(null)
    try {
      await exportPDF()
      setOpen(false)
    } catch (e) {
      setError(`PDF failed: ${(e as Error).message}`)
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
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
        style={{ color: 'var(--accent)', background: 'var(--chip-bg)', border: '1px solid var(--chip-border)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
        </svg>
        Share
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
