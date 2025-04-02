import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Payment from '@/models/Payment';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const clientId = params.id;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment ID is required",
        },
        { status: 400 }
      );
    }

    // Delete the payment record
    const deletedPayment = await Payment.findOneAndDelete({
      _id: paymentId,
      clientId: clientId,
    });

    if (!deletedPayment) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete client payment",
      },
      { status: 500 }
    );
  }
} 