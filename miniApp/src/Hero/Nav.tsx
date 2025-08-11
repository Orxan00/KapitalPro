import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import logo from '@/assets/logo.png';

interface NavProps {
  onPageChange: (page: string) => void;
}

const Nav = ({ onPageChange }: NavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const isMenuOpenRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  // Prevent menu from closing when clicking inside it
  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle overlay click to close menu
  const handleOverlayClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Handle navigation to sections
  const handleSectionNavigation = useCallback((sectionId: string) => {
    // First navigate to home page
    onPageChange('home');
    
    // Then scroll to the section after a short delay to ensure the page is rendered
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    closeMenu();
  }, [onPageChange, closeMenu]);

  return (
    <>
      <header className="fixed top-0 w-full z-50 border-b border-white/10 backdrop-blur-lg bg-gradient-to-r from-[#0d1225]/80 to-[#182e6a]/80 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center">
            <img src={logo} alt="KapitalPro" className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold text-white">KapitalPro</h1>
        </div>

        <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
          <nav className="flex gap-8 items-center">
            <button 
              onClick={() => handleSectionNavigation('packages')}
              className="text-white/80 hover:text-white font-semibold transition-colors"
            >
              {t('nav.packages')}
            </button>
            <button 
              onClick={() => handleSectionNavigation('features')}
              className="text-white/80 hover:text-white font-semibold transition-colors"
            >
              {t('nav.features')}
            </button>
            <button 
              onClick={() => handleSectionNavigation('about')}
              className="text-white/80 hover:text-white font-semibold transition-colors"
            >
              {t('nav.about')}
            </button>
            <button 
              onClick={() => onPageChange('account')}
              className="text-white/80 hover:text-white font-semibold transition-colors flex items-center gap-2"
            >
              <FiUser className="w-4 h-4" />
              Account
            </button>
            <button 
              onClick={() => onPageChange('subscription')}
              className="text-white/80 hover:text-white font-semibold transition-colors"
            >
              My Subscription
            </button>
          </nav>
          <select
            className="ml-4 bg-slate-800/80 text-white rounded-md px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            aria-label="Select language"
          >
            <option value="az">AZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </div>

        <button
          onClick={toggleMenu}
          className="text-white md:hidden p-2 rounded-lg"
        >
          {!isMenuOpen ? <FiMenu className="w-6 h-6" /> : <FiX className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleOverlayClick}
        >
          <div 
            className="absolute top-0 right-0 h-full w-64 bg-gradient-to-r from-[#0d1225] to-[#182e6a] shadow-lg z-50"
            onClick={handleMenuClick}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button 
                  onClick={closeMenu} 
                  className="text-white p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                <button 
                  onClick={() => handleSectionNavigation('packages')}
                  className="block py-3 px-4 text-white font-semibold border-b border-gray-700 w-full text-left"
                >
                  {t('nav.packages')}
                </button>
                <button 
                  onClick={() => handleSectionNavigation('features')}
                  className="block py-3 px-4 text-white font-semibold border-b border-gray-700 w-full text-left"
                >
                  {t('nav.features')}
                </button>
                <button 
                  onClick={() => handleSectionNavigation('about')}
                  className="block py-3 px-4 text-white font-semibold border-b border-gray-700 w-full text-left"
                >
                  {t('nav.about')}
                </button>
                <button 
                  onClick={() => { closeMenu(); onPageChange('account'); }}
                  className="block py-3 px-4 text-white font-semibold w-full text-left flex items-center gap-2 border-b border-gray-700"
                >
                  <FiUser className="w-4 h-4" />
                  Account
                </button>
                <button 
                  onClick={() => { closeMenu(); onPageChange('subscription'); }}
                  className="block py-3 px-4 text-white font-semibold w-full text-left"
                >
                  My Subscription
                </button>

                <div className="mt-6">
                  <label className="block text-white text-sm mb-2">Language</label>
                  <select
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none text-sm"
                    value={i18n.language}
                    onChange={e => i18n.changeLanguage(e.target.value)}
                    aria-label="Select language"
                  >
                    <option value="az">AZ</option>
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                  </select>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;