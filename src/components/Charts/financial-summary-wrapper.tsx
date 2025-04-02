"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { standardFormat } from "@/lib/utils";

interface Client {
  _id: string;
  companyName: string;
  quotationAmount: number;
  subscriptionDate: string;
}

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalQuotations: number;
  netBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
}

export function FinancialSummaryWrapper() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    totalQuotations: 0,
    netBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyBalance: 0
  });

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate year options (current year and 2 years back)
  const yearOptions = Array.from(
    { length: 3 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Fetch total income
        const totalIncomeResponse = await fetch("/api/statistics/total-income");
        if (!totalIncomeResponse.ok) {
          throw new Error("Failed to fetch total income");
        }
        const totalIncomeResult = await totalIncomeResponse.json();
        const totalIncome = totalIncomeResult.data.totalIncome;

        // Fetch monthly income using the new API
        const monthlyIncomeResponse = await fetch(
          `/api/statistics/monthly-total-income?month=${selectedMonth + 1}&year=${selectedYear}`
        );
        if (!monthlyIncomeResponse.ok) {
          throw new Error("Failed to fetch monthly income");
        }
        const monthlyIncomeResult = await monthlyIncomeResponse.json();
        const monthlyIncome = monthlyIncomeResult.data.totalIncome;

        // Fetch expenses
        const expensesResponse = await fetch("/api/expenses");
        if (!expensesResponse.ok) {
          throw new Error("Failed to fetch expenses");
        }
        const expenses = await expensesResponse.json();
        
        // Calculate total expenses
        const totalExpenses = expenses.reduce(
          (sum: number, expense: { amount: number }) => sum + expense.amount,
          0
        );

        // Fetch clients for quotations
        const clientsResponse = await fetch("/api/clients");
        if (!clientsResponse.ok) {
          throw new Error("Failed to fetch clients");
        }
        const clientsResult = await clientsResponse.json();
        const clients = clientsResult.data || [];
        
        // Calculate total quotations
        const totalQuotations = clients.reduce(
          (sum: number, client: { quotationAmount: number }) => 
            sum + (client.quotationAmount || 0),
          0
        );

        // Calculate balances
        const netBalance = totalIncome - totalExpenses;
        const monthlyBalance = monthlyIncome - expenses.reduce(
          (sum: number, expense: { amount: number; date: string }) => {
            const expenseDate = new Date(expense.date);
            if (
              expenseDate.getMonth() === selectedMonth &&
              expenseDate.getFullYear() === selectedYear
            ) {
              return sum + expense.amount;
            }
            return sum;
          },
          0
        );

        setData({
          totalIncome,
          totalExpenses,
          totalQuotations,
          netBalance,
          monthlyIncome,
          monthlyExpenses: expenses.reduce(
            (sum: number, expense: { amount: number; date: string }) => {
              const expenseDate = new Date(expense.date);
              if (
                expenseDate.getMonth() === selectedMonth &&
                expenseDate.getFullYear() === selectedYear
              ) {
                return sum + expense.amount;
              }
              return sum;
            },
            0
          ),
          monthlyBalance
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchFinancialData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchFinancialData, 30000);
    return () => clearInterval(interval);
  }, [mounted, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4 mb-4">
        <Select 
          value={selectedMonth.toString()} 
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthNames.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
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

      <div className="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">
            ${standardFormat(data.totalIncome)}
          </p>
          <p className="text-sm text-gray-500 mt-1">From completed payments</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Monthly Income</h3>
          <p className="text-3xl font-bold text-green-600">
            ${standardFormat(data.monthlyIncome)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            For {monthNames[selectedMonth]} {selectedYear}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">
            ${standardFormat(data.totalExpenses)}
          </p>
          <p className="text-sm text-gray-500 mt-1">All time expenses</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Net Balance</h3>
          <p className={`text-3xl font-bold ${data.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${standardFormat(Math.abs(data.netBalance))}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.netBalance >= 0 ? 'Positive balance' : 'Negative balance'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${standardFormat(data.monthlyExpenses)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This month's expenses
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Monthly Balance</h3>
          <p
            className={`text-2xl font-bold ${
              data.monthlyBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${standardFormat(data.monthlyBalance)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.monthlyBalance >= 0 ? "Positive" : "Negative"} this month
          </p>
        </Card>
      </div>
    </div>
  );
} 