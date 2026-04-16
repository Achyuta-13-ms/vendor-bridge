import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorId, platformName = 'swiggy' } = body;

    if (!vendorId) {
      return NextResponse.json({ success: false, message: 'vendorId is required' }, { status: 400 });
    }

    const externalOrderId = `${platformName.toUpperCase()}-${Math.floor(Math.random() * 1000000)}`;
    
    // Determine the base URL for the bridge API
    // In local dev, we can just use the absolute path if calling via axios, 
    // or just construct the payload and call the logic if it were a function.
    // For this demonstration, we'll try to reach the local endpoint.
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host');
    const bridgeUrl = `${protocol}://${host}/api/bridge/orders`;

    const mockPayload = {
      platformName,
      externalOrderId,
      vendorId,
      specialInstructions: "Please pack properly for delivery.",
      customer: {
        name: "Mock Customer",
        phone: "+911234567890",
        address: "Lane 4, High Street, Mumbai"
      },
      items: [
        { name: "Paneer Tikka", quantity: 1, price: 320 },
        { name: "Butter Naan", quantity: 2, price: 45 },
        { name: "Coke 500ml", quantity: 1, price: 60 }
      ],
      totals: {
        subtotal: 470,
        tax: 23.5,
        deliveryFee: 30,
        total: 523.5
      }
    };

    const res = await axios.post(bridgeUrl, mockPayload);

    return NextResponse.json({ 
      success: true, 
      message: 'Mock order generated', 
      bridgedResponse: res.data 
    });

  } catch (error: any) {
    console.error('[POST /api/test/incoming-order]', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate mock order', 
      error: error.response?.data || error.message 
    }, { status: 500 });
  }
}
