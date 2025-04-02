import { useState, useEffect } from 'react';
import { Client } from '@/types/client';

// Mock data for clients - in a real app, this would be fetched from an API
const mockClients: Client[] = [
  {
    _id: '1',
    companyName: 'Acme Corporation',
    contactName: 'John Doe',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@acme.com',
    subscriptionDate: '2023-01-15',
    subscriptionStatus: 'active',
    paymentDueDate: {
      day: 15,
      month: 3,
    },
    quotationFile: '/quotations/acme-corp.pdf',
    quotationAmount: 5000.00,
  },
  {
    _id: '2',
    companyName: 'Globex Industries',
    contactName: 'Jane Smith',
    phone: '+1 (555) 987-6543',
    email: 'jane.smith@globex.com',
    subscriptionDate: '2023-02-20',
    subscriptionStatus: 'active',
    paymentDueDate: {
      day: 20,
      month: 3,
    },
    quotationFile: null,
    quotationAmount: 3500.50,
  },
];

const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        console.log('Client Hook: Fetching clients from API...');
        
        const response = await fetch('/api/clients');
        console.log(`Client Hook: Received response with status: ${response.status}`);
        
        const result = await response.json();
        console.log('Client Hook: Parsed response:', { success: result.success, dataCount: result.data?.length || 0 });
        
        if (!result.success) {
          const errorMessage = result.error || 'Failed to fetch clients';
          console.error('Client Hook: API returned error:', errorMessage, result.details || '');
          throw new Error(errorMessage);
        }
        
        setClients(result.data);
        console.log(`Client Hook: Successfully loaded ${result.data.length} clients`);
        setLoading(false);
      } catch (err) {
        console.error('Client Hook: Error fetching clients:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const addClient = async (client: Omit<Client, '_id'>) => {
    try {
      setLoading(true);
      console.log('Client Hook: Adding new client with data:', client);
      console.log('Client Hook: Quotation amount:', client.quotationAmount, typeof client.quotationAmount);
      
      // Make sure we're not including an _id field in the new client data
      // Create a new object without any potential _id field to avoid duplicate key errors
      const { _id, ...clientWithoutId } = client as any;
      
      // Handle file upload if there's a quotation file
      let quotationFilePath = client.quotationFile;
      
      // CRITICAL FIX: Ensure quotationAmount is a valid number
      let amount: any = client.quotationAmount;
      
      // Ensure it's a valid numeric value (never undefined or NaN)
      if (amount === undefined || amount === null) {
        console.log('Client Hook: quotationAmount is undefined/null, setting to 0');
        amount = 0;
      } else if (typeof amount === 'string') {
        // Handle string inputs carefully
        const trimmed = amount.trim();
        if (trimmed === '') {
          console.log('Client Hook: quotationAmount is empty string, setting to 0');
          amount = 0;
        } else {
          // Use parseFloat for better decimal precision
          const parsed = parseFloat(trimmed);
          if (isNaN(parsed)) {
            console.log(`Client Hook: Failed to parse "${amount}" to number, setting to 0`);
            amount = 0;
          } else {
            console.log(`Client Hook: Parsed "${amount}" to ${parsed}`);
            amount = parsed;
          }
        }
      } else if (typeof amount !== 'number') {
        // Try to convert other types
        const numValue = Number(amount);
        if (isNaN(numValue)) {
          console.log(`Client Hook: Failed to convert ${amount} to number, setting to 0`);
          amount = 0;
        } else {
          console.log(`Client Hook: Converted ${amount} to ${numValue}`);
          amount = numValue;
        }
      } else if (isNaN(amount)) {
        // Handle NaN if it's already a number type
        console.log('Client Hook: quotationAmount is NaN, setting to 0');
        amount = 0;
      }
      
      // Create the data object with quotationAmount explicitly set
      const dataToSend = {
        ...clientWithoutId,
        quotationFile: quotationFilePath,
        quotationAmount: amount // Explicitly set with validated amount
      };
      
      console.log('Client Hook: Sending client data to server:', dataToSend);
      console.log('Client Hook: Quotation amount being sent:', dataToSend.quotationAmount, typeof dataToSend.quotationAmount);
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        const errorMessage = result.error || 'Failed to add client';
        console.error('Client Hook: API error adding client:', errorMessage, result.details || '');
        throw new Error(errorMessage);
      }
      
      console.log('Client Hook: Client added successfully with ID:', result.data._id);
      console.log('Client Hook: Returned client data:', result.data);
      console.log('Client Hook: Returned quotation amount:', result.data.quotationAmount, typeof result.data.quotationAmount);
      
      setClients((prevClients) => [...prevClients, result.data]);
      setLoading(false);
      return result.data;
    } catch (err) {
      console.error('Client Hook: Error adding client:', err);
      setError(err instanceof Error ? err.message : 'Failed to add client');
      setLoading(false);
      throw err;
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      setLoading(true);
      console.log('Client Hook: Updating client with ID:', updatedClient._id);
      console.log('Client Hook: Complete update data:', JSON.stringify(updatedClient, null, 2));
      console.log('Client Hook: Quotation amount from input:', updatedClient.quotationAmount, typeof updatedClient.quotationAmount);
      
      // CRITICAL FIX: Ensure quotationAmount is a valid number
      let quotationAmountToSend: any = updatedClient.quotationAmount;
      
      // Process the value to ensure it's a valid number
      if (quotationAmountToSend === undefined || quotationAmountToSend === null) {
        quotationAmountToSend = 0;
        console.log('Client Hook: Quotation amount was undefined/null, defaulting to 0');
      } else if (typeof quotationAmountToSend === 'string') {
        // Parse strings carefully to preserve decimal precision
        const trimmedValue = quotationAmountToSend.trim();
        if (trimmedValue === '') {
          quotationAmountToSend = 0;
          console.log('Client Hook: Quotation amount was empty string, defaulted to 0');
        } else {
          // Use parseFloat for better decimal handling
          const parsedValue = parseFloat(trimmedValue);
          if (isNaN(parsedValue)) {
            quotationAmountToSend = 0;
            console.log('Client Hook: Parsed string value was NaN, defaulted to 0');
          } else {
            quotationAmountToSend = parsedValue;
            console.log('Client Hook: Parsed string to number:', parsedValue);
          }
        }
      } else if (typeof quotationAmountToSend !== 'number') {
        // For other non-number types, convert carefully
        const numValue = Number(quotationAmountToSend);
        quotationAmountToSend = isNaN(numValue) ? 0 : numValue;
        console.log('Client Hook: Converted non-number to:', quotationAmountToSend);
      } else if (isNaN(quotationAmountToSend)) {
        // Handle NaN case for number type
        quotationAmountToSend = 0;
        console.log('Client Hook: Quotation amount was NaN, defaulted to 0');
      } else {
        // It's already a valid number, preserve it
        console.log('Client Hook: Quotation amount is a valid number, preserving value:', quotationAmountToSend);
      }
      
      // Create a clean data object for the API request with explicit quotationAmount field
      const dataToSend = {
        ...updatedClient,
        quotationAmount: quotationAmountToSend
      };
      
      console.log('Client Hook: Final data being sent to API:', {
        ...dataToSend,
        quotationFile: dataToSend.quotationFile ? '[File]' : null,
        quotationAmount: dataToSend.quotationAmount // Log specific field
      });
      
      const response = await fetch(`/api/clients/${updatedClient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        const errorMessage = result.error || 'Failed to update client';
        console.error('Client Hook: API error updating client:', errorMessage, result.details || '');
        throw new Error(errorMessage);
      }
      
      console.log('Client Hook: Client updated successfully');
      console.log('Client Hook: Updated client data:', result.data);
      console.log('Client Hook: Updated quotation amount:', result.data.quotationAmount, typeof result.data.quotationAmount);
      
      // Ensure we preserve the exact quotation amount
      const updatedData = {
        ...result.data,
        quotationAmount: result.data.quotationAmount
      };
      
      console.log('Client Hook: Final quotation amount:', updatedData.quotationAmount, typeof updatedData.quotationAmount);
      
      setClients((prevClients) =>
        prevClients.map((client) =>
          client._id === updatedClient._id ? updatedData : client
        )
      );
      
      setLoading(false);
      return updatedData;
    } catch (err) {
      console.error('Client Hook: Error updating client:', err);
      setError(err instanceof Error ? err.message : 'Failed to update client');
      setLoading(false);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      setLoading(true);
      console.log('Client Hook: Deleting client with ID:', clientId);
      
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        const errorMessage = result.error || 'Failed to delete client';
        console.error('Client Hook: API error deleting client:', errorMessage, result.details || '');
        throw new Error(errorMessage);
      }
      
      console.log('Client Hook: Client deleted successfully');
      setClients((prevClients) =>
        prevClients.filter((client) => client._id !== clientId)
      );
      
      setLoading(false);
    } catch (err) {
      console.error('Client Hook: Error deleting client:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      setLoading(false);
      throw err;
    }
  };

  const endSubscription = async (clientId: string) => {
    try {
      setLoading(true);
      console.log('Client Hook: Ending subscription for client with ID:', clientId);
      
      const response = await fetch(`/api/clients/${clientId}/end-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        const errorMessage = result.error || 'Failed to end subscription';
        console.error('Client Hook: API error ending subscription:', errorMessage, result.details || '');
        throw new Error(errorMessage);
      }
      
      console.log('Client Hook: Subscription ended successfully');
      setClients((prevClients) =>
        prevClients.map((client) =>
          client._id === clientId ? result.data : client
        )
      );
      
      setLoading(false);
      return result.data;
    } catch (err) {
      console.error('Client Hook: Error ending subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to end subscription');
      setLoading(false);
      throw err;
    }
  };

  const recordPayment = async (clientId: string, paymentDate?: string) => {
    try {
      setLoading(true);
      console.log('\n=== Starting Payment Recording ===');
      console.log('Client ID:', clientId);
      console.log('Payment Date:', paymentDate || new Date().toISOString().split('T')[0]);

      // Format the payment date to YYYY-MM-DD
      const formattedDate = paymentDate || new Date().toISOString().split('T')[0];

      const response = await fetch(`/api/clients/${clientId}/record-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentDate: formattedDate
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error('\nPayment Recording Failed:', {
          status: response.status,
          error: result.error,
          details: result.details
        });
        throw new Error(result.error || 'Failed to record payment');
      }

      console.log('\nPayment Recorded Successfully:', {
        payment: result.payment,
        client: result.client,
        totalIncome: result.statistics?.totalIncome
      });

      // Update the clients state with the new payment date
      setClients((prevClients) =>
        prevClients.map((client) =>
          client._id === clientId
            ? { ...client, lastPaymentDate: formattedDate }
            : client
        )
      );

      setLoading(false);
      return result.data;
    } catch (err) {
      console.error('\nError Recording Payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to record payment');
      setLoading(false);
      throw err;
    }
  };

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    endSubscription,
    recordPayment,
  };
};

export default useClients; 