"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface ClientPayment {
  _id: string;
  clientName: string;
  amount: number;
  date: string;
  description: string;
  status: "pending" | "completed" | "cancelled";
}

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ClientPayment | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    status: "completed" as "pending" | "completed" | "cancelled",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/client-payments");
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPayment
        ? `/api/client-payments?id=${editingPayment._id}`
        : "/api/client-payments";
      const method = editingPayment ? "PUT" : "POST";
      const body = {
        ...formData,
        _id: editingPayment?._id,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save payment");
      }

      setIsDialogOpen(false);
      setEditingPayment(null);
      setFormData({
        clientName: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        status: "completed",
      });
      fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (payment: ClientPayment) => {
    setEditingPayment(payment);
    setFormData({
      clientName: payment.clientName,
      amount: payment.amount.toString(),
      date: format(new Date(payment.date), "yyyy-MM-dd"),
      description: payment.description,
      status: payment.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/client-payments?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Payments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? "Edit Payment" : "Add New Payment"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "completed" | "cancelled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingPayment ? "Update Payment" : "Add Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{payment.clientName}</h3>
                  <p className="text-gray-600">
                    ${payment.amount.toFixed(2)} -{" "}
                    {format(new Date(payment.date), "MMM d, yyyy")}
                  </p>
                  {payment.description && (
                    <p className="text-gray-500 mt-1">{payment.description}</p>
                  )}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(payment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(payment._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 