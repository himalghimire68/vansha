'use client'

import React from 'react'
import { TreePalm } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-forest-50 to-heritage-50 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-forest-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-heritage-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-200/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TreePalm className="text-forest-600" size={32} />
            <span className="text-3xl font-bold gradient-text">Vansha</span>
          </div>
          <p className="text-primary-600 text-sm">Connect Across Generations</p>
        </div>

        {/* Auth card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-brand-lg border border-white/20 p-8 sm:p-10">
          {children}
        </div>

        {/* Footer text */}
        <p className="text-center text-primary-600 text-xs mt-6">
          Your privacy is important to us. Data is encrypted and private by default.
        </p>
      </div>
    </div>
  )
}
