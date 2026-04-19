import { Injectable, effect, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private ws: WebSocket | null = null;
  
  public onlineUsers = signal<Set<number>>(new Set());

  constructor(private authService: AuthService) {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && document.visibilityState === 'visible') {
        this.connect();
      } else {
        this.disconnect();
      }
    });

    // Instantly go offline when closing the tab/window
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });

    // Instantly go offline when switching tabs, and online when coming back
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (this.authService.currentUser()) this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private connect() {
    if (this.ws) return;

    const token = this.authService.getToken();
    if (!token) return;

    // Convert http://... to ws://...
    const wsBase = environment.apiUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws/presence?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'init':
            this.onlineUsers.set(new Set(data.activeUserIds));
            break;
          case 'online':
            this.onlineUsers.update(set => {
              const newSet = new Set(set);
              newSet.add(data.userId);
              return newSet;
            });
            break;
          case 'offline':
            this.onlineUsers.update(set => {
              const newSet = new Set(set);
              newSet.delete(data.userId);
              return newSet;
            });
            break;
        }
      } catch (e) {
        console.error('Failed to parse presence message:', e);
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.onlineUsers.set(new Set());
      
      // Auto-reconnect if still logged in
      setTimeout(() => {
        if (this.authService.currentUser()) {
           this.connect();
        }
      }, 5000);
    };

    this.ws.onerror = (err) => {
       console.error('Presence WS error:', err);
       this.ws?.close();
    };
  }

  private disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onlineUsers.set(new Set());
  }
}
