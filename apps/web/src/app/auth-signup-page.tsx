'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TreePalm, Mail, Lock, Eye, EyeOff, Github, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, Button } from '@/app/ui'
import { cn } from '@/utils'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)

    try {
      // Clerk integration would happen here
      console.log('Signup attempt:', { firstName, lastName, email, password })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, this would handle Clerk authentication
      // router.push('/dashboard')
    } catch (err) {
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = (provider: string) => {
    setIsLoading(true)
    console.log(`Signing up with ${provider}`)
    // Clerk OAuth would be implemented here
    setIsLoading(false)
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
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-forest-600 hover:text-forest-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md animate-scale-in">
          {/* Welcome Card */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-950 mb-3">Create Your Account</h1>
            <p className="text-lg text-primary-600">
              Begin your journey to discover your ancestral heritage
            </p>
          </div>

          {/* Signup Card */}
          <Card className="backdrop-blur-sm bg-white/95 shadow-brand-lg border border-white/40 mb-6">
            {/* Social Signup Buttons */}
            <div className="space-y-3 mb-8">
              <button
                onClick={() => handleSocialSignup('github')}
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-4 py-3',
                  'border-2 border-primary-200 text-primary-700 rounded-lg',
                  'font-semibold transition-all duration-200',
                  'hover:bg-primary-50 hover:border-primary-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Github size={20} />
                <span>Sign up with GitHub</span>
              </button>
              
              <button
                onClick={() => handleSocialSignup('google')}
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-4 py-3',
                  'border-2 border-primary-200 text-primary-700 rounded-lg',
                  'font-semibold transition-all duration-200',
                  'hover:bg-primary-50 hover:border-primary-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-primary-600 font-medium">Or register with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-primary-900">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className={cn(
                      'w-full px-4 py-2 rounded-lg',
                      'border-2 border-primary-200 bg-white/50',
                      'text-primary-900 placeholder-primary-400',
                      'focus:outline-none focus:border-forest-400 focus:bg-white',
                      'transition-all duration-200 text-sm font-medium'
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-primary-900">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className={cn(
                      'w-full px-4 py-2 rounded-lg',
                      'border-2 border-primary-200 bg-white/50',
                      'text-primary-900 placeholder-primary-400',
                      'focus:outline-none focus:border-forest-400 focus:bg-white',
                      'transition-all duration-200 text-sm font-medium'
                    )}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-primary-900">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={cn(
                      'w-full pl-10 pr-4 py-2 rounded-lg',
                      'border-2 border-primary-200 bg-white/50',
                      'text-primary-900 placeholder-primary-400',
                      'focus:outline-none focus:border-forest-400 focus:bg-white',
                      'transition-all duration-200 text-sm font-medium'
                    )}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-primary-900">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={cn(
                      'w-full pl-10 pr-12 py-2 rounded-lg',
                      'border-2 border-primary-200 bg-white/50',
                      'text-primary-900 placeholder-primary-400',
                      'focus:outline-none focus:border-forest-400 focus:bg-white',
                      'transition-all duration-200 text-sm font-medium'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-900">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={cn(
                      'w-full pl-10 pr-12 py-2 rounded-lg',
                      'border-2 border-primary-200 bg-white/50',
                      'text-primary-900 placeholder-primary-400',
                      'focus:outline-none focus:border-forest-400 focus:bg-white',
                      'transition-all duration-200 text-sm font-medium'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className={cn(
                    'mt-1 w-5 h-5 rounded-md',
                    'border-2 border-primary-200 bg-white',
                    'focus:outline-none focus:border-forest-400',
                    'transition-all duration-200 cursor-pointer',
                    'accent-forest-600'
                  )}
                  required
                />
                <label htmlFor="terms" className="text-sm text-primary-600 leading-relaxed cursor-pointer flex-1">
                  I agree to the{' '}
                  <Link href="/privacy" className="font-semibold text-forest-600 hover:text-forest-700">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-semibold text-forest-600 hover:text-forest-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full py-3 text-base group mt-6"
              >
                Create Account
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition" />}
              </Button>
            </form>
          </Card>

          {/* Privacy Notice */}
          <div className="text-center">
            <p className="text-xs text-primary-500">
              We take your privacy seriously. Your data is encrypted and never shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
