import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '@/lib/auth';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    name: string | null;
    profileImage: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.email },
        { username: input.username },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new Error('Email already registered');
    }
    if (existingUser.username === input.username) {
      throw new Error('Username already taken');
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      name: input.name,
      passwordHash,
    },
  });

  // Create default preferences
  await prisma.userPreference.create({
    data: {
      userId: user.id,
    },
  });

  // Generate tokens
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Save session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Save session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      profileImage: true,
      emailVerified: true,
      createdAt: true,
      preferences: true,
    },
  });

  return user;
}

/**
 * Logout user (invalidate session)
 */
export async function logout(userId: string, token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      token,
    },
  });
}
