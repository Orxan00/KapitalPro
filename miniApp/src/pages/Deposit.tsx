import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useState, useEffect } from 'react'
import { getNetworks } from '@/lib/firebase'
import { apiService } from '@/lib/api'
import type { Network, DepositData } from '@/lib/api'
import SuccessPopup from '@/components/SuccessPopup'

interface DepositProps {
  onPageChange: (page: string) => void;
}

export default function Deposit({ onPageChange }: DepositProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successTransactionId, setSuccessTransactionId] = useState('');

  // Fetch networks from Firebase
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setLoading(true);
        setError(null);
        const networks = await getNetworks();
        
        if (networks && networks.length > 0) {
          const depositNetworks = networks.filter((network: Network) => {
            const hasAddress = !!network.address; 
            
            return hasAddress;
          });
          
          setNetworks(depositNetworks);
          
          if (depositNetworks.length === 0) {
            setError('No deposit networks available at the moment.');
          }
        } else {
          setError('No networks available at the moment.');
          setNetworks([]);
        }
      } catch (error) {
        setError('Failed to load networks. Please try again.');
        setNetworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setShowTransactionForm(false);
    setTransactionRef('');
    setAmount('');
  };

  const handleContinue = () => {
    if (selectedNetwork && amount) {
      setShowTransactionForm(true);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!transactionRef.trim() || !selectedNetwork || !amount) return;

    setIsSubmitting(true);
    try {
      const depositData: DepositData = {
        user_id: user?.uid || '',
        user_username: user?.username || '',
        user_first_name: user?.first_name || '',
        user_last_name: user?.last_name || '',
        amount: parseFloat(amount),
        network: selectedNetwork.id,
        network_name: selectedNetwork.name,
        transaction_ref: transactionRef.trim()
      };

      const result = await apiService.createDeposit(depositData);
            
      if (result.success && result.transaction_id) {
        // Set success data
        setSuccessTransactionId(result.transaction_id);
        setShowSuccessPopup(true);
        
        // Reset form
        setSelectedNetwork(null);
        setShowTransactionForm(false);
        setTransactionRef('');
        setAmount('');
      } else {
        alert(result.message || 'Error submitting deposit. Please try again.');
      }
      
    } catch (error) {
      console.error('Error submitting deposit:', error);
      alert('Error submitting deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = () => {
    setShowSuccessPopup(false);
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
          <h1 className="text-3xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-blue-200">Select a network and follow the instructions to deposit</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Selection */}
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Network</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-400">{error}</p>
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

          {/* Deposit Details */}
          {selectedNetwork && (
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
              <CardHeader>
                <h2 className="text-xl font-semibold">Deposit Details</h2>
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
                    placeholder={`Enter amount in ${selectedNetwork.symbol}`}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    step="0.000001"
                  />
                </div>

                {/* Network Address */}
                <div>
                  <Label className="text-white">Network Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <code className="flex-1 text-sm text-blue-200 font-mono break-all">
                      {selectedNetwork.address}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(selectedNetwork.address || '')}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200"
                      size="sm"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="text-sm space-y-1">
                    <li>1. Copy the network address above</li>
                    <li>2. Send exactly {amount} {selectedNetwork.symbol} to this address</li>
                    <li>3. Copy your transaction reference/hash</li>
                    <li>4. Paste it below and submit</li>
                  </ol>
                </div>

                {/* Continue Button */}
                {!showTransactionForm && (
                  <Button
                    onClick={handleContinue}
                    disabled={!amount}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Transaction Reference Form */}
        {showTransactionForm && selectedNetwork && (
          <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Submit Transaction Reference</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transactionRef" className="text-white">Transaction Reference/Hash</Label>
                <Input
                  id="transactionRef"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter your transaction reference or hash"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowTransactionForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitTransaction}
                  disabled={!transactionRef.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <SuccessPopup
        isOpen={showSuccessPopup}
        onViewDetails={handleViewDetails}
        onClose={handleCloseSuccessPopup}
        title="Deposit Submitted Successfully!"
        message="Your deposit has been submitted and is being processed. You can view the details in your transaction history."
        transactionId={successTransactionId}
        type="deposit"
      />
    </div>
  );
} 