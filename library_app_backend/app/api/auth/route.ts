import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Authentication removed - no token verification needed
    return NextResponse.json({ 
      success: true,
      message: 'Authentication disabled - endpoint now public'
    });
  } catch (error) {
    console.error('Endpoint error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}