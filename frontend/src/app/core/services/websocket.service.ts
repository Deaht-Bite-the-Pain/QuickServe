import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;

  connect(onConnected?: () => void): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        if (onConnected) onConnected();
      }
    });
    this.client.activate();
  }

  subscribe(topic: string, callback: (msg: IMessage) => void): void {
    if (!this.client?.connected) return;
    this.client.subscribe(topic, callback);
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }

  get connected(): boolean {
    return this.client?.connected ?? false;
  }
}
