import { useState, useEffect } from 'react';
import { Client } from '@/types/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrashIcon, PencilSquareIcon, CurrencyDollarIcon, XCircleIcon } from '@/assets/icons/index';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClientsTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  onEdit: (client: Client) => void;
  onEndSubscription: (id: string) => void;
  onRecordPayment?: (id: string) => void;
}

export function ClientsTable({ clients, onDelete, onEdit, onEndSubscription, onRecordPayment }: ClientsTableProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const formatPaymentDueDate = (dueDate: { day: number; month?: number }) => {
    if (!currentDate || !dueDate) return '-';
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    
    // Calculate the next due date
    let dueMonth = currentMonth; // 0-indexed
    let dueYear = currentYear;
    
    // If the due day has already passed this month, it's due next month
    if (dueDate.day < currentDay) {
      dueMonth = currentMonth + 1;
      if (dueMonth > 11) { // 0-indexed months
        dueMonth = 0;
        dueYear = currentYear + 1;
      }
    }
    
    // Format date manually since we don't have date-fns
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dueDate.day} ${monthNames[dueMonth]} ${dueYear}`;
  };

  const isPaymentOverdue = (dueDate: { day: number; month?: number }) => {
    if (!currentDate || !dueDate) return false;
    
    const currentDay = currentDate.getDate();
    
    // For recurring monthly payments, we need to check if the due date has passed this month
    return dueDate.day < currentDay;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If the date is invalid, return the original string
      return dateString;
    }
    
    // Format date manually to avoid locale issues
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}/payments`);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <h2 className="mb-6 text-xl font-semibold text-dark dark:text-white">Client Management</h2>
      
      {/* Client Summary Section */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-dark dark:text-white">Total Clients</h3>
              <p className="text-3xl font-bold text-dark dark:text-white">{clients.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-dark dark:text-white">Active Subscriptions</h3>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {clients.filter(client => client.subscriptionStatus === 'active').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4CBC9A] bg-opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#4CBC9A]">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-dark dark:text-white">Ended Subscriptions</h3>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {clients.filter(client => client.subscriptionStatus === 'ended').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6B7280] bg-opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#6B7280]">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-dark dark:text-white">Total Amount Due</h3>
              <p className="text-3xl font-bold text-dark dark:text-white">
                {formatCurrency(
                  clients
                    .filter(client => client.subscriptionStatus === 'active')
                    .reduce((total, client) => total + (client.quotationAmount || 0), 0)
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3C50E0] bg-opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#3C50E0]">
                <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {clients.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No clients found. Add your first client to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead>Company</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Due Date</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client) => (
              <TableRow 
                key={client._id} 
                className="border-[#eee] dark:border-dark-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2"
                onClick={() => handleRowClick(client._id)}
              >
                <TableCell>
                  <h5 className="text-dark dark:text-white">{client.companyName}</h5>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{client.contactName}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{client.phone}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">{client.email || '-'}</p>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">
                    {formatDate(client.subscriptionDate)}
                  </p>
                </TableCell>
                <TableCell>
                  <div className={`max-w-fit rounded-full px-3.5 py-1 text-sm font-medium ${
                    client.subscriptionStatus === 'ended' 
                      ? 'bg-[#F7F9FC] text-[#6B7280] dark:bg-[rgba(107,114,128,0.1)]'
                      : 'bg-[#EFF9F3] text-[#4CBC9A] dark:bg-[rgba(76,188,154,0.1)]'
                  }`}>
                    {client.subscriptionStatus === 'ended' ? 'Ended' : 'Active'}
                    {client.subscriptionEndDate && client.subscriptionStatus === 'ended' && 
                      ` (${formatDate(client.subscriptionEndDate)})`}
                  </div>
                </TableCell>
                <TableCell>
                  {client.subscriptionStatus === 'active' ? (
                    <div className={`max-w-fit rounded-full px-3.5 py-1 text-sm font-medium ${
                      isPaymentOverdue(client.paymentDueDate)
                        ? 'bg-[#FFF6F5] text-[#D34053] dark:bg-[rgba(211,64,83,0.1)]'
                        : 'bg-[#EFF9F3] text-[#4CBC9A] dark:bg-[rgba(76,188,154,0.1)]'
                    }`}>
                      {formatPaymentDueDate(client.paymentDueDate)}
                    </div>
                  ) : (
                    <p className="text-gray-500">-</p>
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">
                    {client.lastPaymentDate ? formatDate(client.lastPaymentDate) : '-'}
                  </p>
                </TableCell>
                <TableCell>
                  <p className={`text-dark dark:text-white font-medium ${
                    client.subscriptionStatus === 'active' && isPaymentOverdue(client.paymentDueDate) 
                      ? 'text-[#D34053]' 
                      : ''
                  }`}>
                    {formatCurrency(client.quotationAmount)}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                    {client.subscriptionStatus === 'active' && (
                      <>
                        <button 
                          className="hover:text-primary"
                          onClick={() => onRecordPayment?.(client._id)}
                        >
                          <span className="sr-only">Record Payment</span>
                          <CurrencyDollarIcon />
                        </button>
                        <button 
                          className="hover:text-primary"
                          onClick={() => onEndSubscription(client._id)}
                        >
                          <span className="sr-only">End Subscription</span>
                          <XCircleIcon />
                        </button>
                      </>
                    )}
                    <button 
                      className="hover:text-primary"
                      onClick={() => onEdit(client)}
                    >
                      <span className="sr-only">Edit Client</span>
                      <PencilSquareIcon />
                    </button>
                    <button 
                      className="hover:text-primary"
                      onClick={() => onDelete(client._id)}
                    >
                      <span className="sr-only">Delete Client</span>
                      <TrashIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 