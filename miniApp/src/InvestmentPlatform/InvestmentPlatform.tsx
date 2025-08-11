import { Clock, DollarSign, Shield, Users, Smartphone, Headphones, TrendingUp, CreditCard } from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function Component() {
  const { t } = useTranslation()
  
  const features = [
    {
      icon: Clock,
      title: t('platform.features.automaticPayments.title'),
      description: t('platform.features.automaticPayments.description'),
    },
    {
      icon: DollarSign,
      title: t('platform.features.fastWithdrawal.title'),
      description: t('platform.features.fastWithdrawal.description'),
    },
    {
      icon: Shield,
      title: t('platform.features.sslSecurity.title'),
      description: t('platform.features.sslSecurity.description'),
    },
    {
      icon: Users,
      title: t('platform.features.referralSystem.title'),
      description: t('platform.features.referralSystem.description'),
    },
    {
      icon: Smartphone,
      title: t('platform.features.mobileFriendly.title'),
      description: t('platform.features.mobileFriendly.description'),
    },
    {
      icon: Headphones,
      title: t('platform.features.support.title'),
      description: t('platform.features.support.description'),
    },
    {
      icon: TrendingUp,
      title: t('platform.features.realTimeStats.title'),
      description: t('platform.features.realTimeStats.description'),
    },
    {
      icon: CreditCard,
      title: t('platform.features.multiplePayments.title'),
      description: t('platform.features.multiplePayments.description'),
    },
  ]

  return (
    <div id="features" className="min-h-screen  px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{t('platform.title')}</h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {t('platform.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="bg-gradient-to-r from-blue-500 to-[#069270] rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
