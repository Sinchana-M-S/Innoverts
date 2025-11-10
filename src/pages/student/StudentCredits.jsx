import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatDate } from '../../lib/utils';

export default function StudentCredits() {
  const { user, fetchUser } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditsHistory();
    fetchUser();
  }, []);

  const fetchCreditsHistory = async () => {
    try {
      const { data } = await api.get('/credits/history');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch credits history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">Credits</h1>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Total Credits</p>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="text-yellow-500 dark:text-yellow-400" size={32} />
                    <span className="text-5xl font-bold text-black dark:text-white">
                      {user?.credits || 0}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user?.credits || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-900" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="py-8 text-center text-gray-600 dark:text-gray-400">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((transaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4"
                  >
                    <div className="flex items-center space-x-4">
                      {transaction.type === 'earned' || transaction.type === 'initial' ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                          <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                          <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'earned' || transaction.type === 'initial'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'earned' || transaction.type === 'initial'
                          ? '+'
                          : '-'}
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{transaction.type}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

