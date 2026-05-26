'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/app/ui'
import { cn } from '@/utils'

interface FormState {
  email: string
}

interface FormErrors {
  email?: string
  submit?: string
}

export default function ResetPage() {
  const [formState, setFormState] = useState<FormState>({ email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string): string | undefined => {
    if (field === 'email') {
      if (!value.trim()) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
      return undefined
    }
    return undefined
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const emailError = validateField('email', formState.email)
    if (emailError) {
      setErrors({ email: emailError })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrors({ submit: data.message || 'Failed to send reset email.' })
      } else {
        setIsSubmitted(true)
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-primary-950 mb-2">Check Your Email</h1>
        <p className="text-primary-600 mb-8">
          We've sent a password reset link to{' '}
          <span className="font-semibold text-primary-700">{formState.email}</span>
        </p>

        <div className="bg-forest-50/30 border border-forest-200 rounded-lg p-6 mb-8 text-left">
          <p className="text-sm text-primary-700 mb-3">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="text-sm text-primary-600 space-y-2">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• Try resetting again in a few minutes</li>
          </ul>
        </div>

        <Link href="/auth-login" className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-700 font-medium">
          <ArrowLeft size={20} />
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-950 mb-2">Reset Your Password</h1>
      <p className="text-primary-600 mb-8">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-3">
          <span>⚠️</span>
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center mt-6">
        <Link href="/auth-login" className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-700 font-medium">
          <ArrowLeft size={20} />
          Back to login
        </Link>
      </div>
    </div>
  )
}
