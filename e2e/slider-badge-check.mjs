import { chromium, webkit } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5183'
const OUT_DIR = path.join(process.cwd(), 'e2e', 'output')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const chromeBrowser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  })
  const webkitBrowser = await webkit.launch({ headless: true })

  const runs = [
    { engine: 'chromium', browser: chromeBrowser, widths: [375, 414, 768, 1024] },
    { engine: 'webkit', browser: webkitBrowser, widths: [375, 414] },
  ]

  for (const { engine, browser, widths } of runs) {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    await page.addInitScript(() => {
      localStorage.setItem('apa2118_wizard_step', JSON.stringify('voteNo'))
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
        voteNoScenarios: [{ probability: 0.5, arrivalMonths: 13, percentAboveTA: 0.14, jcbaDurationMonths: 29 }],
        advancedPostJCBA: { scenarioCPenalty: 0.15 },
      }
      localStorage.setItem('apa2118_inputs', JSON.stringify(inputs))
    })
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.waitForTimeout(300)

    // Click through the wizard until we reach the vote-no assumptions step.
    const heading = page.getByText('how many months from July', { exact: false }).first()
    for (let i = 0; i < 20; i++) {
      if (await heading.isVisible({ timeout: 300 }).catch(() => false)) break
      const cont = page.getByRole('button', { name: /Continue/i }).first()
      if (await cont.isVisible({ timeout: 300 }).catch(() => false)) {
        if (await cont.isEnabled()) {
          await cont.click()
          await page.waitForTimeout(200)
          continue
        }
      }
      const opt = page.getByRole('button', { name: /^(1|I don't plan on upgrading)$/ }).first()
      if (await opt.isVisible({ timeout: 300 }).catch(() => false)) {
        await opt.click()
        await page.waitForTimeout(200)
        continue
      }
      break
    }

    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT_DIR, `slider-badge-${engine}-${width}.png`), fullPage: true })

    const rangeInput = page.locator('input[type="range"]').nth(1)
    await rangeInput.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    // Screenshot the whole slider widget: its grandparent (space-y-3) that also
    // contains the value text and the chip row.
    const widget = rangeInput.locator('xpath=ancestor::div[contains(@class,"space-y-3")][1]')
    await widget.screenshot({ path: path.join(OUT_DIR, `slider-badge-zoom-${engine}-${width}.png`) }).catch(async (e) => {
      console.error('zoom screenshot failed', e.message)
    })

    const measurements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="range"]'))
      const input = inputs[1]
      const container = input?.parentElement
      const badge = container?.querySelector('span.rounded-full') // the count badge
      const chipButtons = container ? Array.from(container.querySelectorAll('button')) : []
      const rect = (el) => el ? (({ top, left, width, height, bottom }) => ({ top, left, width, height, bottom }))(el.getBoundingClientRect()) : null
      return {
        container: rect(container),
        input: rect(input),
        badge: rect(badge),
        chipButtons: chipButtons.map(b => rect(b)),
      }
    })
    console.log(`engine=${engine} width=${width}`, JSON.stringify(measurements))

    await context.close()
  }
  }

  await chromeBrowser.close()
  await webkitBrowser.close()
  console.log('done')
}

main().catch(err => { console.error(err); process.exit(1) })
