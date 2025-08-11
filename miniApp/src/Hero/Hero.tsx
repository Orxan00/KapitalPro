import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

const Hero = () => {
  const { t } = useTranslation()
  
  const scrollToPackages = () => {
    const packagesSection = document.getElementById('packages')
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  return (
    <div className='min-h-[calc(100vh-100px)] flex flex-col justify-center items-center'>
      <div className="hero-content pt-[100px] flex justify-center">
        {/* Hero Section */}
        <section className="w-[90vw] max-w-6xl px-4 py-8 text-center">
          <h2 className="font-extrabold text-center mb-4 text-3xl sm:text-8xl md:text-6xl lg:text-10xl leading-tight lg:leading-tight">
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-extrabold">
              {t('hero.subtitle')}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
          <Button 
            onClick={scrollToPackages}
            className="bg-gradient-to-r from-blue-500 to-teal-700 hover:from-cyan-600 hover:to-teal-600 text-white px-6 py-4 text-lg md:px-8 md:py-10 md:text-3xl rounded-lg font-bold shadow-lg"
          >
            {t('hero.cta')}
          </Button>
        </section>
        <div id="login"></div>
      </div>
    </div>
  )
}

export default Hero