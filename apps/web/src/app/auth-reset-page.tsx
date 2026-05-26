'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TreePalm, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, Button } from '@/app/ui'
import { cn } from '@/utils'

export default function ResetPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Clerk password reset would happen here
      console.log('Password reset request for:', email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success state
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setEmail('')
    setIsSubmitted(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-forest-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-heritage-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm bg-white/50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <TreePalm className="text-forest-600" size={28} />
            <span className="text-2xl font-bold gradient-text">Vansha</span>
          </Link>
          <p className="text-sm text-primary-600">
            <Link href="/auth/login" className="font-semibold text-forest-600 hover:text-forest-700">
              Back to Login
            </Link>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md animate-scale-in">
          {/* Success State */}
          {isSubmitted ? (
            <>
              {/* Success Card */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center">
                    <CheckCircle size={48} className="text-forest-600" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-primary-950 mb-3">Check Your Email</h1>
                <p className="text-lg text-primary-600">
                  We've sent a password reset link to<br />
                  <span className="font-semibold text-primary-900">{email}</span>
                </p>
              </div>

              {/* Success Card */}
              <Card className="backdrop-blur-sm bg-white/95 shadow-brand-lg border border-white/40 mb-6 p-8">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary-900">What's next?</h3>
                    <ol className="space-y-2 text-sm text-primary-600">
                      <li className="flex gap-3">
                        <span className="font-semibold text-forest-600 flex-shrink-0">1.</span>
                        <span>Check your email (including spam folder)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-forest-600 flex-shrink-0">2.</span>
                        <span>Click the reset link in the email</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-forest-600 flex-shrink-0">3.</span>
                        <span>Create a new password</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-forest-600 flex-shrink-0">4.</span>
                        <span>Sign in with your new password</span>
                      </li>
                    </ol>
                  </div>

                  {/* Link Expiry Notice */}
                  <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                    <p className="text-xs text-primary-600">
                      <span className="font-semibold">Note:</span> The reset link will expire in 24 hours for security purposes.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Back to Login */}
              <div className="text-center">
                <p className="text-sm text-primary-600 mb-4">
                  Didn't receive an email?
                </p>
                <Button
                  onClick={() => {
                    handleBackToLogin()
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <p className="text-sm text-primary-600 mt-4">
                  <Link 
                    href="/auth/login" 
                    className="font-semibold text-forest-600 hover:text-forest-700"
                  >
                    Return to login
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Reset Request Card */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-primary-950 mb-3">Reset Your Password</h1>
                <p className="text-lg text-primary-600">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              {/* Reset Card */}
              <Card className="backdrop-blur-sm bg-white/95 shadow-brand-lg border border-white/40 mb-6">
                <form onSubmit={handleReset} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-primary-900">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className={cn(
                          'w-full pl-10 pr-4 py-3 rounded-lg',
                          'border-2 border-primary-200 bg-white/50',
                          'text-primary-900 placeholder-primary-400',
                          'focus:outline-none focus:border-forest-400 focus:bg-white',
                          'transition-all duration-200',
                          'font-medium'
                        )}
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-forest-50 border border-forest-100 rounded-lg">
                    <p className="text-sm text-forest-700">
                      <span className="font-semibold">Tip:</span> Make sure to check your spam folder if you don't see the email within a few minutes.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                    className="w-full py-3 text-lg group"
                  >
                    Send Reset Link
                    {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition" />}
                  </Button>
                </form>
              </Card>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-forest-600 hover:text-forest-700 transition"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
