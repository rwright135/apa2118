/**
 * Smoke test for the month-by-month detail table summary footer.
 * Run: node e2e/breakdown-check.mjs
 * Requires dev server running (npm run dev).
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const OUT_DIR = path.join(process.cwd(), 'e2e', 'output')

function baseInputs(overrides = {}) {
  return {
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
      arrivalMonths: 13,
      percentAboveTA: 0.14,
      jcbaDurationMonths: 29,
      ...overrides,
    }],
    advancedPostJCBA: { scenarioCPenalty: 0.15 },
  }
}

async function seedPage(page, inputs) {
  await page.addInitScript((inputsJson) => {
    localStorage.setItem('apa2118_inputs', inputsJson)
  }, JSON.stringify(inputs))
}

async function goToResults(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Get Started' }).click()

  for (let i = 0; i < 40; i++) {
    const calculate = page.getByRole('button', { name: /Calculate My Results/i })
    if (await calculate.isVisible({ timeout: 500 }).catch(() => false)) {
      await calculate.click()
      break
    }
    const continueBtn = page.getByRole('button', { name: /Continue/i }).first()
    if (await continueBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      if (await continueBtn.isEnabled()) {
        await continueBtn.click()
        await page.waitForTimeout(150)
      } else {
        const option = page.getByRole('button', { name: /^(1|I don't plan on upgrading)$/ }).first()
        if (await option.isVisible({ timeout: 300 }).catch(() => false)) {
          await option.click()
          await page.waitForTimeout(150)
        } else {
          console.error(`Stuck at step ${i}: Continue button disabled`)
          break
        }
      }
    } else {
      console.error(`Stuck at step ${i}: no Continue/Calculate button found`)
      break
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
  const context = await browser.newContext({ viewport: { width: 900, height: 1600 } })
  const page = await context.newPage()

  await seedPage(page, baseInputs())
  await goToResults(page)

  const breakdownHeadings = await page.getByRole('heading', { name: 'Your Full Breakdown' }).count()
  console.log('Breakdown heading count (expect 0):', breakdownHeadings)
  if (breakdownHeadings !== 0) {
    throw new Error('Your Full Breakdown section should be removed')
  }

  const detailHeading = page.locator('text=Month-by-Month Detail').first()
  await detailHeading.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT_DIR, 'detail-table-footer.png'), fullPage: false })

  const footerText = await page.locator('text=Total retirement savings @ 65').first().locator('../..').innerText()
  console.log('Detail table footer text:\n', footerText)

  await context.close()
  await browser.close()
  console.log('Screenshots saved to e2e/output/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
