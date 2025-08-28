import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // In a real application, you might want to create a session token here
    // and send it back to the client, rather than sending the raw user object.
    // For this example, we'll send back a simplified user object.
    return NextResponse.json({ uid: user.uid, email: user.email }, { status: 200 })
  } catch (error: any) {
    console.error('Firebase authentication error:', error.message)
    return NextResponse.json({ message: error.message }, { status: 401 })
  }
}
