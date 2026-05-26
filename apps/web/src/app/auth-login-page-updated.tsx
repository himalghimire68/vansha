'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/app/ui'
import { cn } from '@/utils'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'email': {
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
        return undefined
      }
      case 'password': {
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return undefined
      }
      default:
        return undefined
    }
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
    const passwordError = validateField('password', formState.password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrors({ submit: data.message || 'Login failed. Please try again.' })
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-950 mb-2">Welcome Back</h1>
      <p className="text-primary-600 mb-8">Sign in to access your family trees</p>

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
              placeholder="Enter your password"
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

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-primary-300" />
            <span className="text-primary-600">Remember me</span>
          </label>
          <Link href="/auth-reset" className="text-forest-600 hover:text-forest-700 font-medium">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Signup Link */}
      <p className="text-center text-primary-600 mt-6">
        Don't have an account?{' '}
        <Link href="/auth-signup" className="text-forest-600 hover:text-forest-700 font-semibold">
          Create one
        </Link>
      </p>
    </div>
  )
}
