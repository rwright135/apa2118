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
  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,/9j/4AAQ')
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
  })

  afterEach(() => {
    container.remove()
    vi.restoreAllMocks()
  })

  async function openSheet() {
    render(<ShareSheet />)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    await screen.findByText('Export Results')
  }

  it('renders Export Results header with PDF and image actions only', async () => {
    await openSheet()
    expect(screen.queryByText('Copy link')).not.toBeInTheDocument()
    expect(screen.getByText('Download as PDF')).toBeInTheDocument()
    expect(screen.getByText('Download as image')).toBeInTheDocument()
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

  it('generates a PDF from captured image', async () => {
    await openSheet()
    fireEvent.click(screen.getByText('Download as PDF'))

    await waitFor(() => expect(pdfSave).toHaveBeenCalledOnce())
    expect(pdfSave.mock.calls[0][0]).toMatch(/^APA2118-Contract-Comparison-\d{4}-\d{2}-\d{2}\.pdf$/)
    expect(pdfAddImage).toHaveBeenCalled()
  })

  it('surfaces an error when results container is missing', async () => {
    container.remove()

    await openSheet()
    fireEvent.click(screen.getByText('Download as PDF'))

    expect(await screen.findByText(/PDF failed: Results container not found/)).toBeInTheDocument()
  })
})
