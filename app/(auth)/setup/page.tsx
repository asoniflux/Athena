'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Sparkles, Loader2, Check, UserCircle } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (step === 1) {
      if (!name || !email) {
        setError('Please fill in all fields')
        return
      }
      setError('')
      setStep(2)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, timezone }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Setup failed')
      }

      setStep(3)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F14] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <Sparkles className="h-7 w-7 text-[#6366F1]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F1F3]">Welcome to Athena AI</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Let&apos;s set up your command center</p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition ${
                s <= step ? 'bg-[#6366F1]' : 'bg-[#2D2D3A]'
              }`}
            />
          ))}
        </div>

        {step === 3 ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
              <Check className="h-7 w-7 text-[#10B981]" />
            </div>
            <h2 className="text-lg font-semibold text-[#F1F1F3]">You&apos;re all set!</h2>
            <p className="mt-1 text-sm text-[#9CA3AF]">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none transition focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    placeholder="Abhishek Soni"
                  />
                </div>
                <div>
                  <label htmlFor="setup-email" className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
                    Email
                  </label>
                  <input
                    id="setup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none transition focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2.5 text-sm text-[#F1F1F3] outline-none transition focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label htmlFor="setup-password" className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
                    Password
                  </label>
                  <input
                    id="setup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none transition focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#6B7280] outline-none transition focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    placeholder="Confirm your password"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-[#EF4444]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#818CF8] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : step === 1 ? (
                'Continue'
              ) : (
                'Create Account'
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-[#9CA3AF] hover:text-[#F1F1F3]"
              >
                Back
              </button>
            )}
          </form>
        )}

        {step !== 3 && (
          <>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#2D2D3A]" />
              <span className="text-xs text-[#6B7280]">or</span>
              <div className="h-px flex-1 bg-[#2D2D3A]" />
            </div>

            <button
              type="button"
              disabled={guestLoading || loading}
              onClick={async () => {
                setGuestLoading(true)
                setError('')
                try {
                  const res = await fetch('/api/auth/guest', { method: 'POST' })
                  if (!res.ok) throw new Error('Failed')
                  const { email: guestEmail, password: guestPass } = await res.json()
                  const result = await signIn('credentials', {
                    email: guestEmail,
                    password: guestPass,
                    redirect: false,
                  })
                  if (result?.error) {
                    setError('Guest login failed')
                    setGuestLoading(false)
                  } else {
                    router.push('/dashboard')
                  }
                } catch {
                  setError('Guest login failed')
                  setGuestLoading(false)
                }
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2D2D3A] bg-[#1A1A24] px-4 py-2.5 text-sm font-medium text-[#9CA3AF] transition hover:border-[#6366F1] hover:text-[#F1F1F3] disabled:opacity-50"
            >
              {guestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entering as guest...
                </>
              ) : (
                <>
                  <UserCircle className="h-4 w-4" />
                  Skip Setup — Continue as Guest
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-[#6B7280]">
              Already have an account? <a href="/login" className="text-[#6366F1] hover:underline">Sign in</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
