import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubscriptionSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewSubscriptions: () => void;
  packageName: string;
  subscriptionId: string;
  amount: number;
}

export default function SubscriptionSuccessPopup({
  isOpen,
  onClose,
  onViewSubscriptions,
  packageName,
  subscriptionId,
  amount
}: SubscriptionSuccessPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2">Subscription Created!</h3>
          
          {/* Message */}
          <p className="text-blue-200 mb-6">
            You have successfully subscribed to the <span className="font-semibold text-white">{packageName}</span> package.
          </p>

          {/* Details */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-200">Package:</span>
                <span className="text-white font-semibold">{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Amount:</span>
                <span className="text-white font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Subscription ID:</span>
                <span className="text-white font-mono text-sm">{subscriptionId}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onViewSubscriptions}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl"
            >
              View My Subscriptions
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 py-3 rounded-xl"
            >
              Continue Browsing
            </Button>
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