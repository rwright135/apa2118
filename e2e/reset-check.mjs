/**
 * Cross-browser compatibility check for the "Restart" (hard reset) button.
 *
 * Reproduces the reported bug: reset works the first time, but stops working
 * a short time later after the user has answered a few more questions —
 * caused by a stale `?d=` share-link URL param surviving a soft in-app reset
 * and silently re-hydrating the wizard on the next page load.
 *
 * Run: node e2e/reset-check.mjs
 * Requires a built/served app (npm run build && npm run preview -- --port 4173).
 */
import { chromium, firefox, webkit } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const ENGINES = [
  { name: 'Chromium (Chrome / Edge)', launcher: chromium },
  { name: 'Firefox', launcher: firefox },
  { name: 'WebKit (Safari)', launcher: webkit },
]

async function acceptTermsAndStart(page) {
  await page.locator('input[type="checkbox"]').check()
  await page.getByRole('button', { name: 'Get Started' }).click()
}

async function answerSeatStep(page) {
  await acceptTermsAndStart(page)
  // Seat step — pick First Officer
  await page.getByText('First Officer', { exact: false }).first().click()
  const cont = page.getByRole('button', { name: /^Continue/i }).first()
  if (await cont.isVisible({ timeout: 1000 }).catch(() => false)) {
    if (await cont.isEnabled()) await cont.click()
  }
}

async function getStoredInputsRaw(page) {
  return page.evaluate(() => localStorage.getItem('apa2118_inputs'))
}

async function getURLParam(page) {
  return page.evaluate(() => new URL(window.location.href).searchParams.get('d'))
}

async function runChecks(name, launcher) {
  const result = { browser: name, checks: {} }
  const browser = await launcher.launch()
  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    // ── Scenario: page loaded with a lingering shared-link `?d=` param ──────
    // (as if the user arrived via a Share link, or one was generated earlier
    // in the session and the tab's address bar still carries it)
    const sharedPayload = Buffer.from(JSON.stringify({ seat: 'CA', longevityAsOfJul2026: 9 })).toString('base64')
    await page.goto(`${BASE_URL}/?d=${sharedPayload}`, { waitUntil: 'networkidle' })

    // Confirm the shared answers actually hydrated (sanity check on our setup)
    await acceptTermsAndStart(page)
    await page.waitForTimeout(300)

    // ── First reset ──────────────────────────────────────────────────────────
    const resetBtn = page.getByLabel('Restart calculator')
    await resetBtn.click()
    await page.waitForLoadState('networkidle')

    const urlParamAfterFirstReset = await getURLParam(page)
    const storageAfterFirstReset = await getStoredInputsRaw(page)
    result.checks.firstResetClearsURL = urlParamAfterFirstReset === null
    result.checks.firstResetClearsStorage = storageAfterFirstReset === null

    // ── Answer a few questions again ─────────────────────────────────────────
    await answerSeatStep(page)
    await page.waitForTimeout(200)

    // ── Second reset, ~immediately after (reproduces "15 seconds later") ────
    const resetBtn2 = page.getByLabel('Restart calculator')
    await resetBtn2.click()
    await page.waitForLoadState('networkidle')

    const urlParamAfterSecondReset = await getURLParam(page)
    const storageAfterSecondReset = await getStoredInputsRaw(page)
    result.checks.secondResetClearsURL = urlParamAfterSecondReset === null
    result.checks.secondResetClearsStorage = storageAfterSecondReset === null

    // Confirm we're actually back at the welcome screen, not mid-wizard
    const getStartedVisible = await page
      .getByRole('button', { name: 'Get Started' })
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    result.checks.landsOnWelcomeScreen = getStartedVisible

    await context.close()
  } catch (e) {
    result.error = String(e)
  } finally {
    await browser.close()
  }
  return result
}

async function main() {
  const results = []
  for (const { name, launcher } of ENGINES) {
    console.log(`\n── ${name} ──`)
    const r = await runChecks(name, launcher)
    results.push(r)
    console.log(JSON.stringify(r, null, 2))
  }

  const allPassed = results.every(
    r => !r.error && Object.values(r.checks).every(Boolean)
  )

  console.log('\n' + '='.repeat(60))
  console.log(allPassed ? 'All browsers: reset is reliable on repeat use.' : 'FAILURES DETECTED — see above.')
  console.log('='.repeat(60))

  if (!allPassed) process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
