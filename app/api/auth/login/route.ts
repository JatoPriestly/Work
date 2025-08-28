
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // In a real application, you should fetch user from a database
    // and compare hashed passwords.
    // For demonstration, we'll use environment variables.
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
      // In a real app, you'd generate a JWT here.
      // For simplicity, we'll return a success message.
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}
