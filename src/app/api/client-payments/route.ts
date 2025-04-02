import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientPayment from '@/models/ClientPayment';
import Client from '@/models/Client';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = {};
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
    }

    console.log('Fetching client payments with query:', JSON.stringify(query, null, 2));
    const payments = await ClientPayment.find(query).sort({ date: -1 });
    console.log('Found payments:', JSON.stringify(payments, null, 2));
    
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching client payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    console.log('Received payment request body:', body);
    const { clientName, amount, date, description, status, clientId } = body;

    // If clientId is provided, this is a payment from the clients page
    if (clientId) {
      console.log('Creating payment from client ID:', clientId);
      
      // Fetch client details directly from the database
      const client = await Client.findById(clientId);
      console.log('Found client:', client);
      
      if (!client) {
        console.error('Client not found for ID:', clientId);
        throw new Error('Client not found');
      }

      // Create payment record
      const paymentData = {
        clientName: client.companyName,
        amount: client.quotationAmount,
        date: new Date(date),
        description: `Payment for ${client.companyName}`,
        status: 'completed',
      };
      console.log('Creating payment with data:', paymentData);
      
      const payment = await ClientPayment.create(paymentData);
      console.log('Created payment:', payment);

      return NextResponse.json(payment, { status: 201 });
    }

    // Regular payment creation
    if (!clientName || !amount || !date) {
      console.error('Missing required fields:', { clientName, amount, date });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentData = {
      clientName,
      amount: parseFloat(amount),
      date: new Date(date),
      description: description || '',
      status: status || 'completed',
    };
    console.log('Creating regular payment with data:', paymentData);
    
    const payment = await ClientPayment.create(paymentData);
    console.log('Created payment:', payment);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating client payment:', error);
    return NextResponse.json(
      { error: 'Failed to create client payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { _id, clientName, amount, date, description, status } = body;

    if (!_id || !clientName || !amount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await ClientPayment.findByIdAndUpdate(
      _id,
      {
        clientName,
        amount: parseFloat(amount),
        date: new Date(date),
        description: description || '',
        status: status || 'completed',
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating client payment:', error);
    return NextResponse.json(
      { error: 'Failed to update client payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const payment = await ClientPayment.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting client payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete client payment' },
      { status: 500 }
    );
  }
} 