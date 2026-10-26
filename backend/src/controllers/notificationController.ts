import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitSocketEvent } from '../socket';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { unreadOnly, role } = req.query;
    const where: any = {};
    if (unreadOnly === 'true') where.isRead = false;
    if (role && role !== 'ALL') {
      where.OR = [{ recipientRole: 'ALL' }, { recipientRole: role as string }];
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const broadcastNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, category, severity, recipientRole } = req.body;

    const notif = await prisma.notification.create({
      data: {
        title,
        message,
        category: category || 'Public Announcement',
        severity: severity || 'INFO',
        recipientRole: recipientRole || 'ALL',
      },
    });

    emitSocketEvent.notificationNew(notif);

    return res.status(201).json(notif);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
