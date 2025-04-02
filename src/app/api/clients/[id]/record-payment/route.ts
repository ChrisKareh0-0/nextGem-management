import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Client from '@/models/Client';
import Payment from '@/models/Payment';
import MonthlyIncome from '@/models/MonthlyIncome';
import Statistics from '@/models/Statistics';

// POST handler to record a payment for a client
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const clientId = params.id;
    const { paymentDate } = await request.json();

    console.log('Received payment request:', {
      clientId,
      paymentDate,
      params
    });

    // Validate client ID
    if (!ObjectId.isValid(clientId)) {
      console.error('Invalid client ID:', clientId);
      return NextResponse.json(
        { success: false, error: 'Invalid client ID' },
        { status: 400 }
      );
    }

    // Validate payment date
    if (!paymentDate) {
      console.error('Missing payment date');
      return NextResponse.json(
        { success: false, error: 'Payment date is required' },
        { status: 400 }
      );
    }

    // Get client details to get the quotation amount
    const client = await Client.findById(clientId);
    console.log('Found client:', client);

    if (!client) {
      console.error('Client not found:', clientId);
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Parse the payment date and set it to the start of the day in local timezone
    const paymentDateObj = new Date(paymentDate);
    if (isNaN(paymentDateObj.getTime())) {
      console.error('Invalid payment date format:', paymentDate);
      return NextResponse.json(
        { success: false, error: 'Invalid payment date format' },
        { status: 400 }
      );
    }

    paymentDateObj.setHours(0, 0, 0, 0);

    // Get the year and month from the payment date
    const year = paymentDateObj.getFullYear();
    const month = paymentDateObj.getMonth() + 1;

    console.log('Processing payment:', {
      clientId,
      paymentDate: paymentDateObj.toISOString(),
      year,
      month,
      amount: client.quotationAmount
    });

    // Create new payment record
    const payment = await Payment.create({
      clientId: new ObjectId(clientId),
      amount: client.quotationAmount,
      date: paymentDateObj,
      status: 'completed'
    });

    console.log('Created payment record:', payment);

    // Update client's payment due date to next month
    const nextPaymentDate = new Date(paymentDateObj);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // First, check if a monthly income record exists for this month
    const existingMonthlyIncome = await MonthlyIncome.findOne({
      year,
      month
    });

    console.log('Existing monthly income:', existingMonthlyIncome);

    if (existingMonthlyIncome) {
      // Update existing monthly income record
      existingMonthlyIncome.amount += client.quotationAmount;
      await existingMonthlyIncome.save();
      console.log('Updated monthly income:', existingMonthlyIncome);
    } else {
      // Create new monthly income record
      const newMonthlyIncome = await MonthlyIncome.create({
        year,
        month,
        amount: client.quotationAmount
      });
      console.log('Created new monthly income:', newMonthlyIncome);
    }

    // Update total income in statistics collection
    const statistics = await Statistics.findOne({});
    if (statistics) {
      statistics.totalIncome += client.quotationAmount;
      await statistics.save();
      console.log('Updated statistics:', statistics);
    } else {
      const newStatistics = await Statistics.create({
        totalIncome: client.quotationAmount
      });
      console.log('Created new statistics:', newStatistics);
    }

    // Update client's payment due date and last payment date
    client.paymentDueDate = {
      day: nextPaymentDate.getDate(),
      month: nextPaymentDate.getMonth() + 1
    };
    client.lastPaymentDate = paymentDateObj;
    await client.save();
    console.log('Updated client:', client);

    return NextResponse.json({
      success: true,
      data: {
        _id: payment._id,
        clientId: payment.clientId.toString(),
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 