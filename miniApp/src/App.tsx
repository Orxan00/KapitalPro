import './App.css'
import Hero from './Hero/Hero'
import Status from './Status/Status'
import InvestmentPricing from './InvestmentPricing/InvestmentPricing'
import InvestmentPlatform from './InvestmentPlatform/InvestmentPlatform'
import InvestmentHero from './InvestmentHero/InvestmentHero'
import Footer from './Footer/Footer'
import Account from './Account/Account'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import SubscriptionPage from './pages/Subscription'
import Nav from './Hero/Nav'
import { useLoading } from './contexts/LoadingContext'
import { PageLoader } from './components/ui/loader'
import { useState, useCallback } from 'react'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { UserProvider } from './contexts/UserProvider'

function AppContent() {
  const { isLoading } = useLoading()
  const [currentPage, setCurrentPage] = useState('home')

  // Memoize handlePageChange to prevent Nav component re-renders
  const handlePageChange = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'account':
        return <Account onPageChange={handlePageChange} />
      case 'deposit':
        return <Deposit onPageChange={handlePageChange} />
      case 'withdraw':
        return <Withdraw onPageChange={handlePageChange} />
      case 'subscription':
        return <SubscriptionPage onPageChange={handlePageChange} />
      default:
        return (
          <>
            <Hero />
            <Status />
            <InvestmentPricing onPageChange={handlePageChange} />
            <InvestmentPlatform />
            <InvestmentHero />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
      <Nav onPageChange={handlePageChange} />
      {isLoading && <PageLoader />}
      {renderPage()}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Provider>
  );
}

export default App
