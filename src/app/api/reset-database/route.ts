import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST() {
  try {
    await connectDB();
    
    // Get all collections
    const collections = await mongoose.connection.db?.collections() || [];
    
    // Delete all documents from each collection
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    return NextResponse.json({
      success: true,
      message: "Database reset successfully",
    });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset database",
      },
      { status: 500 }
    );
  }
} 