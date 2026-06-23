/**
 * Pilot epaulet shoulder-board icons.
 * FO = 3 gold stripes, Captain = 4 gold stripes.
 * Drawn as a rectangular board with a rounded top and horizontal gold stripes.
 */

interface EpauletProps {
  /** Width of the icon in px (height scales proportionally at ~1.6:1) */
  size?: number
  /** Fill color for the board base */
  boardColor?: string
  /** Gold stripe color */
  stripeColor?: string
}

function EpauletBase({
  stripes,
  size = 48,
  boardColor = 'currentColor',
  stripeColor = '#c9a84c',
}: EpauletProps & { stripes: 3 | 4 }) {
  const w = size
  const h = Math.round(size * 1.55)
  const r = Math.round(size * 0.18) // corner radius

  // Stripe geometry — evenly spaced from bottom, stripe height ~9% of h
  const stripeH = Math.round(h * 0.09)
  const stripeGap = Math.round(h * 0.06)
  const bottomPad = Math.round(h * 0.08)

  const stripeY = (i: number) =>
    h - bottomPad - stripeH - i * (stripeH + stripeGap)

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Board body */}
      <rect
        x="1" y="1"
        width={w - 2} height={h - 2}
        rx={r} ry={r}
        fill={boardColor}
        stroke={stripeColor}
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />

      {/* Stripes */}
      {Array.from({ length: stripes }, (_, i) => (
        <rect
          key={i}
          x="4"
          y={stripeY(i)}
          width={w - 8}
          height={stripeH}
          rx="2"
          fill={stripeColor}
        />
      ))}

      {/* Top pip / button (small circle centered at top) */}
      <circle
        cx={w / 2}
        cy={Math.round(h * 0.1)}
        r={Math.round(size * 0.07)}
        fill={stripeColor}
      />
    </svg>
  )
}

export function EpauletFO(props: EpauletProps) {
  return <EpauletBase stripes={3} {...props} />
}

export function EpauletCA(props: EpauletProps) {
  return <EpauletBase stripes={4} {...props} />
}
