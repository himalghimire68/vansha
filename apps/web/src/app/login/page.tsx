'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [shakeCard, setShakeCard] = useState(false)

  const triggerShake = () => {
    setShakeCard(true)
    setTimeout(() => setShakeCard(false), 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    if (!email.includes('@')) {
      setEmailError('Please enter a valid archival email.')
      triggerShake()
      return
    }

    setIsLoading(true)

    // Dev bypass: any email/password goes to dashboard
    await new Promise((r) => setTimeout(r, 800))
    setIsLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="bg-heritage-gradient min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Floating orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary-container/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-tertiary-fixed/20 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-md px-6 md:px-0 z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🌿</span>
              <h1 className="font-serif text-headline-lg text-primary tracking-tight">Vansha Lineage</h1>
            </div>
          </Link>
          <p className="font-sans text-body-md text-on-surface-variant italic">
            Connecting the threads of your family's story.
          </p>
        </div>

        {/* Card */}
        <div
          className={`bg-surface/70 backdrop-blur-xl border border-outline-variant/50 rounded-2xl archival-shadow-lg p-8 md:p-10 transition-all duration-500 ${shakeCard ? 'error-shake' : ''}`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2" htmlFor="email">
                <span className="text-base">✉</span>
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ancestor@vansha.com"
                  required
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-all placeholder:text-outline-variant/60"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
              {emailError && (
                <p className="text-v-error text-caption font-sans font-medium italic">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-label-md font-sans text-on-surface-variant flex items-center gap-2" htmlFor="password">
                <span className="text-base">🔒</span>
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 pr-10 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-all placeholder:text-outline-variant/60"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-focus-within:w-full" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors text-sm"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {passwordError && (
                <p className="text-v-error text-caption font-sans font-medium italic">{passwordError}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-sm border-outline-variant text-secondary focus:ring-0 bg-transparent"
                />
                <span className="text-label-md font-sans text-on-surface-variant group-hover:text-primary transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-label-md font-sans text-secondary hover:text-on-tertiary-container transition-colors underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] archival-shadow mt-4 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin-slow" />
                  Verifying Lineage...
                </>
              ) : (
                <>
                  <span>🗝</span>
                  Enter the Archive
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-outline-variant/30 text-center">
            <p className="text-body-md font-sans text-on-surface-variant">
              New to the lineage?{' '}
              <a href="#" className="text-primary font-semibold hover:underline underline-offset-4 ml-1">
                Create an account
              </a>
            </p>
          </div>
        </div>

        {/* Footer credits */}
        <footer className="mt-8 text-center text-on-surface-variant/60 text-caption font-sans space-y-2">
          <p>© 2024 Vansha Lineage. Preserving history for the next generation.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <span className="text-outline-variant">•</span>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
