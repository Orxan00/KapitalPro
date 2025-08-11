import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useUser } from '@/contexts/UserProvider'
import { apiService } from '@/lib/api'
import SubscriptionSuccessPopup from '@/components/SubscriptionSuccessPopup'
import SubscriptionConfirmPopup from '@/components/SubscriptionConfirmPopup'
import SubscriptionErrorPopup from '@/components/SubscriptionErrorPopup'

interface InvestmentPricingProps {
  onPageChange?: (page: string) => void;
}

export default function InvestmentPricing({ onPageChange }: InvestmentPricingProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [successData, setSuccessData] = useState<{
    packageName: string;
    subscriptionId: string;
    amount: number;
  } | null>(null)
  const [errorData, setErrorData] = useState<{
    title: string;
    message: string;
    currentBalance?: number;
    requiredAmount?: number;
  } | null>(null)
  
  const packages = [
    {
      id: 'starter',
      name: t('pricing.starter.name'),
      price: 25,
      dailyReturn: "10%",
      features: [
        t('pricing.starter.features.duration'),
        t('pricing.starter.features.support'),
        t('pricing.starter.features.reinvest')
      ],
      duration: 45,
      totalReturn: 112,
      buttonClass: "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600",
      popular: false,
    },
    {
      id: 'basic',
      name: t('pricing.basic.name'),
      price: 100,
      dailyReturn: "10%",
      features: [
        t('pricing.basic.features.duration'),
        t('pricing.basic.features.support'),
        t('pricing.basic.features.reinvest'),
        t('pricing.basic.features.bonus')
      ],
      duration: 45,
      totalReturn: 450,
      buttonClass: "bg-gradient-to-r from-yellow-500 to-orange-500",
      popular: false,
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      price: 500,
      dailyReturn: "10%",
      features: [
        t('pricing.pro.features.duration'),
        t('pricing.pro.features.support'),
        t('pricing.pro.features.reinvest'),
        t('pricing.pro.features.bonus'),
        t('pricing.pro.features.referral')
      ],
      duration: 45,
      totalReturn: 2250,
      buttonClass: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      popular: false,
    },
    {
      id: 'elite',
      name: t('pricing.elite.name'),
      price: 1000,
      dailyReturn: "10%",
      features: [
        t('pricing.elite.features.duration'),
        t('pricing.elite.features.support'),
        t('pricing.elite.features.reinvest'),
        t('pricing.elite.features.bonus'),
        t('pricing.elite.features.referral')
      ],
      duration: 20,
      totalReturn: 2000,
      buttonClass: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
      popular: true,
    },
    {
      id: 'vip',
      name: t('pricing.vip.name'),
      price: 2000,
      dailyReturn: "10%",
      features: [
        t('pricing.vip.features.duration'),
        t('pricing.vip.features.support'),
        t('pricing.vip.features.reinvest'),
        t('pricing.vip.features.bonus'),
        t('pricing.vip.features.referral')
      ],
      duration: 20,
      totalReturn: 4000,
      buttonClass: "bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600",
      popular: false,
    },
  ]

  const handleSubscribe = async (pkg: any) => {
    if (!user?.uid) {
      setErrorData({
        title: 'Login Required',
        message: 'Please log in to subscribe to packages'
      })
      setShowErrorPopup(true)
      return
    }

    // Show confirmation popup first
    setSelectedPackage(pkg)
    setShowConfirmPopup(true)
  }

  const handleConfirmSubscription = async () => {
    if (!selectedPackage || !user?.uid) return

    setIsSubscribing(selectedPackage.id)

    try {
      const subscriptionData = {
        user_id: user.uid,
        user_username: user.username || '',
        user_first_name: user.first_name || '',
        user_last_name: user.last_name || '',
        package_name: selectedPackage.name,
        package_price: selectedPackage.price,
        daily_return: selectedPackage.dailyReturn,
        duration_days: selectedPackage.duration,
        total_return: selectedPackage.totalReturn,
      }

      const result = await apiService.createSubscription(subscriptionData)

      if (result.success && result.subscription_id) {
        setSuccessData({
          packageName: selectedPackage.name,
          subscriptionId: result.subscription_id,
          amount: selectedPackage.price,
        })
        setShowSuccessPopup(true)
        setShowConfirmPopup(false)
      } else {
        if (result.message?.includes('Insufficient balance')) {
          setErrorData({
            title: 'Insufficient Balance',
            message: 'You don\'t have enough balance to subscribe to this package.',
            currentBalance: result.currentBalance,
            requiredAmount: result.requiredAmount
          })
        } else {
          setErrorData({
            title: 'Subscription Failed',
            message: result.message || 'Failed to create subscription'
          })
        }
        setShowErrorPopup(true)
        setShowConfirmPopup(false)
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      setErrorData({
        title: 'Error',
        message: 'Error creating subscription. Please try again.'
      })
      setShowErrorPopup(true)
      setShowConfirmPopup(false)
    } finally {
      setIsSubscribing(null)
    }
  }

  return (
    <div id="packages" className="min-h-screen mt-[100px]  flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{t('pricing.title')}</h1>
        <p className="text-lg md:text-xl text-blue-200 opacity-80">
          {t('pricing.subtitle')}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8 w-full max-w-7xl">
        {packages.map((pkg, index) => (
          <Card
            key={index}
            className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  {t('pricing.mostPopular')}
                </div>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{pkg.name}</h3>
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-bold text-white">{pkg.price}</span>
               </div>
              <div className="text-green-400 font-semibold text-lg">{t('pricing.dailyReturn', { return: pkg.dailyReturn })}</div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3 mb-8">
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-blue-100">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Duration and Return */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">{t('pricing.duration')}:</span>
                  <span className="text-white font-semibold">{pkg.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">{t('pricing.estimatedReturn')}:</span>
                  <span className="text-green-400 font-bold">{pkg.totalReturn}</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 ${pkg.buttonClass}`}
                onClick={() => handleSubscribe(pkg)}
              >
                {t('pricing.selectPackage')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popups */}
      {showSuccessPopup && successData && (
        <SubscriptionSuccessPopup
          isOpen={showSuccessPopup}
          packageName={successData.packageName}
          subscriptionId={successData.subscriptionId}
          amount={successData.amount}
          onClose={() => setShowSuccessPopup(false)}
          onViewSubscriptions={() => {
            setShowSuccessPopup(false)
            onPageChange?.('subscription')
          }}
        />
      )}

      {showConfirmPopup && selectedPackage && (
        <SubscriptionConfirmPopup
          isOpen={showConfirmPopup}
          packageName={selectedPackage.name}
          amount={selectedPackage.price}
          dailyReturn={selectedPackage.dailyReturn}
          duration={selectedPackage.duration}
          totalReturn={selectedPackage.totalReturn}
          isLoading={isSubscribing === selectedPackage.id}
          onClose={() => setShowConfirmPopup(false)}
          onConfirm={handleConfirmSubscription}
        />
      )}

      {showErrorPopup && errorData && (
        <SubscriptionErrorPopup
          isOpen={showErrorPopup}
          title={errorData.title}
          message={errorData.message}
          currentBalance={errorData.currentBalance}
          requiredAmount={errorData.requiredAmount}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  )
}
