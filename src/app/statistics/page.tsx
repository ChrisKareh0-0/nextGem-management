"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthlyIncome {
  _id: string;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface StatisticsData {
  monthlyIncomeRecords: MonthlyIncome[];
  totalIncome: number;
  totalExpenses: number;
  monthlyIncomeAmount: number;
  monthlyExpenses: number;
  difference: number;
  monthlyDifference: number;
  selectedMonth: number;
  selectedYear: number;
}

export default function StatisticsPage() {
  const [monthlyIncomeRecords, setMonthlyIncomeRecords] = useState<MonthlyIncome[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyIncomeAmount, setMonthlyIncomeAmount] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [difference, setDifference] = useState(0);
  const [monthlyDifference, setMonthlyDifference] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate year options (current year and 2 years back)
  const yearOptions = Array.from(
    { length: 3 },
    (_, i) => new Date().getFullYear() - i
  );

  // Month names for the select dropdown
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchStatistics();
    // Set up an interval to refresh data every 5 seconds
    const interval = setInterval(fetchStatistics, 5000);
    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  const fetchStatistics = async () => {
    try {
      console.log('Fetching statistics data...');
      const response = await fetch(`/api/statistics/monthly-income?year=${selectedYear}&month=${selectedMonth}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      if (data.success) {
        console.log('Received statistics data:', data.data);
        setMonthlyIncomeRecords(data.data.monthlyIncome);
        setTotalIncome(data.data.totalIncome);
        setTotalExpenses(data.data.totalExpenses);
        setMonthlyIncomeAmount(data.data.monthlyIncomeAmount);
        setMonthlyExpenses(data.data.monthlyExpenses);
        setDifference(data.data.difference);
        setMonthlyDifference(data.data.monthlyDifference);
      } else {
        throw new Error(data.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <div className="flex gap-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Total Income Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Income</h2>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          <p className="text-sm text-gray-500 mt-1">From all completed payments</p>
        </Card>

        {/* Monthly Income Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Monthly Income</h2>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(monthlyIncomeAmount)}</p>
          <p className="text-sm text-gray-500 mt-1">For {monthNames[selectedMonth - 1]} {selectedYear}</p>
        </Card>

        {/* Monthly Income List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Income History</h2>
          {monthlyIncomeRecords.length === 0 ? (
            <p className="text-gray-500">No income records found</p>
          ) : (
            <div className="space-y-4">
              {monthlyIncomeRecords.map((income) => (
                <div key={income._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {format(new Date(income.year, income.month - 1), 'MMMM yyyy')}
                    </p>
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