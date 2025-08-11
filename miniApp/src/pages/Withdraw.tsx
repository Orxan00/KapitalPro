import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useState, useEffect } from 'react'
import { getNetworks } from '@/lib/firebase'
import { apiService } from '@/lib/api'
import type { Network, WithdrawalData } from '@/lib/api'
import SuccessPopup from '@/components/SuccessPopup'

interface WithdrawProps {
  onPageChange: (page: string) => void;
}

export default function Withdraw({ onPageChange }: WithdrawProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [amount, setAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successTransactionId, setSuccessTransactionId] = useState('');

  // Fetch networks from Firebase
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setLoading(true);
        const networks = await getNetworks();
        
        if (networks && networks.length > 0) {

          const withdrawalNetworks = networks.filter((network: Network) => {
            const hasNoAddress = !network.address;  

            return hasNoAddress;
          });
          
           
          // Remove duplicates based on network ID
          const uniqueNetworks = withdrawalNetworks.filter((network: Network, index: number, self: Network[]) => 
            index === self.findIndex((n: Network) => n.id === network.id)
          );
          
           
          // Show withdrawal networks (networks without addresses)
          setNetworks(uniqueNetworks);
          
          if (uniqueNetworks.length === 0) {
            console.warn('No withdrawal networks found');
          }
        } else {
          setNetworks([]);
        }
      } catch (error) {
        console.error('Error fetching networks:', error);
        setNetworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setAmount('');
    setWithdrawalAddress('');
  };

  const handleSubmitWithdrawal = async () => {
    if (!selectedNetwork || !amount || !withdrawalAddress.trim()) return;

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > selectedNetwork.maxAmount) {
      alert(`Maximum withdrawal amount is ${selectedNetwork.maxAmount} ${selectedNetwork.symbol}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const withdrawalData: WithdrawalData = {
        user_id: user?.uid || '',
        user_username: user?.username || '',
        user_first_name: user?.first_name || '',
        user_last_name: user?.last_name || '',
        amount: withdrawalAmount,
        network: selectedNetwork.id,
        network_name: selectedNetwork.name,
        withdrawal_address: withdrawalAddress.trim()
      };

      const result = await apiService.createWithdrawal(withdrawalData);
      
      if (result.success && result.transaction_id) {
        // Set success data
        setSuccessTransactionId(result.transaction_id);
        setShowSuccessPopup(true);
        
        // Reset form
        setSelectedNetwork(null);
        setAmount('');
        setWithdrawalAddress('');
      } else {
        alert(result.message || 'Error submitting withdrawal. Please try again.');
      }
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Error submitting withdrawal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = () => {
    setShowSuccessPopup(false);
    // Navigate to account page - the transactions section will be visible by default
    onPageChange('account');
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

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
    );
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101930] to-[#1d3784] text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-blue-200">Select a network and enter your withdrawal details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Selection */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Network</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {networks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-blue-200">No withdrawal networks available at the moment.</p>
                  <p className="text-sm text-gray-400 mt-2">Please try again later or contact support.</p>
                </div>
              ) : (
                networks.map((network) => (
                  <div
                    key={network.id}
                    onClick={() => handleNetworkSelect(network)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedNetwork?.id === network.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{network.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{network.name}</h3>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Withdrawal Details */}
          {selectedNetwork && (
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
              <CardHeader>
                <h2 className="text-xl font-semibold">Withdrawal Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount" className="text-white">Amount ({selectedNetwork.symbol})</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Max: ${selectedNetwork.maxAmount}`}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    max={selectedNetwork.maxAmount}
                  />
                </div>

                {/* Withdrawal Address */}
                <div>
                  <Label htmlFor="address" className="text-white">Withdrawal Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={withdrawalAddress}
                    onChange={(e) => setWithdrawalAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitWithdrawal}
                  disabled={!amount || !withdrawalAddress.trim() || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    'Submit Withdrawal'
                  )}
                </Button>

                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Maximum withdrawal: {selectedNetwork.maxAmount} {selectedNetwork.symbol}</li>
                  <li>• Withdrawals are processed within 24-48 hours</li>
                  <li>• Ensure your wallet address is correct</li>
                  <li>• Contact support if you have any questions</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleCloseSuccessPopup}
        onViewDetails={handleViewDetails}
        title="Withdrawal Request Submitted!"
        message="Your withdrawal request has been submitted and is being processed. You can view the details in your transaction history."
        transactionId={successTransactionId}
        type="withdrawal"
      />
    </div>
  );
} 