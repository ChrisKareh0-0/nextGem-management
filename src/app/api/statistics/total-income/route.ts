import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Statistics from '@/models/Statistics';

export async function GET() {
  try {
    await dbConnect();
    
    // Get total income from Statistics collection
    const statistics = await Statistics.findOne({});
    const totalIncome = statistics?.totalIncome || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalIncome
      }
    });
  } catch (error) {
    console.error('Error fetching total income:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch total income',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 