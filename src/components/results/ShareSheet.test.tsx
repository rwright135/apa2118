import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareSheet } from './ShareSheet'

const MOCK_PNG = 'data:image/png;base64,iVBORw0KGgo='

const { pdfSave, pdfAddImage, pdfAddPage } = vi.hoisted(() => ({
  pdfSave: vi.fn(),
  pdfAddImage: vi.fn(),
  pdfAddPage: vi.fn(),
}))

vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue(MOCK_PNG),
}))

vi.mock('jspdf', () => ({
  jsPDF: class MockJsPDF {
    internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
    addPage = pdfAddPage
    addImage = pdfAddImage
    save = pdfSave
  },
}))

function setupResultsContainer() {
  const container = document.createElement('div')
  container.id = 'results-container'
  container.style.width = '800px'
  container.style.height = '1200px'
  container.style.background = '#ffffff'
  container.textContent = 'Mock results content'
  document.body.appendChild(container)
  return container
}

function mockImageLoad(width = 800, height = 2400) {
  class MockImage {
    naturalWidth = width
    naturalHeight = height
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    private _src = ''
    set src(value: string) {
      this._src = value
      queueMicrotask(() => this.onload?.())
    }
    get src() {
      return this._src
    }
  }
  vi.stubGlobal('Image', MockImage)
}

function mockCanvas() {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,/9j/4AAQ')
}

describe('ShareSheet export flows', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = setupResultsContainer()
    mockImageLoad()
    mockCanvas()
    pdfSave.mockClear()
    pdfAddImage.mockClear()
    pdfAddPage.mockClear()
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    container.remove()
    vi.restoreAllMocks()
  })

  async function openSheet() {
    render(<ShareSheet inputs={{ seat: 'FO', longevityAsOfJul2026: 4 }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    await screen.findByText('Export Results')
  }

  it('renders Export Results header with three actions', async () => {
    await openSheet()
    expect(screen.getByText('Copy link')).toBeInTheDocument()
    expect(screen.getByText('Download as PDF')).toBeInTheDocument()
    expect(screen.getByText('Download as image')).toBeInTheDocument()
  })

  it('copies compact encoded link to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    await openSheet()
    fireEvent.click(screen.getByText('Copy link'))

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    const url = writeText.mock.calls[0][0] as string
    expect(url).toContain('d=')
    // Compact format: the 'd' param is btoa(json), not btoa(encodeURIComponent(json))
    const param = new URL(url).searchParams.get('d')!
    const decoded = atob(param)
    expect(decoded).toMatch(/^\{/)   // starts with '{' — raw JSON, not percent-encoded
    expect(await screen.findByText('Link copied!')).toBeInTheDocument()
  })

  it('downloads PNG when "Download as image" is clicked', async () => {
    const click = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') el.click = click
      return el
    })

    await openSheet()
    fireEvent.click(screen.getByText('Download as image'))

    await waitFor(() => expect(click).toHaveBeenCalled())
  })

  it('generates a multi-page PDF from captured image slices', async () => {
    await openSheet()
    fireEvent.click(screen.getByText('Download as PDF'))

    await waitFor(() => expect(pdfSave).toHaveBeenCalledOnce())
    expect(pdfSave.mock.calls[0][0]).toMatch(/^APA2118-Contract-Comparison-\d{4}-\d{2}-\d{2}\.pdf$/)
    expect(pdfAddImage).toHaveBeenCalled()
    expect(pdfAddPage.mock.calls.length).toBeGreaterThan(0)
  })

  it('surfaces an error when results container is missing', async () => {
    container.remove()

    await openSheet()
    fireEvent.click(screen.getByText('Download as PDF'))

    expect(await screen.findByText(/PDF failed: Results container not found/)).toBeInTheDocument()
  })
})
