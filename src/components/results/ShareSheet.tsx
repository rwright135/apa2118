import { useState, useRef, useEffect } from 'react'
import { encodeToURL } from '../../state/persistence'
import type { UserInputs } from '../../lib/types'

interface Props { inputs: Partial<UserInputs> }

// ── Capture helpers ───────────────────────────────────────────────────────────

function getResultsEl() {
  return document.getElementById('results-container')
}

/** Capture the results container as a PNG data URL.
 *  The sticky toolbar (Edit Inputs / Share / theme toggle) is hidden during
 *  capture so the exported image looks like a clean document rather than an
 *  app screenshot.
 */
async function captureImage(): Promise<string> {
  const el = getResultsEl()
  if (!el) throw new Error('Results container not found')

  // Hide the toolbar for a clean, chrome-free capture
  const toolbar = document.getElementById('results-toolbar')
  const prevDisplay = toolbar ? toolbar.style.display : null
  if (toolbar) toolbar.style.display = 'none'

  try {
    // Allow the browser to repaint before measuring
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    const { toPng } = await import('html-to-image')
    const bgColor = getComputedStyle(el).backgroundColor || '#ffffff'
    return await toPng(el, { cacheBust: true, pixelRatio: 2, backgroundColor: bgColor, skipFonts: false })
  } finally {
    // Always restore the toolbar, even if capture throws
    if (toolbar && prevDisplay !== null) toolbar.style.display = prevDisplay
  }
}

/** Convert a data URL to a File for the Web Share API. */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new File([arr], filename, { type: mime })
}

/** Returns true if the browser supports sharing image files natively. */
function canNativeShare(): boolean {
  if (!navigator.share || !navigator.canShare) return false
  return navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })
}

async function exportPDF() {
  const dataUrl = await captureImage()
  const { jsPDF } = await import('jspdf')

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  const MARGIN_MM  = 8
  const pdf        = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWmm    = pdf.internal.pageSize.getWidth()
  const pageHmm    = pdf.internal.pageSize.getHeight()
  const contentWmm = pageWmm - MARGIN_MM * 2
  const contentHmm = pageHmm - MARGIN_MM * 2
  const pxPerMm    = img.naturalWidth / contentWmm
  const sliceHpx   = Math.floor(contentHmm * pxPerMm)
  const totalPages = Math.ceil(img.naturalHeight / sliceHpx)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  const ctx = canvas.getContext('2d')!

  for (let page = 0; page < totalPages; page++) {
    const srcY    = page * sliceHpx
    const srcH    = Math.min(sliceHpx, img.naturalHeight - srcY)
    const destHmm = srcH / pxPerMm
    canvas.height = srcH
    ctx.clearRect(0, 0, canvas.width, srcH)
    ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, 0, 0, img.naturalWidth, srcH)
    const slice = canvas.toDataURL('image/jpeg', 0.92)
    if (page > 0) pdf.addPage()
    pdf.addImage(slice, 'JPEG', MARGIN_MM, MARGIN_MM, contentWmm, destHmm)
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ShareSheet({ inputs }: Props) {
  const [open, setOpen]        = useState(false)
  const [copied, setCopied]    = useState(false)
  const [busy, setBusy]        = useState<null | 'share' | 'pdf' | 'image'>(null)
  const [error, setError]      = useState<string | null>(null)
  const sheetRef               = useRef<HTMLDivElement>(null)

  const shareURL = encodeToURL(inputs)
  const nativeShare = canNativeShare()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /** Capture the screen, then invoke the platform share sheet or download. */
  const handleShareImage = async () => {
    setOpen(false)
    setBusy('share'); setError(null)
    try {
      const dataUrl = await captureImage()
      const filename = `APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.png`

      if (nativeShare) {
        // Mobile: invoke OS share sheet with the image file.
        // User picks Messages, WhatsApp, Mail, etc.
        const file = dataUrlToFile(dataUrl, filename)
        await navigator.share({ files: [file], title: 'APA2118 Contract Comparison' })
      } else {
        // Desktop fallback: download the image so the user can attach it manually.
        const link = document.createElement('a')
        link.download = filename
        link.href = dataUrl
        link.click()
      }
    } catch (e) {
      // AbortError = user dismissed the native sheet — not a real error.
      if ((e as DOMException).name !== 'AbortError') {
        setError(`Share failed: ${(e as Error).message}`)
        setOpen(true)
      }
    } finally { setBusy(null) }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareURL)
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
    } catch { setError('Copy failed') }
  }

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

  const busyLabel = busy === 'share' ? 'Capturing…' : busy === 'pdf' ? 'Generating PDF…' : busy === 'image' ? 'Saving image…' : null

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
              <div className="font-bold" style={{ color: 'var(--text-base)' }}>Share Results</div>
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

          {/* Send section */}
          <SectionLabel>Send</SectionLabel>
          <SheetRow
            icon="🖼️"
            label={nativeShare ? 'Share as image' : 'Download image to share'}
            sublabel={
              nativeShare
                ? 'Opens your share sheet — pick Messages, WhatsApp, email, or any app'
                : 'Save the image, then attach it as a picture message'
            }
            onClick={handleShareImage}
            loading={busy === 'share'}
          />
          <SheetRow
            icon={copied ? '✓' : '🔗'}
            label={copied ? 'Link copied!' : 'Copy link'}
            sublabel="Paste anywhere — all your inputs are encoded in the URL"
            onClick={handleCopy}
          />

          {/* Save section */}
          <SectionLabel>Save</SectionLabel>
          <SheetRow
            icon="📄"
            label="Download as PDF"
            sublabel="Full results page as a print-ready PDF"
            onClick={handlePDF}
            loading={busy === 'pdf'}
          />
          <SheetRow
            icon="⬇️"
            label="Download as image"
            sublabel="Save a PNG of your results to this device"
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
