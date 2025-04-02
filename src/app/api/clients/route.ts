import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientModel from '@/models/Client';

// GET handler to retrieve all clients
export async function GET() {
  try {
    console.log('API: Attempting to connect to MongoDB...');
    const { db } = await dbConnect();
    console.log('API: Connected to MongoDB, fetching clients...');
    
    // Use lean() for better performance
    const clients = await ClientModel.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
      
    console.log(`API: Successfully retrieved ${clients.length} clients`);
    
    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error('API Error fetching clients:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error fetching clients';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error('API Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}

// POST handler to create a new client
export async function POST(request: Request) {
  try {
    // Use let instead of const so we can modify it
    let clientData = await request.json();
    
    // Log the complete client data
    console.log('API: Received client data for creation:', {
      ...clientData,
      quotationFile: clientData.quotationFile ? '[File]' : null,
    });
    
    // CRITICAL FIX: Always ensure quotationAmount field exists
    if (clientData.quotationAmount === undefined || clientData.quotationAmount === null) {
      console.log('API: quotationAmount field is missing in request, adding it with default value 0');
      clientData.quotationAmount = 0;
    }
    
    // Log specifically the quotation amount
    console.log('API: Quotation amount received:', clientData.quotationAmount, typeof clientData.quotationAmount);
    
    // Make sure we're not trying to use a specific _id for a new client
    // This prevents MongoDB duplicate key errors
    if ('_id' in clientData) {
      console.log('API: Removing _id from client data to prevent duplicate key errors');
      const { _id, ...clientWithoutId } = clientData;
      clientData = clientWithoutId;
    }
    
    // CRITICAL FIX FOR CREATION: Process the quotationAmount to ensure it's a valid number
    if (typeof clientData.quotationAmount === 'string') {
      // Process string values carefully to preserve decimals
      const trimmedValue = clientData.quotationAmount.trim();
      if (trimmedValue === '') {
        clientData.quotationAmount = 0;
        console.log('API: quotationAmount was empty string, defaulted to 0');
      } else {
        // Use parseFloat to better handle decimal values
        const parsedValue = parseFloat(trimmedValue);
        if (isNaN(parsedValue)) {
          clientData.quotationAmount = 0;
          console.log('API: quotationAmount string value was NaN, defaulted to 0');
        } else {
          clientData.quotationAmount = parsedValue;
          console.log(`API: Parsed quotationAmount string "${trimmedValue}" to number:`, parsedValue);
        }
      }
    } else if (typeof clientData.quotationAmount !== 'number') {
      // Handle other non-number types
      const numValue = Number(clientData.quotationAmount);
      clientData.quotationAmount = isNaN(numValue) ? 0 : numValue;
      console.log(`API: Converted non-number quotationAmount to:`, clientData.quotationAmount);
    } else {
      // It's already a number, just make sure it's not NaN
      if (isNaN(clientData.quotationAmount)) {
        clientData.quotationAmount = 0;
        console.log('API: quotationAmount was NaN, defaulted to 0');
      } else {
        console.log(`API: quotationAmount is a valid number:`, clientData.quotationAmount);
      }
    }
    
    await dbConnect();
    
    console.log('API: Creating client with final data:', {
      ...clientData,
      quotationFile: clientData.quotationFile ? '[File]' : null
    });
    console.log('API: Final quotation amount for creation:', clientData.quotationAmount, typeof clientData.quotationAmount);
    
    // CRITICAL: Explicitly set the quotationAmount field to ensure it's included
    const finalData = {
      ...clientData,
      // Force to number one more time as a safety check
      quotationAmount: typeof clientData.quotationAmount === 'number' ? 
                       clientData.quotationAmount : 
                       (Number(clientData.quotationAmount) || 0)
    };
    
    const client = await ClientModel.create(finalData);
    console.log('API: Client created successfully with ID:', client._id);
    console.log('API: Created client data:', client);
    console.log('API: Saved quotation amount:', client.quotationAmount, typeof client.quotationAmount);
    
    // Verify the saved data
    const verifiedClient = await ClientModel.findById(client._id);
    console.log('API: Verified quotation amount from fresh fetch:', 
      verifiedClient?.quotationAmount, 
      typeof verifiedClient?.quotationAmount);
    
    // If verification shows an issue, log a warning
    if (verifiedClient && verifiedClient.quotationAmount !== finalData.quotationAmount) {
      console.warn('API WARNING: Saved quotationAmount does not match the value we tried to save!');
      console.warn(`Expected: ${finalData.quotationAmount}, Got: ${verifiedClient.quotationAmount}`);
    }
    
    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    console.error('API Error creating client:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error creating client';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
} 