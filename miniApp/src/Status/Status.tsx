import { Card, CardContent } from '@/components/ui/card'
import { Shield, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Status = () => {
  const { t } = useTranslation()
  
  return (
    <section className="px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 mt-8 px-6">
        {/* Security Card */}
        <Card className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl text-center border border-white/20">
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-blue-500 to-[#069270] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-white font-bold mb-4">{t('status.security.title')}</h2>
            <p className="text-white/80 text-lg leading-relaxed">{t('status.security.description')}</p>
          </CardContent>
        </Card>

        {/* High Income Card */}
        <Card className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl text-center border border-white/20">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-[#069270] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-white font-bold mb-4">{t('status.income.title')}</h2>
            <p className="text-white/80 text-lg leading-relaxed">{t('status.income.description')}</p>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl text-center border border-white/20">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-[#069270] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-white font-bold mb-4">{t('status.users.title')}</h2>
            <p className="text-white/80 text-lg leading-relaxed">{t('status.users.description')}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default Status