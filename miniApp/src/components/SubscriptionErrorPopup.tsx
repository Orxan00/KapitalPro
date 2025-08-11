import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubscriptionErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  currentBalance?: number;
  requiredAmount?: number;
}

export default function SubscriptionErrorPopup({
  isOpen,
  onClose,
  title,
  message,
  currentBalance,
  requiredAmount
}: SubscriptionErrorPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-blue-200 mb-6">
            {message}
          </p>

          {/* Balance Info (if available) */}
          {currentBalance !== undefined && requiredAmount !== undefined && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-red-200">Your Balance:</span>
                  <span className="text-white font-semibold">${currentBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Required Amount:</span>
                  <span className="text-white font-semibold">${requiredAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200">Shortfall:</span>
                  <span className="text-red-400 font-semibold">${requiredAmount - currentBalance}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl"
            >
              {currentBalance !== undefined && requiredAmount !== undefined ? 'Add Funds' : 'OK'}
            </Button>
            
            {currentBalance !== undefined && requiredAmount !== undefined && (
              <Button
                onClick={() => {
                  onClose();
                  // Optionally navigate to deposit page
                  // window.location.href = '/deposit';
                }}
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 py-3 rounded-xl"
              >
                Go to Deposit
              </Button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 