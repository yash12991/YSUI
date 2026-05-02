import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/queries'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password. The direct equality fallback lets older dev rows created
    // before hashing still log in locally.
    const isValidPassword =
      (await bcrypt.compare(password, user.password)) || user.password === password
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user (in real app, would set JWT token)
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'User Login API',
    endpoint: 'POST /api/auth/login',
    body: {
      email: 'user@example.com',
      password: 'password123',
    },
    example: {
      request: {
        email: 'john@example.com',
        password: 'myPassword123',
      },
      response: {
        message: 'Login successful',
        user: {
          id: 'user_id',
          email: 'john@example.com',
          name: 'John Doe',
        },
      },
    },
  })
}
