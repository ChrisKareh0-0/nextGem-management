import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Payment from '@/models/Payment';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const clientId = params.id;

    // Validate client ID
    if (!ObjectId.isValid(clientId)) {
      console.error('Invalid client ID:', clientId);
      return NextResponse.json(
        { success: false, error: 'Invalid client ID' },
        { status: 400 }
      );
    }

    // Fetch payment records for the client using the Payment model
    const payments = await Payment.find({ clientId: new ObjectId(clientId) })
      .sort({ date: -1 });

    console.log('Found payments:', payments);

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payment records:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 