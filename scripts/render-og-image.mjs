import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, 'og-image.html')
const outputPath = path.join(__dirname, '../public/og-image.png')

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: outputPath, type: 'png' })
  console.log(`Wrote ${outputPath}`)

  const jpgPath = outputPath.replace(/\.png$/, '.jpg')
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 85 })
  console.log(`Wrote ${jpgPath}`)
} finally {
  await browser.close()
}
