import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // If no month/year provided, use current month/year
    const today = new Date();
    const selectedMonth = month ? parseInt(month) : today.getMonth() + 1; // 1-12
    const selectedYear = year ? parseInt(year) : today.getFullYear();

    // Create date range for the selected month
    const startDate = new Date(selectedYear, selectedMonth - 1, 1); // Month is 0-based in Date constructor
    const endDate = new Date(selectedYear, selectedMonth, 0); // Last day of selected month

    console.log('Fetching monthly income for:', {
      month: selectedMonth,
      year: selectedYear,
      startDate,
      endDate
    });

    // Find all completed payments within the date range
    const payments = await Payment.find({
      status: 'completed',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate total income for the month
    const monthlyTotal = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    console.log('Monthly income calculation:', {
      numberOfPayments: payments.length,
      total: monthlyTotal
    });

    return NextResponse.json({
      success: true,
      data: {
        month: selectedMonth,
        year: selectedYear,
        totalIncome: monthlyTotal,
        paymentCount: payments.length
      }
    });
  } catch (error) {
    console.error('Error calculating monthly income:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate monthly income',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 