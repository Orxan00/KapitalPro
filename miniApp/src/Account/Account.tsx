import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Crown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { firstName, profilePicture } from '@/lib/telegram'
import { useBalance } from '@/hooks/useBalance'
import Transactions from '@/components/Transactions'

interface AccountProps {
  onPageChange: (page: string) => void;
}

export default function Account({ onPageChange }: AccountProps) {
  const { user, loading } = useSelector((state: RootState) => state.user);
  const { balance, loading: balanceLoading, error: balanceError } = useBalance();

  const handleDeposit = () => {
    onPageChange('deposit');
  };

  const handleWithdraw = () => {
    onPageChange('withdraw');
  };

  if (loading || balanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              onClick={() => onPageChange('home')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-blue-200">Please try refreshing the page or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => onPageChange('home')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Compact Profile Card */}
        <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              {profilePicture ? (
          <img
            className="w-full h-full rounded-full"
            src={profilePicture}
            alt={user.first_name}
          />
        ) : (
          <div className="text-white text-sm bg-primary w-full h-full flex items-center justify-center">
            {firstName?.charAt(0).toUpperCase()}
          </div>
        )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h2>
                {user.username && (
                  <p className="text-blue-200">@{user.username}</p>
                )}
                {user.is_premium && (
                  <div className="flex items-center gap-2 mt-1">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-semibold">Premium</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Balance Section */}
            <div className="bg-white/5 rounded-xl p-4 text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-blue-200 text-sm">Account Balance</span>
              </div>
              {balanceError ? (
                <div className="text-red-400 text-sm">Error loading balance</div>
              ) : (
                <div className="text-3xl font-bold text-green-400">
                  ${balance.toFixed(2)}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDeposit}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowDownCircle className="w-5 h-5" />
                Deposit
              </Button>
              <Button
                onClick={handleWithdraw}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <Transactions userId={user.uid} />
      </div>
    </div>
  )
} 