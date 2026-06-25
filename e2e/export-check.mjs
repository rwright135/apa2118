/**
 * Browser smoke test for ShareSheet export paths.
 * Run: node e2e/export-check.mjs
 * Requires dev server running (npm run dev).
 */
import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const OUT_DIR = path.join(process.cwd(), 'e2e', 'output')

async function seedPage(page) {
  await page.addInitScript(() => {
    const inputs = {
      seat: 'FO',
      longevityAsOfJul2026: 4,
      anniversaryMonth: 8,
      lineType: 'FLYING',
      extraHoursAboveMMG: 0,
      dateOfBirth: { __type: 'Date', value: '1985-01-01T00:00:00.000Z' },
      investmentRate: 0.08,
      profitSharingLastYear: 1000,
      retentionCurrentBalance: 50000,
      retentionPayoutProbabilityB: 0.95,
      retentionPayoutProbabilityC: 0.9,
      voteNoScenarios: [{
        probability: 0.5,
        arrivalMonths: 6,
        percentAboveTA: 0.1,
        jcbaDurationMonths: 30,
      }],
      advancedPostJCBA: {
        enabled: false,
        scenarioA: { direction: 'SAME', magnitude: 0, probability: 1 },
        scenarioB: { direction: 'SAME', magnitude: 0, probability: 1 },
        scenarioC: { direction: 'SAME', magnitude: 0, probability: 1 },
      },
    }
    localStorage.setItem('apa2118_inputs', JSON.stringify(inputs))
  })
}

async function goToResults(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Get Started' }).click()

  for (let i = 0; i < 20; i++) {
    const calculate = page.getByRole('button', { name: /Calculate My Results/i })
    if (await calculate.isVisible({ timeout: 500 }).catch(() => false)) {
      await calculate.click()
      break
    }
    const continueBtn = page.getByRole('button', { name: /^Continue/i }).first()
    if (await continueBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      if (await continueBtn.isEnabled()) await continueBtn.click()
      else break
    }
  }

  await page.locator('#results-container').waitFor({ state: 'visible', timeout: 30000 })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  })

  const context = await browser.newContext({ acceptDownloads: true })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const page = await context.newPage()
  await seedPage(page)
  await goToResults(page)

  const shareTrigger = () => page.getByRole('button', { name: 'Share', exact: true })
  const results = {}

  // ── PDF download ──────────────────────────────────────────────────────────
  await shareTrigger().click()
  const pdfDownloadPromise = page.waitForEvent('download', { timeout: 30000 })
  await page.getByText('Download as PDF').click()
  const pdfDownload = await pdfDownloadPromise
  const pdfPath = path.join(OUT_DIR, await pdfDownload.suggestedFilename())
  await pdfDownload.saveAs(pdfPath)
  const pdfBytes = await readFile(pdfPath)
  results.pdf = {
    filename: await pdfDownload.suggestedFilename(),
    bytes: pdfBytes.length,
    validHeader: pdfBytes.slice(0, 4).toString() === '%PDF',
  }

  // ── PNG download ────────────────────────────────────────────────────────────
  await shareTrigger().click()
  const pngDownloadPromise = page.waitForEvent('download', { timeout: 30000 })
  await page.getByText('Download as image').click()
  const pngDownload = await pngDownloadPromise
  const pngPath = path.join(OUT_DIR, await pngDownload.suggestedFilename())
  await pngDownload.saveAs(pngPath)
  const pngBytes = await readFile(pngPath)
  results.png = {
    filename: await pngDownload.suggestedFilename(),
    bytes: pngBytes.length,
    validPngHeader: pngBytes[0] === 0x89 && pngBytes[1] === 0x50,
  }

  // ── Clipboard link ──────────────────────────────────────────────────────────
  await shareTrigger().click()
  await page.getByText('Copy link').click()
  await page.waitForTimeout(500)
  const copiedLink = await page.evaluate(() => navigator.clipboard.readText())
  const param = new URL(copiedLink).searchParams.get('d') ?? ''
  const rawJson = Buffer.from(param, 'base64').toString('utf8')
  results.link = {
    copied: copiedLink.includes('d='),
    length: copiedLink.length,
    isCompactFormat: rawJson.startsWith('{'),        // not percent-encoded
    containsAdvanced: rawJson.includes('advancedPostJCBA'),
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))

  await browser.close()

  const failed =
    !results.pdf.validHeader ||
    !results.png.validPngHeader ||
    !results.link.copied ||
    !results.link.isCompactFormat ||
    results.link.containsAdvanced  // disabled advancedPostJCBA should be omitted

  if (failed) {
    console.error('One or more checks failed')
    process.exit(1)
  }

  console.log('All export checks passed.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
