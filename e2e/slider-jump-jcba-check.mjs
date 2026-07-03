import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5183'
const OUT_DIR = path.join(process.cwd(), 'e2e', 'output')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  })
  const context = await browser.newContext({ viewport: { width: 414, height: 1400 } })
  const page = await context.newPage()

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
      voteNoScenarios: [{ probability: 0.5, arrivalMonths: 13, percentAboveTA: 0.14, jcbaDurationMonths: 29 }],
      advancedPostJCBA: { scenarioCPenalty: 0.15 },
    }
    localStorage.setItem('apa2118_inputs', JSON.stringify(inputs))
  })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Get Started' }).click()
  await page.waitForTimeout(300)

  const heading = page.getByText('how many months from July', { exact: false }).first()
  for (let i = 0; i < 20; i++) {
    if (await heading.isVisible({ timeout: 300 }).catch(() => false)) break
    const cont = page.getByRole('button', { name: /Continue/i }).first()
    if (await cont.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await cont.isEnabled()) { await cont.click(); await page.waitForTimeout(200); continue }
    }
    const opt = page.getByRole('button', { name: /^(1|I don't plan on upgrading)$/ }).first()
    if (await opt.isVisible({ timeout: 300 }).catch(() => false)) { await opt.click(); await page.waitForTimeout(200); continue }
    break
  }

  const rangeInput = page.locator('input[type="range"]').nth(3) // JCBA duration slider
  await rangeInput.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  const widget = rangeInput.locator('xpath=ancestor::div[contains(@class,"space-y-3")][1]')
  const valueDisplay = widget.locator('span.text-4xl.font-bold')

  const valueBefore = await valueDisplay.textContent()
  console.log('JCBA value before click:', valueBefore)
  await widget.screenshot({ path: path.join(OUT_DIR, 'slider-jump-jcba-before.png') })

  const allChips = await widget.locator('button[aria-label]').all()
  for (const chip of allChips) {
    console.log('chip:', await chip.getAttribute('aria-label'))
  }

  const unitedChip = widget.locator('button[aria-label^="United Airlines & American"]').first()
  const hasSpecific = await unitedChip.count()
  const targetChip = hasSpecific > 0 ? unitedChip : widget.locator('button[aria-label]').nth(1)
  console.log('clicking:', await targetChip.getAttribute('aria-label'))
  await targetChip.click({ force: true })
  await page.waitForTimeout(300)

  const valueAfter = await valueDisplay.textContent()
  console.log('JCBA value after clicking United logo:', valueAfter)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  await widget.screenshot({ path: path.join(OUT_DIR, 'slider-jump-jcba-after.png') })

  await browser.close()
  console.log('done')
}

main().catch(err => { console.error(err); process.exit(1) })
