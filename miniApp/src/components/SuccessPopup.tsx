import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  title: string;
  message: string;
  transactionId: string;
  type: 'deposit' | 'withdrawal';
}

export default function SuccessPopup({ 
  isOpen, 
  onClose, 
  onViewDetails, 
  title, 
  message, 
  transactionId, 
}: SuccessPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#101930] to-[#1d3784] border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-blue-200 mb-4">{message}</p>
          
          {/* Transaction ID */}
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-200 mb-1">Transaction ID</p>
            <code className="text-xs text-white font-mono break-all">
              {transactionId}
            </code>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onViewDetails}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          <Button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 