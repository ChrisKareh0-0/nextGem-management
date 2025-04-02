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

    // Update total income in statistics collection (only for completed payments)
    try {
      console.log('\n=== Starting Statistics Update ===');
      console.log('Payment Details:', {
        amount: payment.amount,
        date: payment.date,
        status: payment.status
      });

      // First, try to find existing statistics
      let statistics = await Statistics.findOne({});
      console.log('\nCurrent Statistics:', {
        exists: !!statistics,
        currentTotal: statistics?.totalIncome || 0,
        paymentToAdd: payment.amount
      });
      
      if (!statistics) {
        // If no statistics exist, create a new one
        console.log('\nCreating new statistics record...');
        statistics = await Statistics.create({
          totalIncome: payment.amount
        });
        console.log('New Statistics Created:', {
          totalIncome: statistics.totalIncome,
          createdAt: statistics.createdAt
        });
      } else {
        // Update existing statistics
        const previousTotal = statistics.totalIncome || 0;
        statistics.totalIncome = previousTotal + payment.amount;
        await statistics.save();
        console.log('\nUpdated Statistics:', {
          previousTotal,
          paymentAdded: payment.amount,
          newTotal: statistics.totalIncome
        });
      }
      
      // Verify the update
      const verifiedStats = await Statistics.findOne({});
      console.log('\nVerification:', {
        finalTotal: verifiedStats?.totalIncome,
        paymentCount: await Payment.countDocuments({ status: 'completed' })
      });

      // Double-check the total matches all completed payments
      const allPayments = await Payment.find({ status: 'completed' });
      const calculatedTotal = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      console.log('\nPayment Verification:', {
        calculatedTotal,
        statisticsTotal: verifiedStats?.totalIncome,
        paymentCount: allPayments.length,
        payments: allPayments.map(p => ({
          amount: p.amount,
          date: p.date
        }))
      });
      console.log('=== Statistics Update Complete ===\n');
    } catch (statsError) {
      console.error('\nError updating statistics:', statsError);
      // Continue with the rest of the function even if statistics update fails
    }

    // Update client's payment due date and last payment date
    client.paymentDueDate = {
      day: nextPaymentDate.getDate(),
      month: nextPaymentDate.getMonth() + 1
    };
    client.lastPaymentDate = paymentDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD string
    await client.save();

    // Get the final statistics after all updates
    const finalStatistics = await Statistics.findOne({});

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payment,
      client,
      statistics: finalStatistics
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to record payment",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 