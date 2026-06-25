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
  })

  afterEach(() => {
    container.remove()
    vi.restoreAllMocks()
  })

  async function openShareSheet() {
    render(<ShareSheet inputs={{ seat: 'FO', longevityAsOfJul2026: 4 }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    await screen.findByText('Share Results')
  }

  it('shows native share copy when file sharing is supported', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: vi.fn(),
      canShare: vi.fn().mockReturnValue(true),
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })

    await openShareSheet()
    expect(screen.getByText('Share as image')).toBeInTheDocument()
    expect(screen.getByText(/Messages, WhatsApp, email/)).toBeInTheDocument()
  })

  it('shows download fallback copy when native file sharing is unavailable', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })

    await openShareSheet()
    expect(screen.getByText('Download image to share')).toBeInTheDocument()
    expect(screen.getByText(/attach it as a picture message/)).toBeInTheDocument()
  })

  it('copies encoded link to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText },
    })

    await openShareSheet()
    fireEvent.click(screen.getByText('Copy link'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledOnce()
    })
    expect(writeText.mock.calls[0][0]).toContain('d=')
    expect(await screen.findByText('Link copied!')).toBeInTheDocument()
  })

  it('downloads PNG when Download as image is clicked', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText: vi.fn() },
    })

    const click = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') el.click = click
      return el
    })

    await openShareSheet()
    fireEvent.click(screen.getByText('Download as image'))

    await waitFor(() => {
      expect(click).toHaveBeenCalled()
    })
  })

  it('generates a multi-page PDF from captured image slices', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText: vi.fn() },
    })

    await openShareSheet()
    fireEvent.click(screen.getByText('Download as PDF'))

    await waitFor(() => {
      expect(pdfSave).toHaveBeenCalledOnce()
    })

    expect(pdfSave.mock.calls[0][0]).toMatch(/^APA2118-Contract-Comparison-\d{4}-\d{2}-\d{2}\.pdf$/)
    expect(pdfAddImage).toHaveBeenCalled()
    expect(pdfAddPage.mock.calls.length).toBeGreaterThan(0)
  })

  it('invokes native share with PNG file on supported platforms', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      share,
      canShare: vi.fn().mockReturnValue(true),
      clipboard: { writeText: vi.fn() },
    })

    await openShareSheet()
    fireEvent.click(screen.getByText('Share as image'))

    await waitFor(() => {
      expect(share).toHaveBeenCalledOnce()
    })

    const payload = share.mock.calls[0][0]
    expect(payload.title).toBe('APA2118 Contract Comparison')
    expect(payload.files).toHaveLength(1)
    expect(payload.files[0]).toBeInstanceOf(File)
    expect(payload.files[0].type).toBe('image/png')
  })

  it('falls back to PNG download when native share is unavailable', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText: vi.fn() },
    })

    const click = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') el.click = click
      return el
    })

    await openShareSheet()
    fireEvent.click(screen.getByText('Download image to share'))

    await waitFor(() => {
      expect(click).toHaveBeenCalled()
    })
  })

  it('surfaces an error when results container is missing', async () => {
    container.remove()

    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      canShare: undefined,
      clipboard: { writeText: vi.fn() },
    })

    await openShareSheet()
    fireEvent.click(screen.getByText('Download as PDF'))

    expect(await screen.findByText(/PDF failed: Results container not found/)).toBeInTheDocument()
  })
})
