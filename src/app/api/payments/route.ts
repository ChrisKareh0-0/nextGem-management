import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const query = clientId ? { clientId } : {};
    const payments = await Payment.find(query).sort({ date: -1 });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const payment = await Payment.create(data);
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
} 