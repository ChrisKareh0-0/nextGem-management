import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientPayment from '@/models/ClientPayment';

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

    const payments = await ClientPayment.find(query).sort({ date: -1 });
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
    const { clientName, amount, date, description, status } = body;

    if (!clientName || !amount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await ClientPayment.create({
      clientName,
      amount: parseFloat(amount),
      date: new Date(date),
      description: description || '',
      status: status || 'completed',
    });

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