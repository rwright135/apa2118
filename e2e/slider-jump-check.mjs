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
  const context = await browser.newContext({ viewport: { width: 414, height: 1200 } })
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

  const rangeInput = page.locator('input[type="range"]').nth(1)
  await rangeInput.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  const widget = rangeInput.locator('xpath=ancestor::div[contains(@class,"space-y-3")][1]')
  const valueDisplay = widget.locator('span.text-4xl.font-bold')

  // Before click: value should be 13 months (seeded)
  const valueBefore = await valueDisplay.textContent()
  console.log('value before click:', valueBefore)

  await widget.screenshot({ path: path.join(OUT_DIR, 'slider-jump-before.png') })

  // Click the FedEx logo (far right, distinct value) to test jump
  const fedexChip = page.getByRole('button', { name: /FedEx/i }).first()
  await fedexChip.click()
  await page.waitForTimeout(300)

  const valueAfter = await valueDisplay.textContent()
  console.log('value after clicking FedEx logo:', valueAfter)

  // Modal should also be open
  const modalVisible = await page.getByRole('dialog').isVisible({ timeout: 1000 }).catch(() => false)
  console.log('modal opened:', modalVisible)

  await page.screenshot({ path: path.join(OUT_DIR, 'slider-jump-modal.png') })

  // Close modal, screenshot final slider state
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  await widget.screenshot({ path: path.join(OUT_DIR, 'slider-jump-after.png') })

  await browser.close()
  console.log('done')
}

main().catch(err => { console.error(err); process.exit(1) })
