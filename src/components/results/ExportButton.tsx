import { useState } from 'react'

export function ExportButton() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const html2pdfModule = await import('html2pdf.js')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (html2pdfModule.default || html2pdfModule) as any

      const element = document.getElementById('results-container')
      if (!element) {
        console.error('Results container not found')
        return
      }

      const options = {
        margin: [10, 10, 10, 10],
        filename: `APA2118-Contract-Comparison-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          backgroundColor: '#0a0f1e',
          useCORS: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      await html2pdf().set(options).from(element).save()
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : 'PDF'}
    </button>
  )
}
