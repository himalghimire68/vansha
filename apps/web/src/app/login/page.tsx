'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi, storeAuth } from '@/lib/api'
import { LanguageToggle } from '@/components/LanguageToggle'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shakeCard, setShakeCard] = useState(false)

  const triggerShake = () => {
    setShakeCard(true)
    setTimeout(() => setShakeCard(false), 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      triggerShake()
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      triggerShake()
      return
    }

    setIsLoading(true)
    try {
      const result =
        mode === 'login'
          ? await authApi.login(email, password)
          : await authApi.register(email, password, firstName || undefined, lastName || undefined)

      storeAuth(result.userId, result.token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg.includes('401') || msg.includes('Invalid') ? 'Invalid email or password.' : msg)
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-heritage-gradient min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle />
      </div>
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
            Connecting the threads of your family&apos;s story.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-outline-variant mb-6">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-3 text-label-md font-sans transition-all ${
                mode === m
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          className={`bg-surface/70 backdrop-blur-xl border border-outline-variant/50 rounded-2xl archival-shadow-lg p-8 md:p-10 transition-all duration-500 ${shakeCard ? 'error-shake' : ''}`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields — register only */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'First Name', value: firstName, set: setFirstName, placeholder: 'Hari' },
                  { label: 'Last Name', value: lastName, set: setLastName, placeholder: 'Sharma' },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label} className="space-y-2">
                    <label className="text-label-md font-sans text-on-surface-variant">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 text-primary text-body-md font-sans focus:ring-0 focus:outline-none focus:border-secondary transition-all placeholder:text-outline-variant/60"
                    />
                  </div>
                ))}
              </div>
            )}

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
              {mode === 'register' && (
                <p className="text-caption font-sans text-on-surface-variant">Minimum 6 characters</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-v-error text-caption font-sans font-medium italic">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary text-label-md font-sans py-4 rounded-brand flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] archival-shadow mt-4 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin-slow" />
                  {mode === 'login' ? 'Verifying Lineage...' : 'Creating Archive...'}
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? '🗝' : '🌿'}</span>
                  {mode === 'login' ? 'Enter the Archive' : 'Begin Your Lineage'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-outline-variant/30 text-center">
            <p className="text-body-md font-sans text-on-surface-variant">
              {mode === 'login' ? 'New to the lineage?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                className="text-primary font-semibold hover:underline underline-offset-4 ml-1"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

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
