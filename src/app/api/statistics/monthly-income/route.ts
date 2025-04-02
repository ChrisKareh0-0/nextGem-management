import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Client from '@/models/Client';
import Payment from '@/models/Payment';
import Expense from '@/models/Expense';
import MonthlyIncome from '@/models/MonthlyIncome';
import Statistics from '@/models/Statistics';

interface FormattedMonthlyIncomeRecord {
  _id: string;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface IPayment {
  _id: ObjectId;
  amount: number;
  date: Date;
  status: string;
}

interface IClient {
  _id: ObjectId;
  quotationAmount?: number;
  subscriptionDate: string;
}

interface IExpense {
  _id: ObjectId;
  amount: number;
  date: Date;
}

interface IMonthlyIncome {
  _id: ObjectId;
  year: number;
  month: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Parse the selected year and month, or use current date
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Get total income from Statistics collection
    const statistics = await Statistics.findOne({});
    const totalIncome = statistics?.totalIncome || 0;

    // Get all completed payments for monthly calculations
    const payments = await Payment.find({ status: 'completed' }) as IPayment[];
    const expenses = await Expense.find({}) as IExpense[];

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Calculate monthly income (payments in selected month)
    const monthlyIncome = payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.date);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;
      
      if (paymentYear === selectedYear && paymentMonth === selectedMonth) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate monthly expenses (expenses in selected month)
    const monthlyExpenses = expenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth() + 1;
      
      if (expenseYear === selectedYear && expenseMonth === selectedMonth) {
        return sum + (expense.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate differences
    const difference = totalIncome - totalExpenses;
    const monthlyDifference = monthlyIncome - monthlyExpenses;

    // Get or create monthly income record for the selected month
    let monthlyIncomeRecord = await MonthlyIncome.findOne({
      year: selectedYear,
      month: selectedMonth
    });

    if (!monthlyIncomeRecord) {
      monthlyIncomeRecord = await MonthlyIncome.create({
        year: selectedYear,
        month: selectedMonth,
        amount: monthlyIncome
      });
    } else {
      monthlyIncomeRecord.amount = monthlyIncome;
      await monthlyIncomeRecord.save();
    }

    // Get all monthly income records for the selected year
    const monthlyIncomeRecords = await MonthlyIncome.find({
      year: selectedYear
    }).sort({ month: -1 });

    // Format the monthly income records
    const formattedMonthlyIncome = monthlyIncomeRecords.map((record): FormattedMonthlyIncomeRecord => ({
      _id: record._id.toString(),
      year: record.year,
      month: record.month,
      amount: record.amount,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }));

    // Log the calculations for debugging
    console.log('Statistics Calculation:', {
      selectedYear,
      selectedMonth,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      difference,
      monthlyDifference,
      paymentCount: payments.length,
      expenseCount: expenses.length
    });

    return NextResponse.json({
      success: true,
      data: {
        monthlyIncome: formattedMonthlyIncome,
        totalIncome,
        totalExpenses,
        monthlyIncomeAmount: monthlyIncome,
        monthlyExpenses,
        difference,
        monthlyDifference,
        selectedMonth,
        selectedYear
      }
    });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 