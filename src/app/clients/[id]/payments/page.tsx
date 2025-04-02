"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Card } from "@/components/ui/card";

interface PaymentRecord {
  _id: string;
  amount: number;
  date: string;
  description?: string;
  status: "completed" | "pending" | "cancelled";
}

export default function ClientPaymentsPage() {
  const params = useParams();
  const clientId = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    const fetchClientAndPayments = async () => {
      try {
        setLoading(true);
        // Fetch client details
        const clientResponse = await fetch(`/api/clients/${clientId}`);
        const clientData = await clientResponse.json();
        
        if (!clientData.success) {
          throw new Error(clientData.error || 'Failed to fetch client details');
        }
        
        setClient(clientData.data);

        // Fetch payment history
        const paymentsResponse = await fetch(`/api/clients/${clientId}/payments`);
        const paymentsData = await paymentsResponse.json();
        
        if (!paymentsData.success) {
          throw new Error(paymentsData.error || 'Failed to fetch payment history');
        }
        
        setPayments(paymentsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClientAndPayments();
  }, [clientId]);

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Client Payment History" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Client Payment History" />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Client Payment History" />
      
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Payment History for {client?.companyName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Contact: {client?.contactName}
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No payment records found for this client.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment._id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                    {payment.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {payment.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 