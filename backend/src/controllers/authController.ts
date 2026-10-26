import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'kumbh_rakshak_secure_jwt_token_key_2026_authority_auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or account inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role.name as any,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        performedBy: user.email,
        userId: user.id,
        details: JSON.stringify({ ip: req.ip, role: user.role.name }),
      },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        roleLabel: user.role.label,
        department: user.department,
        permissions: JSON.parse(user.role.permissions || '[]'),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        roleLabel: user.role.label,
        department: user.department,
        permissions: JSON.parse(user.role.permissions || '[]'),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDemoAccounts = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            department: true,
          },
        },
      },
    });

    return res.json({
      defaultPassword: 'Kumbh@123',
      roles: roles.map((r) => ({
        role: r.name,
        label: r.label,
        description: r.description,
        user: r.users[0] || null,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
