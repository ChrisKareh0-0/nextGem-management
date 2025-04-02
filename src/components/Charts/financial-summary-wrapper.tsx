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

interface Client {
  _id: string;
  companyName: string;
  quotationAmount: number;
  subscriptionDate: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  difference: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDifference: number;
  totalClientQuotations: number;
  monthlyClientQuotations: number;
}

export function FinancialSummaryWrapper() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    difference: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyDifference: 0,
    totalClientQuotations: 0,
    monthlyClientQuotations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        // Get selected month's start and end dates
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

        console.log('Date range for monthly calculations:', {
          startOfMonth: startOfMonth.toISOString(),
          endOfMonth: endOfMonth.toISOString(),
          selectedMonth,
          selectedYear
        });

        // Fetch expenses
        const expensesResponse = await fetch("/api/expenses");
        if (!expensesResponse.ok) {
          throw new Error("Failed to fetch expenses");
        }
        const expenses = await expensesResponse.json();
        console.log('Received expenses:', expenses);
        
        // Calculate total expenses
        const totalExpenses = expenses.reduce(
          (sum: number, expense: { amount: number }) => sum + expense.amount,
          0
        );
        console.log('Total expenses:', totalExpenses);

        // Calculate monthly expenses
        const monthlyExpenses = expenses.reduce(
          (sum: number, expense: { amount: number; date: string }) => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = expenseDate.getMonth();
            const expenseYear = expenseDate.getFullYear();
            
            if (expenseMonth === selectedMonth && expenseYear === selectedYear) {
              console.log('Including monthly expense:', {
                amount: expense.amount,
                date: expenseDate.toISOString(),
                month: expenseMonth,
                year: expenseYear
              });
              return sum + expense.amount;
            }
            return sum;
          },
          0
        );
        console.log('Monthly expenses:', monthlyExpenses);

        // Fetch client payments
        const paymentsResponse = await fetch("/api/client-payments");
        if (!paymentsResponse.ok) {
          throw new Error("Failed to fetch client payments");
        }
        const payments = await paymentsResponse.json();
        console.log('Received payments:', payments);
        
        // Calculate total income from completed payments
        const totalPayments = payments.reduce(
          (sum: number, payment: { amount: number; status: string }) => {
            if (payment.status === 'completed') {
              console.log('Including completed payment in total:', {
                amount: payment.amount,
                status: payment.status
              });
              return sum + payment.amount;
            }
            return sum;
          },
          0
        );
        console.log('Total payments:', totalPayments);

        // Fetch clients and calculate total quotations
        const clientsResponse = await fetch("/api/clients");
        if (!clientsResponse.ok) {
          throw new Error("Failed to fetch clients");
        }
        const clientsResult = await clientsResponse.json();
        const clients = clientsResult.data || [];
        console.log('Received clients:', clients);

        // Calculate total and monthly client quotations
        const { totalClientQuotations, monthlyClientQuotations } = clients.reduce(
          (acc: { totalClientQuotations: number; monthlyClientQuotations: number }, client: Client) => {
            const subscriptionDate = new Date(client.subscriptionDate);
            const subscriptionMonth = subscriptionDate.getMonth();
            const subscriptionYear = subscriptionDate.getFullYear();
            const amount = client.quotationAmount || 0;

            console.log('Processing client quotation:', {
              clientName: client.companyName,
              amount,
              subscriptionDate: subscriptionDate.toISOString(),
              isInSelectedMonth: subscriptionMonth === selectedMonth && subscriptionYear === selectedYear
            });

            acc.totalClientQuotations += amount;
            if (subscriptionMonth === selectedMonth && subscriptionYear === selectedYear) {
              acc.monthlyClientQuotations += amount;
            }
            return acc;
          },
          { totalClientQuotations: 0, monthlyClientQuotations: 0 }
        );
        console.log('Client quotations:', { totalClientQuotations, monthlyClientQuotations });

        // Calculate monthly income from payments
        const monthlyPayments = payments.reduce(
          (sum: number, payment: { amount: number; date: string; status: string }) => {
            const paymentDate = new Date(payment.date);
            const paymentMonth = paymentDate.getMonth();
            const paymentYear = paymentDate.getFullYear();
            const isCompleted = payment.status === 'completed';

            if (isCompleted && paymentMonth === selectedMonth && paymentYear === selectedYear) {
              console.log('Including payment in monthly income:', payment.amount);
              return sum + payment.amount;
            }
            return sum;
          },
          0
        );
        console.log('Monthly payments:', monthlyPayments);

        // Calculate total and monthly income
        const totalIncome = totalPayments + totalClientQuotations;
        const monthlyIncome = monthlyPayments + monthlyClientQuotations;

        // Calculate differences
        const difference = totalIncome - totalExpenses;
        const monthlyDifference = monthlyIncome - monthlyExpenses;

        console.log('Final calculations:', {
          totalPayments,
          totalClientQuotations,
          totalIncome,
          monthlyPayments,
          monthlyClientQuotations,
          monthlyIncome,
          totalExpenses,
          monthlyExpenses,
          difference,
          monthlyDifference,
          selectedMonth,
          selectedYear
        });

        // Update state with calculated values
        setSummary({
          totalIncome,
          totalExpenses,
          difference,
          monthlyIncome,
          monthlyExpenses,
          monthlyDifference,
          totalClientQuotations,
          monthlyClientQuotations,
        });
      } catch (err) {
        console.error('Error in financial calculations:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [mounted, selectedMonth, selectedYear]);

  if (!mounted) {
    return null;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Month</label>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger>
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
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Year</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${summary.totalIncome.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Payments: ${(summary.totalIncome - summary.totalClientQuotations).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            Quotations: ${summary.totalClientQuotations.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Client Quotations</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${summary.totalClientQuotations.toFixed(2)}
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
          <p className="text-sm text-gray-500 mt-1">
            Payments: ${(summary.monthlyIncome - summary.monthlyClientQuotations).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            Quotations: ${summary.monthlyClientQuotations.toFixed(2)}
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