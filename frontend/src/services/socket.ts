// In Demo Mode without backend, provide an in-memory reactive event bus
// that mimics Socket.IO client interface seamlessly.

type EventCallback = (data: any) => void;

class ReactiveSocketBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  public connected: boolean = true;
  public id: string = 'demo-socket-client';

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
    return this;
  }

  emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Socket event handler error for ${event}:`, err);
        }
      });
    }
    return this;
  }

  connect() {
    this.connected = true;
    return this;
  }

  disconnect() {
    this.connected = false;
    return this;
  }
}

const socketInstance = new ReactiveSocketBus();

export const getSocket = (): any => {
  return socketInstance;
};

export const emitSocketEvent = (event: string, data?: any) => {
  socketInstance.emit(event, data);
};
