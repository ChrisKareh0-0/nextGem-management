"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface MonthlyIncome {
  _id: string;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export default function StatisticsPage() {
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyIncome();
  }, []);

  const fetchMonthlyIncome = async () => {
    try {
      const response = await fetch('/api/statistics/monthly-income');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly income');
      }
      const data = await response.json();
      if (data.success) {
        setMonthlyIncome(data.data.monthlyIncome);
        setTotalIncome(data.data.totalIncome);
      } else {
        throw new Error(data.error || 'Failed to fetch monthly income');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>
      
      <div className="grid gap-6">
        {/* Total Income Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Income</h2>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
        </Card>

        {/* Monthly Income List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Income</h2>
          {monthlyIncome.length === 0 ? (
            <p className="text-gray-500">No income records found</p>
          ) : (
            <div className="space-y-4">
              {monthlyIncome.map((income) => (
                <div key={income._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {format(new Date(income.year, income.month - 1), 'MMMM yyyy')}
                    </p>
                    {income._id === 'current-month' && (
                      <p className="text-sm text-gray-500">Current Month</p>
                    )}
                  </div>
                  <p className={`text-lg font-semibold ${income.amount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formatCurrency(income.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 