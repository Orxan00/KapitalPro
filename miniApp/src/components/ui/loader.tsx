import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'gradient'
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const SpinnerLoader = () => (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${className}`} />
  )

  const DotsLoader = () => (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${sizeClasses[size]} bg-teal-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${sizeClasses[size]} bg-cyan-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  )

  const PulseLoader = () => (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse ${className}`} />
  )

  const GradientLoader = () => (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 rounded-full animate-spin" />
      <div className="absolute inset-1 bg-slate-900 rounded-full" />
      <div className="absolute inset-2 bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 rounded-full animate-pulse" />
    </div>
  )

  const loaders = {
    spinner: SpinnerLoader,
    dots: DotsLoader,
    pulse: PulseLoader,
    gradient: GradientLoader
  }

  const LoaderComponent = loaders[variant]
  return <LoaderComponent />
}

// Full page loader component
export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#101930] to-[#1d3784]">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold text-white">KapitalPro</span>
        </div>
        
        {/* Loading animation */}
        <div className="mb-6">
          <Loader size="lg" variant="gradient" />
        </div>
        
        {/* Loading text */}
        <div className="text-white/80 text-lg font-medium">
          Loading your investment platform...
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-pulse" 
               style={{ animationDuration: '2s' }} />
        </div>
      </div>
    </div>
  )
}

// Content loader for sections
export const ContentLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <Loader size="lg" variant="spinner" className="mb-4" />
        <div className="text-white/60 text-sm">Loading content...</div>
      </div>
    </div>
  )
}

// Button loader
export const ButtonLoader: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2">
      <Loader size={size} variant="spinner" className="text-white" />
      <span>Loading...</span>
    </div>
  )
} 