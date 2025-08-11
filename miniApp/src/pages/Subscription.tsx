import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useUser } from '@/contexts/UserProvider'
import { apiService } from '@/lib/api'

interface SubscriptionProps {
  onPageChange: (page: string) => void;
}

interface Subscription {
  id: string;
  user_id: string;
  package_name: string;
  package_price: number;
  daily_return: string;
  duration_days: number;
  total_return: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'pending';
  total_earned: number;
  remaining_days: number;
  last_earnings_update: string;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionPage({ onPageChange }: SubscriptionProps) {
  const { user } = useUser()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const result = await apiService.getUserSubscriptions(user.uid)
        
        if (result.success && result.data) {
          setSubscriptions(result.data)
        } else {
          setError(result.message || 'Failed to fetch subscriptions')
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err)
        setError('Failed to fetch subscriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [user?.uid])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20'
      case 'completed':
        return 'text-blue-400 bg-blue-400/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      default:
        return 'Unknown'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              onClick={() => onPageChange('account')}
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
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              onClick={() => onPageChange('account')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => onPageChange('account')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-blue-200">View and manage your investment subscriptions</p>
        </div>

        {/* Subscription Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <div>
                  <h3 className="text-2xl font-bold text-blue-400 mb-1">
                    {subscriptions.filter(sub => sub.status === 'active').length}
                  </h3>
                  <p className="text-blue-200 text-sm">Active Subscriptions</p>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <h3 className="text-xl font-bold text-green-400 mb-1">
                    ${subscriptions.reduce((sum, sub) => sum + sub.total_earned, 0).toFixed(2)}
                  </h3>
                  <p className="text-blue-200 text-sm">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        {error ? (
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-red-400 mb-4">Error Loading Subscriptions</h3>
              <p className="text-blue-200 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">No Subscriptions Found</h3>
              <p className="text-blue-200 mb-6">You haven't subscribed to any investment packages yet.</p>
              <Button
                onClick={() => {
                  onPageChange('home')
                  setTimeout(() => {
                    const packagesSection = document.getElementById('packages')
                    if (packagesSection) {
                      packagesSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }, 100)
                }}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              >
                Browse Investment Packages
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{subscription.package_name}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                      {getStatusText(subscription.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-blue-200 text-sm">Investment Amount</p>
                      <p className="text-white font-semibold">${subscription.package_price}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Daily Return</p>
                      <p className="text-green-400 font-semibold">{subscription.daily_return}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Total Earned</p>
                      <p className="text-green-400 font-semibold">${subscription.total_earned.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Remaining Days</p>
                      <p className="text-white font-semibold">{subscription.remaining_days} days</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-200 text-sm">Duration</p>
                        <p className="text-white font-semibold">
                          {new Date(subscription.start_date).toLocaleDateString()} - {new Date(subscription.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Total Return</p>
                        <p className="text-green-400 font-semibold">${subscription.total_return}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-blue-200 text-sm">Last Earnings Update</p>
                          <p className="text-white font-semibold">
                            {new Date(subscription.last_earnings_update).toLocaleDateString()} at {new Date(subscription.last_earnings_update).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-200 text-sm">Created</p>
                          <p className="text-white font-semibold">
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 