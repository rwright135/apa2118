/**
 * Visual smoke test for the new Betting Odds card.
 * Run: node e2e/betting-odds-check.mjs
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
        // Some steps require selecting an option tile before Continue enables.
        const option = page.getByRole('button', { name: /^(1|I don't plan on upgrading)$/ }).first()
        if (await option.isVisible({ timeout: 300 }).catch(() => false)) {
          await option.click()
          await page.waitForTimeout(150)
        } else {
          console.error(`Stuck at step ${i}: Continue button disabled`)
          await page.screenshot({ path: path.join(OUT_DIR, `debug-stuck-${i}.png`) })
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

async function shot(page, inputs, filename) {
  await seedPage(page, inputs)
  await goToResults(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  const card = page.locator('text=Vegas Odds').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false })
}

async function shotChart(page, inputs, filename) {
  await seedPage(page, inputs)
  await goToResults(page)
  const chart = page.locator('text=Cumulative Cash Flow Over Time').first()
  await chart.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  })
  const context = await browser.newContext({ viewport: { width: 900, height: 1400 } })
  const page = await context.newPage()

  // Scenario 1: default 50/50, moderate reward vs risk
  await shot(page, baseInputs(), 'betting-odds-default.png')

  // Scenario 2: high probability + low risk => should read as a "value bet" / favorite for Vote No
  await shot(page, baseInputs({ probability: 0.85, percentAboveTA: 0.25, arrivalMonths: 4, jcbaDurationMonths: 12 }), 'betting-odds-favorite-no.png')

  // Scenario 3: low probability + steep downside => "long shot" leaning Vote Yes
  await shot(page, baseInputs({ probability: 0.15, percentAboveTA: 0.05, arrivalMonths: 24, jcbaDurationMonths: 60 }), 'betting-odds-longshot.png')

  await context.close()

  // Scenario 4: near-zero penalty for no-offer scenario => should approach a "free roll" lock
  const lockContext = await browser.newContext({ viewport: { width: 900, height: 1400 } })
  const lockPage = await lockContext.newPage()
  await seedPage(lockPage, {
    ...baseInputs({ probability: 0.5, percentAboveTA: 0.14, arrivalMonths: 13, jcbaDurationMonths: 29 }),
    advancedPostJCBA: { scenarioCPenalty: 0 },
    retentionPayoutProbabilityC: 1,
  })
  await goToResults(lockPage)
  await lockPage.locator('text=Vegas Odds').first().scrollIntoViewIfNeeded()
  await lockPage.waitForTimeout(300)
  await lockPage.screenshot({ path: path.join(OUT_DIR, 'betting-odds-lock.png') })
  await lockContext.close()

  // Mobile-width check
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 1600 } })
  const mobilePage = await mobileContext.newPage()
  await shot(mobilePage, baseInputs(), 'betting-odds-mobile.png')
  await mobileContext.close()

  // Dark mode check
  const darkContext = await browser.newContext({ viewport: { width: 900, height: 1400 }, colorScheme: 'dark' })
  const darkPage = await darkContext.newPage()
  await shot(darkPage, baseInputs({ probability: 0.85, percentAboveTA: 0.25, arrivalMonths: 4, jcbaDurationMonths: 12 }), 'betting-odds-dark.png')
  await darkContext.close()

  const chartContext = await browser.newContext({ viewport: { width: 900, height: 900 } })
  const chartPage = await chartContext.newPage()
  await shotChart(chartPage, baseInputs(), 'cumulative-chart.png')
  await chartContext.close()

  const chartMobileContext = await browser.newContext({ viewport: { width: 390, height: 900 } })
  const chartMobilePage = await chartMobileContext.newPage()
  await shotChart(chartMobilePage, baseInputs(), 'cumulative-chart-mobile.png')
  await chartMobileContext.close()

  const chartDarkContext = await browser.newContext({ viewport: { width: 900, height: 900 }, colorScheme: 'dark' })
  const chartDarkPage = await chartDarkContext.newPage()
  await shotChart(chartDarkPage, baseInputs(), 'cumulative-chart-dark.png')
  await chartDarkContext.close()

  await browser.close()
  console.log('Screenshots saved to e2e/output/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
