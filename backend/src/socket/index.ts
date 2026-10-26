import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('subscribe:zone', (zoneId: string) => {
      socket.join(`zone:${zoneId}`);
      console.log(`[Socket.IO] Socket ${socket.id} subscribed to zone:${zoneId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized!');
  }
  return ioInstance;
};

// Strongly typed event emitters
export const emitSocketEvent = {
  crowdUpdate: (data: any) => {
    if (ioInstance) ioInstance.emit('crowd:update', data);
  },
  riskUpdate: (data: any) => {
    if (ioInstance) ioInstance.emit('risk:update', data);
  },
  alertNew: (alert: any) => {
    if (ioInstance) ioInstance.emit('alert:new', alert);
  },
  alertUpdated: (alert: any) => {
    if (ioInstance) ioInstance.emit('alert:updated', alert);
  },
  incidentNew: (incident: any) => {
    if (ioInstance) ioInstance.emit('incident:new', incident);
  },
  incidentUpdated: (incident: any) => {
    if (ioInstance) ioInstance.emit('incident:updated', incident);
  },
  notificationNew: (notification: any) => {
    if (ioInstance) ioInstance.emit('notification:new', notification);
  },
  teamLocationUpdate: (teamData: any) => {
    if (ioInstance) ioInstance.emit('team:location:update', teamData);
  },
  weatherUpdate: (weatherData: any) => {
    if (ioInstance) ioInstance.emit('weather:update', weatherData);
  },
  simulationEvent: (eventData: any) => {
    if (ioInstance) ioInstance.emit('simulation:event', eventData);
  },
};
