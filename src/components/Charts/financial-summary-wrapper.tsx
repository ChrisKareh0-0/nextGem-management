"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  difference: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDifference: number;
}

export function FinancialSummaryWrapper() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    difference: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyDifference: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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

        // Calculate monthly expenses
        const monthlyExpenses = expenses.reduce(
          (sum: number, expense: { amount: number; date: string }) => {
            const expenseDate = new Date(expense.date);
            if (expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
              return sum + expense.amount;
            }
            return sum;
          },
          0
        );

        // Fetch client payments
        const paymentsResponse = await fetch("/api/client-payments");
        if (!paymentsResponse.ok) {
          throw new Error("Failed to fetch client payments");
        }
        const payments = await paymentsResponse.json();
        
        // Calculate total income
        const totalIncome = payments.reduce(
          (sum: number, payment: { amount: number }) => sum + payment.amount,
          0
        );

        // Calculate monthly income
        const monthlyIncome = payments.reduce(
          (sum: number, payment: { amount: number; date: string }) => {
            const paymentDate = new Date(payment.date);
            if (paymentDate >= startOfMonth && paymentDate <= endOfMonth) {
              return sum + payment.amount;
            }
            return sum;
          },
          0
        );

        setSummary({
          totalIncome,
          totalExpenses,
          difference: totalIncome - totalExpenses,
          monthlyIncome,
          monthlyExpenses,
          monthlyDifference: monthlyIncome - monthlyExpenses,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${summary.totalIncome.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Net Balance</h3>
          <p
            className={`text-2xl font-bold ${
              summary.difference >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${summary.difference.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {summary.difference >= 0 ? "Positive" : "Negative"} balance
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Monthly Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${summary.monthlyIncome.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${summary.monthlyExpenses.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Monthly Balance</h3>
          <p
            className={`text-2xl font-bold ${
              summary.monthlyDifference >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${summary.monthlyDifference.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {summary.monthlyDifference >= 0 ? "Positive" : "Negative"} this month
          </p>
        </Card>
      </div>
    </div>
  );
} 