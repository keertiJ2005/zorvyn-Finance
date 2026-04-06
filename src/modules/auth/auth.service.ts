import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { JwtPayload, Role } from '../../types';
import { ConflictError, UnauthorizedError, InternalServerError } from '../../utils/errors.util';
import { RegisterInput, LoginInput } from '../../validators/user.validator';

// 12 is slow enough to be safe but fast enough not to bottleneck logins
const SALT_ROUNDS = 12;

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // this is kinda heavy, might want to offload if we get crazy traffic
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        // defaulting to VIEWER so no one gets admin by accident
        role: data.role || Role.VIEWER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // throwing generic error so we dont leak which emails exist
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedError('Account is deactivated. Contact an administrator.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    // pulling password out before sending to client. destructuring is weird but it works
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  private static generateToken(payload: JwtPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // TODO: build pipeline should honestly catch this before it even deploys
      throw new InternalServerError('JWT_SECRET is not configured');
    }

    const tokenPayload = { ...payload };

    return jwt.sign(tokenPayload, secret, {
      expiresIn: '24h' as const, // leaving at 24h as requested
    } as jwt.SignOptions);
  }
}
