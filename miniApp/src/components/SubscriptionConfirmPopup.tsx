import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubscriptionConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageName: string;
  amount: number;
  dailyReturn: string;
  duration: number;
  totalReturn: number;
  isLoading: boolean;
}

export default function SubscriptionConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  packageName,
  amount,
  dailyReturn,
  duration,
  totalReturn,
  isLoading
}: SubscriptionConfirmPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">


          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2">Confirm Subscription</h3>
          
          {/* Message */}
          <p className="text-blue-200 mb-6">
            Please review your subscription details before confirming.
          </p>

          {/* Package Details */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-200">Package:</span>
                <span className="text-white font-semibold">{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Investment Amount:</span>
                <span className="text-white font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Daily Return:</span>
                <span className="text-green-400 font-semibold">{dailyReturn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Duration:</span>
                <span className="text-white font-semibold">{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Total Return:</span>
                <span className="text-green-400 font-semibold">${totalReturn}</span>
              </div>
            </div>
          </div>



          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Creating Subscription...' : 'Confirm Subscription'}
            </Button>
            
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 py-3 rounded-xl disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 