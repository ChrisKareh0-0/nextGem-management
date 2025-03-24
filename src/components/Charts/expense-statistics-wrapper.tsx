"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface ExpenseData {
  date: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
];

export function ExpenseStatisticsWrapper() {
  const [expenseTrend, setExpenseTrend] = useState<ExpenseData[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/expenses");
        if (!response.ok) {
          throw new Error("Failed to fetch expense data");
        }
        const expenses: Expense[] = await response.json();

        // Process data for trend chart
        const trendData = expenses.reduce((acc: { [key: string]: number }, expense: Expense) => {
          const date = new Date(expense.date).toLocaleDateString();
          acc[date] = (acc[date] || 0) + expense.amount;
          return acc;
        }, {});

        const trendArray: ExpenseData[] = Object.entries(trendData).map(([date, amount]) => ({
          date,
          amount,
        }));

        // Process data for category distribution
        const categoryData = expenses.reduce((acc: { [key: string]: number }, expense: Expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {});

        const categoryArray: CategoryData[] = Object.entries(categoryData).map(([name, value]) => ({
          name,
          value,
        }));

        setExpenseTrend(trendArray);
        setCategoryDistribution(categoryArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Expense Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expenseTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                name="Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
} 