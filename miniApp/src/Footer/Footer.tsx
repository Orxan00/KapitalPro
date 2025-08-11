import { useTranslation } from 'react-i18next'
import logo from '@/assets/logo.png'

export default function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer id="about" className="bg-gradient-to-br from-blue-[#101931]  to-[#1d3989] text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                <img src={logo} alt="logo" className="w-12 h-12" />
              </div>
              <span className="text-2xl font-bold">KapitalPro</span>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-6">{t('footer.company.title')}</h3>
            <nav className="space-y-4">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.company.about')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.company.team')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.company.careers')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.company.news')}
              </a>
            </nav>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-6">{t('footer.support.title')}</h3>
            <nav className="space-y-4">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.support.helpCenter')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.support.guides')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.support.faq')}
              </a>
              <a href="https://t.me/KapitalPro_Support" className="block text-gray-300 hover:text-white transition-colors duration-200">
                {t('footer.support.contact')}
              </a>
            </nav>
          </div>

    
        </div>

        
      </div>
    </footer>
  )
}
