import { useTranslation } from 'react-i18next'

export default function InvestmentHero() {
  const { t } = useTranslation()
  
  return (
    <div id="about" className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-800/40 to-teal-600/40 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-16 lg:p-20">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {t('investmentHero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-100/80 max-w-4xl mx-auto leading-relaxed">
              {t('investmentHero.subtitle')}
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-16">
              {/* Active Users */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-400 mb-2">25,000+</div>
                <div className="text-lg md:text-xl text-blue-200">{t('investmentHero.stats.activeUsers')}</div>
              </div>

              {/* Paid Income */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-400 mb-2">$2.5M+</div>
                <div className="text-lg md:text-xl text-blue-200">{t('investmentHero.stats.paidIncome')}</div>
              </div>

              {/* Satisfaction Level */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-400 mb-2">99.8%</div>
                <div className="text-lg md:text-xl text-blue-200">{t('investmentHero.stats.satisfaction')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  