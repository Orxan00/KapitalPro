import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { fetchUserDeposits, fetchUserWithdrawals } from '@/lib/api';

interface Transaction {
  id: string;
  amount: number;
  network: string;
  network_name: string;
  status: string;
  created_at: any;
  transaction_ref?: string;
  withdrawal_address?: string;
}

interface TransactionsProps {
  userId: string;
}

export default function Transactions({ userId }: TransactionsProps) {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const [depositsData, withdrawalsData] = await Promise.all([
          fetchUserDeposits(userId),
          fetchUserWithdrawals(userId)
        ]);
        setDeposits(depositsData);
        setWithdrawals(withdrawalsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
      // Firestore timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore timestamp object
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp._seconds) {
      // Alternative Firestore timestamp format
      date = new Date(timestamp._seconds * 1000);
    } else {
      // Regular date string or number
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
     return amount.toString() + ' USDT';
  };

  const formatNetwork = (network_name: string) => {
    // Remove USDT extension from network names
    return network_name.replace(/\s*-\s*USDT$/, '').replace(/\s*USDT$/, '');
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10'
        };
    }
  };

  const renderTable = (transactions: Transaction[], type: 'deposit' | 'withdrawal') => {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-8 text-blue-200">
          <div className="mb-3">
            {type === 'deposit' ? (
              <ArrowDownCircle className="w-8 h-8 mx-auto text-blue-200/50" />
            ) : (
              <ArrowUpCircle className="w-8 h-8 mx-auto text-blue-200/50" />
            )}
          </div>
          <p className="text-sm">No {type}s found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="sticky top-0 bg-gradient-to-br from-[#101930] to-[#1d3784] z-10">
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-blue-200 font-medium">Amount</th>
              <th className="text-left py-3 px-2 text-blue-200 font-medium">Network</th>
              <th className="text-left py-3 px-2 text-blue-200 font-medium">Status</th>
              <th className="text-left py-3 px-2 text-blue-200 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="max-h-80 overflow-y-auto scrollbar-hide">
            {transactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              
              return (
                <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2">
                    <span className="text-white font-medium">
                      {formatAmount(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-blue-200">{formatNetwork(transaction.network_name)}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig.bgColor}`}>
                      {statusConfig.icon}
                      <span className={statusConfig.color}>{transaction.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-blue-200">{formatDate(transaction.created_at)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
        <h3 className="text-lg font-semibold text-white text-center">Transaction History</h3>
      <div className="flex items-center justify-center">
        <div className="flex items-center  gap-1 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
              activeTab === 'deposits'
                ? 'bg-green-500 text-white'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
              activeTab === 'withdrawals'
                ? 'bg-orange-500 text-white'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Withdrawals ({withdrawals.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <p className="text-blue-200 text-xs">Loading transactions...</p>
          </div>
        </div>
      ) : (
        <div>
          {activeTab === 'deposits' 
            ? renderTable(deposits, 'deposit')
            : renderTable(withdrawals, 'withdrawal')
          }
        </div>
      )}
    </div>
  );
} 