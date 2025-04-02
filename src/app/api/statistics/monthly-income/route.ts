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

    // Build query based on provided parameters
    const query: any = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);

    // Get total income from statistics collection
    const statistics = await Statistics.findOne({});
    const totalIncome = statistics?.totalIncome || 0;

    // Get all client quotations
    const clients = await Client.find({}) as IClient[];
    const totalClientQuotations = clients.reduce((sum: number, client) => sum + (client.quotationAmount || 0), 0);

    // Get all payments
    const payments = await Payment.find({}) as IPayment[];
    const totalPayments = payments.reduce((sum: number, payment) => sum + (payment.amount || 0), 0);

    // Get all expenses
    const expenses = await Expense.find({}) as IExpense[];
    const totalExpenses = expenses.reduce((sum: number, expense) => sum + (expense.amount || 0), 0);

    // Calculate monthly statistics
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    console.log('Current Date:', {
      now: now.toISOString(),
      currentYear,
      currentMonth,
      localDate: now.toLocaleDateString(),
      localTime: now.toLocaleTimeString()
    });

    // Get monthly payments
    const monthlyPayments = payments.reduce((sum: number, payment: IPayment) => {
      const paymentDate = new Date(payment.date);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;
      
      console.log('Payment Date:', {
        paymentId: payment._id,
        paymentDate: paymentDate.toISOString(),
        paymentYear,
        paymentMonth,
        amount: payment.amount
      });
      
      if (paymentYear === currentYear && paymentMonth === currentMonth) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    // Get monthly client quotations
    const monthlyClientQuotations = clients.reduce((sum: number, client: IClient) => {
      const subscriptionDate = new Date(client.subscriptionDate);
      const subscriptionYear = subscriptionDate.getFullYear();
      const subscriptionMonth = subscriptionDate.getMonth() + 1;
      
      console.log('Subscription Date:', {
        clientId: client._id,
        subscriptionDate: subscriptionDate.toISOString(),
        subscriptionYear,
        subscriptionMonth,
        amount: client.quotationAmount
      });
      
      if (subscriptionYear === currentYear && subscriptionMonth === currentMonth) {
        return sum + (client.quotationAmount || 0);
      }
      return sum;
    }, 0);

    // Get monthly expenses
    const monthlyExpenses = expenses.reduce((sum: number, expense: IExpense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth() + 1;
      
      console.log('Expense Date:', {
        expenseId: expense._id,
        expenseDate: expenseDate.toISOString(),
        expenseYear,
        expenseMonth,
        amount: expense.amount
      });
      
      if (expenseYear === currentYear && expenseMonth === currentMonth) {
        return sum + (expense.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate differences
    const difference = totalIncome - totalExpenses;
    const monthlyDifference = monthlyPayments - monthlyExpenses;

    // Fetch monthly income records
    const monthlyIncome = await MonthlyIncome.find(query)
      .sort({ year: -1, month: -1 }) as IMonthlyIncome[];

    console.log('Monthly Income Records:', monthlyIncome.map((record: IMonthlyIncome) => ({
      year: record.year,
      month: record.month,
      amount: record.amount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    })));

    // Format the response data
    const formattedMonthlyIncome = monthlyIncome.map((record: IMonthlyIncome): FormattedMonthlyIncomeRecord => ({
      _id: record._id.toString(),
      year: record.year,
      month: record.month,
      amount: record.amount,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }));

    // If no records found for current month, create a placeholder
    const hasCurrentMonth = formattedMonthlyIncome.some(
      (record: FormattedMonthlyIncomeRecord) => record.year === currentYear && record.month === currentMonth
    );

    if (!hasCurrentMonth) {
      formattedMonthlyIncome.unshift({
        _id: new ObjectId().toString(),
        year: currentYear,
        month: currentMonth,
        amount: monthlyPayments, // Set amount to current month's payments
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        monthlyIncome: formattedMonthlyIncome,
        totalIncome,
        totalPayments,
        totalClientQuotations,
        totalExpenses,
        monthlyPayments,
        monthlyClientQuotations,
        monthlyExpenses,
        difference,
        monthlyDifference,
        selectedMonth: currentMonth,
        selectedYear: currentYear
      }
    });
  } catch (error) {
    console.error('Error fetching monthly income:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch monthly income',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 