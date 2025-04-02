"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Payment {
  _id: string;
  amount: number;
  date: string;
  status: string;
}

interface PaymentHistoryProps {
  clientId?: string;
}

export function PaymentHistory({ clientId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const url = clientId ? `/api/payments?clientId=${clientId}` : "/api/payments";
      const response = await fetch(url);
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

  useEffect(() => {
    fetchPayments();
  }, [clientId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const response = await fetch(`/api/payments?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      setPayments(payments.filter((payment) => payment._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment");
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading payment history...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      {payments.length === 0 ? (
        <p className="text-gray-500">No payment history found</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">${payment.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.date).toLocaleDateString()}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    payment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : payment.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(payment._id)}
                className="ml-4 hover:bg-red-600 hover:text-white transition-colors"
                title="Delete payment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
} 