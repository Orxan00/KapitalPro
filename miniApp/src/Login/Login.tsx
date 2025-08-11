import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Mail, Lock } from "lucide-react"
import { useState } from "react"
import { useLoading } from "@/contexts/LoadingContext"
import { ButtonLoader } from "@/components/ui/loader"
import { useTranslation } from 'react-i18next'

export default function Login({ onClose, onRegisterClick }: { onClose: () => void; onRegisterClick?: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { isLoading, setIsLoading, setLoadingMessage } = useLoading()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setLoadingMessage("Giriş edilir...")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Handle successful login
      onClose()
    } catch (error) {
      // Handle login error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with blur effect */}
      <div
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Overlay with blur and transparency */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-white">{t('login.title')}</h1>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              {t('login.email')}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pl-10 h-12 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              {t('login.password')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pl-10 h-12 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          {/* Submit Button */}
          <Button 
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-200 mt-8"
            disabled={isLoading}
          >
            {isLoading ? <ButtonLoader size="sm" /> : t('login.submit')}
          </Button>
          {/* Register Link */}
          <div className="text-center mt-6">
            <span className="text-slate-400 text-sm">
              Hesabınız yoxdur?{" "}
              <button 
                type="button"
                onClick={onRegisterClick} 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                disabled={isLoading}
              >
                Qeydiyyatdan keç
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
} 