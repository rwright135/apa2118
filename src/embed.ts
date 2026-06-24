// Embed harness: reports height to parent frame for iframe auto-resize
// Host page snippet:
//   window.addEventListener('message', (e) => {
//     if (e.data?.type === 'apa2118-resize') {
//       document.getElementById('apa-tool').style.height = e.data.height + 'px'
//     }
//   })

export function initEmbedResize(): void {
  if (window.self === window.top) return // not in an iframe

  const sendHeight = () => {
    const height = document.documentElement.scrollHeight
    window.parent.postMessage({ type: 'apa2118-resize', height }, '*')
  }

  sendHeight()

  const ro = new ResizeObserver(sendHeight)
  ro.observe(document.body)

  const mo = new MutationObserver(sendHeight)
  mo.observe(document.body, { childList: true, subtree: true, attributes: true })
}
