import { useState } from 'react'
import { useStore } from '../../state/store'
import { ThemeToggle } from '../shared/ThemeToggle'
import { TermsOfServiceScreen } from '../legal/TermsOfServiceScreen'

const BULLETS = [
  '~3 minutes to complete',
  'Personalized to your seat & longevity',
  'Month-by-month transparent breakdown',
]

export function StepWelcome() {
  const { nextStep } = useStore()
  const [showTerms, setShowTerms] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsError, setTermsError] = useState(false)

  if (showTerms) {
    return <TermsOfServiceScreen onBack={() => setShowTerms(false)} />
  }

  const handleGetStarted = () => {
    if (!acceptedTerms) {
      setTermsError(true)
      return
    }
    nextStep()
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}
    >
      {/* Top bar — full width */}
      <div className="flex justify-end px-6 pt-5">
        <ThemeToggle />
      </div>

      {/* Center content — expands horizontally on wider screens */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center w-full">

        {/* Logo */}
        <div className="mb-6">
          <img
            src="/APA Teamsters Local 2118 Logo.png"
            alt="Teamsters Local 2118"
            className="w-32 h-32 object-contain drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.src = '/teamsters-logo.svg'
              e.currentTarget.onerror = null
            }}
          />
        </div>

        {/* Title badge — pill style, slightly larger than the old chip */}
        <div
          className="inline-flex items-center rounded-full mb-6 font-black uppercase tracking-widest whitespace-nowrap"
          style={{
            background: 'var(--chip-bg)',
            border: '1px solid var(--chip-border)',
            color: 'var(--chip-text)',
            fontSize: 'clamp(0.8rem, 1.6vw, 1.05rem)',
            padding: 'clamp(0.35rem, 0.8vw, 0.55rem) clamp(1rem, 2.5vw, 1.75rem)',
          }}
        >
          Contract Comparison Calculator
        </div>

        {/* Subtitle */}
        <p
          className="leading-relaxed mb-7"
          style={{
            color: 'var(--text-muted)',
            maxWidth: '38rem',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
          }}
        >
          Make an informed decision on the Tentative Agreement.
          We'll walk you through a few questions and show you exactly
          what each path means for{' '}
          <span style={{ color: 'var(--text-base)', fontWeight: 700 }}>your</span>{' '}
          career and retirement.
        </p>

        {/* Feature bullets — icons vertically aligned in a left-anchored column */}
        <div className="flex flex-col gap-3 mb-10 mx-auto" style={{ color: 'var(--text-faint)' }}>
          {BULLETS.map((text) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="var(--positive)" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="var(--positive)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <label
          className="flex items-start gap-3 mb-4 mx-auto text-left cursor-pointer"
          style={{ maxWidth: '22rem' }}
        >
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked)
              if (e.target.checked) setTermsError(false)
            }}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--gold)]"
          />
          <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            I have read and agree to the{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setShowTerms(true)
              }}
              className="underline font-medium"
              style={{ color: 'var(--gold)' }}
            >
              Terms of Service
            </button>
            .
          </span>
        </label>

        {/* CTA — fixed comfortable width, not artificially narrow */}
        <button
          onClick={handleGetStarted}
          className="py-4 rounded-xl font-bold transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
            width: 'min(100%, 16rem)',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--btn-bg)')}
        >
          Get Started
        </button>

        {termsError && (
          <p
            className="mt-3 text-xs leading-relaxed mx-auto"
            style={{ color: 'var(--negative)', maxWidth: '22rem' }}
            role="alert"
          >
            Please read &amp; accept the terms of service to continue.
          </p>
        )}

        <p className="mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
          Version 1.4
        </p>

      </div>
    </div>
  )
}
