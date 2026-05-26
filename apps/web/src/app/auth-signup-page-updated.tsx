'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/app/ui'
import { cn } from '@/utils'

interface FormState {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeToTerms?: string
  submit?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string | boolean): string | undefined => {
    switch (field) {
      case 'fullName': {
        if (!String(value).trim()) return 'Full name is required'
        if (String(value).trim().length < 2) return 'Name must be at least 2 characters'
        return undefined
      }
      case 'email': {
        if (!String(value).trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return 'Please enter a valid email'
        return undefined
      }
      case 'password': {
        if (!String(value)) return 'Password is required'
        if (String(value).length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(String(value))) return 'Password must contain an uppercase letter'
        if (!/[0-9]/.test(String(value))) return 'Password must contain a number'
        return undefined
      }
      case 'confirmPassword': {
        if (!String(value)) return 'Please confirm your password'
        if (String(value) !== formState.password) return 'Passwords do not match'
        return undefined
      }
      case 'agreeToTerms': {
        if (!value) return 'You must agree to the privacy policy'
        return undefined
      }
      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormState((prev) => ({ ...prev, [name]: newValue }))

    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, newValue)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const fullNameError = validateField('fullName', formState.fullName)
    const emailError = validateField('email', formState.email)
    const passwordError = validateField('password', formState.password)
    const confirmPasswordError = validateField('confirmPassword', formState.confirmPassword)
    const agreeError = validateField('agreeToTerms', formState.agreeToTerms)

    if (fullNameError || emailError || passwordError || confirmPasswordError || agreeError) {
      setErrors({
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        agreeToTerms: agreeError,
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formState.fullName,
          email: formState.email,
          password: formState.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrors({ submit: data.message || 'Signup failed. Please try again.' })
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-950 mb-2">Create Your Account</h1>
      <p className="text-primary-600 mb-8">Start preserving your family's legacy today</p>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-3">
          <span>⚠️</span>
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-primary-900 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formState.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-lg border-2 transition bg-primary-50/50 focus:bg-white focus:outline-none',
                errors.fullName ? 'border-red-300 focus:border-red-400' : 'border-primary-200 focus:border-forest-400'
              )}
            />
          </div>
          {errors.fullName && touched.fullName && (
            <p className="text-red-600 text-sm mt-2">{errors.fullName}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
            <input
              id="email"
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-lg border-2 transition bg-primary-50/50 focus:bg-white focus:outline-none',
                errors.email ? 'border-red-300 focus:border-red-400' : 'border-primary-200 focus:border-forest-400'
              )}
            />
          </div>
          {errors.email && touched.email && (
            <p className="text-red-600 text-sm mt-2">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-900 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formState.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="At least 8 characters"
              className={cn(
                'w-full pl-12 pr-12 py-3 rounded-lg border-2 transition bg-primary-50/50 focus:bg-white focus:outline-none',
                errors.password ? 'border-red-300 focus:border-red-400' : 'border-primary-200 focus:border-forest-400'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="text-red-600 text-sm mt-2">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-900 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formState.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter your password"
              className={cn(
                'w-full pl-12 pr-12 py-3 rounded-lg border-2 transition bg-primary-50/50 focus:bg-white focus:outline-none',
                errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-primary-200 focus:border-forest-400'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-red-600 text-sm mt-2">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formState.agreeToTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-5 h-5 rounded border-primary-300 text-forest-600 focus:ring-forest-500 cursor-pointer"
            />
            <span className="text-sm text-primary-600 group-hover:text-primary-700 transition">
              I agree to the{' '}
              <a href="/privacy" className="text-forest-600 hover:text-forest-700 font-medium">
                Privacy Policy
              </a>{' '}
              and understand my data is protected
            </span>
          </label>
          {errors.agreeToTerms && touched.agreeToTerms && (
            <p className="text-red-600 text-sm mt-2">{errors.agreeToTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-primary-600 mt-6">
        Already have an account?{' '}
        <Link href="/auth-login" className="text-forest-600 hover:text-forest-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
