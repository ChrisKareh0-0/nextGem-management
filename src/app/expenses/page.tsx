"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ExpensesIcon } from "@/components/Layouts/sidebar/icons";
import { Pencil, Trash2 } from "lucide-react";

const expenseCategories = [
  "Office Supplies",
  "Utilities",
  "Rent",
  "Marketing",
  "Travel",
  "Equipment",
  "Salaries",
  "Other",
];

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

interface NewExpense {
  category: string;
  amount: string;
  date: string;
  note: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState<NewExpense>({
    category: "",
    amount: "",
    date: "",
    note: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const url = selectedDate
        ? `/api/expenses?date=${selectedDate}`
        : "/api/expenses";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedDate]);

  const handleCreateExpense = async () => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      const createdExpense = await response.json();
      setExpenses([createdExpense, ...expenses]);
      setNewExpense({ category: "", amount: "", date: "", note: "" });
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
    }
  };

  const handleEditExpense = async () => {
    if (!editingExpense) return;

    try {
      const response = await fetch("/api/expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: editingExpense._id,
          ...newExpense,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      const updatedExpense = await response.json();
      setExpenses(
        expenses.map((expense) =>
          expense._id === updatedExpense._id ? updatedExpense : expense
        )
      );
      setNewExpense({ category: "", amount: "", date: "", note: "" });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingExpense(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date.split('T')[0],
      note: expense.note,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ExpensesIcon className="w-6 h-6" />
          Expenses
        </h1>
        <div className="flex gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><a style={{color: "white"}}>Create Expense</a></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Expense" : "Create New Expense"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value: string) =>
                      setNewExpense({ ...newExpense, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewExpense({ ...newExpense, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={newExpense.note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewExpense({ ...newExpense, note: e.target.value })
                    }
                  />
                </div>
                <Button
                  className="w-full text-white"
                  onClick={isEditMode ? handleEditExpense : handleCreateExpense}
                  disabled={
                    !newExpense.category ||
                    !newExpense.amount ||
                    !newExpense.date
                  }
                >
                  {isEditMode ? "Update Expense" : "Create Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : expenses.length === 0 ? (
          <div>No expenses found</div>
        ) : (
          expenses.map((expense) => (
            <Card key={expense._id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{expense.category}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                  {expense.note && (
                    <p className="text-sm text-gray-600 mt-1">{expense.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      ${expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 