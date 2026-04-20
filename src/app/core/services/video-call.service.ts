import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';

export type CallState = 'idle' | 'permission-prompt' | 'calling' | 'incoming' | 'connecting' | 'connected' | 'ended';

export interface IncomingCallData {
  callerName: string;
  callerPicture: string;
  callerPeerId: string;
  callerId: number;
}

@Injectable({ providedIn: 'root' })
export class VideoCallService {
  private auth = inject(AuthService);

  // Signals for UI binding
  callState   = signal<CallState>('idle');
  localStream = signal<MediaStream | null>(null);
  remoteStream = signal<MediaStream | null>(null);
  isMuted     = signal(false);
  isCameraOff = signal(false);
  isChatOpen  = signal(false);
  isLocalTalking = signal(false);
  isRemoteTalking = signal(false);
  incomingCall = signal<IncomingCallData | null>(null);
  callDuration = signal(0);
  errorMessage = signal<string | null>(null);

  private audioContext: AudioContext | null = null;
  private localAnalyserTimer: any = null;
  private remoteAnalyserTimer: any = null;

  private ws: WebSocket | null = null;
  private peer: Peer | null = null;
  private mediaConnection: MediaConnection | null = null;
  bookingId = signal<number>(0);
  private durationTimer: any = null;

  /**
   * Connect to the video signaling WebSocket for a booking
   */
  connectSignaling(bookingId: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.bookingId.set(bookingId);
    const token = this.auth.getToken();
    const wsBase = environment.apiUrl.replace('http', 'ws');
    const url = `${wsBase}/ws/video?token=${token}&bookingId=${bookingId}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[VideoCall] Signaling connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleSignal(data);
    };

    this.ws.onclose = () => {
      console.log('[VideoCall] Signaling disconnected');
    };

    this.ws.onerror = () => {
      console.error('[VideoCall] Signaling error');
    };
  }

  /**
   * Disconnect from the signaling WebSocket
   */
  disconnectSignaling(): void {
    this.ws?.close();
    this.ws = null;
  }

  /**
   * Check permissions and either skip the prompt or show it
   */
  async showPermissionPrompt(): Promise<void> {
    this.errorMessage.set(null);

    // Check if permissions are already granted
    try {
      const [cam, mic] = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
      ]);

      if (cam.state === 'granted' && mic.state === 'granted') {
        // Already have permissions — skip the modal, go straight to call
        await this.confirmCall();
        return;
      }
    } catch {
      // permissions.query not supported in all browsers — fall through to show prompt
    }

    // Show the permission prompt modal
    this.callState.set('permission-prompt');
  }

  /**
   * User confirmed — request media and initiate the call
   */
  async confirmCall(): Promise<void> {
    try {
      this.errorMessage.set(null);
      this.callState.set('calling');

      const stream = await this.acquireMedia();
      this.localStream.set(stream);
      this.monitorAudioLevel(stream, true);

      this.peer = this.createPeer();
      this.peer.on('open', (peerId) => {
        this.sendSignal({ type: 'call:initiate', peerId });
      });

      this.peer.on('call', (call) => {
        call.answer(stream);
        this.setupMediaConnection(call);
      });

    } catch (err: any) {
      console.error('[VideoCall] Failed to get media:', err);
      this.errorMessage.set(err.message || 'Failed to start video call.');
      this.callState.set('idle');
      setTimeout(() => this.errorMessage.set(null), 6000);
    }
  }

  /**
   * Cancel the permission prompt
   */
  cancelCall(): void {
    this.callState.set('idle');
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(): Promise<void> {
    const incoming = this.incomingCall();
    if (!incoming) return;

    try {
      this.errorMessage.set(null);
      this.callState.set('connecting');

      const stream = await this.acquireMedia();
      this.localStream.set(stream);
      this.monitorAudioLevel(stream, true);

      this.peer = this.createPeer();
      this.peer.on('open', (peerId) => {
        this.sendSignal({ type: 'call:accept', peerId });

        // Call the initiator
        const call = this.peer!.call(incoming.callerPeerId, stream);
        this.setupMediaConnection(call);
      });

      this.incomingCall.set(null);

    } catch (err: any) {
      console.error('[VideoCall] Failed to get media:', err);
      this.errorMessage.set(err.message || 'Failed to join video call.');
      this.callState.set('idle');
      this.incomingCall.set(null);
      setTimeout(() => this.errorMessage.set(null), 6000);
    }
  }

  /**
   * Reject an incoming call
   */
  rejectCall(): void {
    this.sendSignal({ type: 'call:reject' });
    this.incomingCall.set(null);
    this.callState.set('idle');
  }

  /**
   * End the current call
   */
  endCall(): void {
    this.sendSignal({ type: 'call:end' });
    this.cleanup();
  }

  /**
   * Toggle microphone mute
   */
  toggleMute(): void {
    const stream = this.localStream();
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted.set(!audioTrack.enabled);
    }
  }

  /**
   * Toggle camera on/off
   */
  toggleCamera(): void {
    const stream = this.localStream();
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isCameraOff.set(!videoTrack.enabled);
    }
  }

  // ── Private Methods ──────────────────────────────

  private monitorAudioLevel(stream: MediaStream, isLocal: boolean): void {
    if (!stream.getAudioTracks().length) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      
      // CRITICAL FIX: Clone the stream before connecting to Web Audio API!
      // Otherwise Safari/Chrome will violently mute the actual <video> element playback!
      const clonedStream = stream.clone();
      
      const source = this.audioContext.createMediaStreamSource(clonedStream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const isTalking = average > 15; // Threshold for speaking

        if (isLocal && !this.isMuted()) {
          this.isLocalTalking.set(isTalking);
        } else if (!isLocal) {
          this.isRemoteTalking.set(isTalking);
        }
      };

      if (isLocal && this.localAnalyserTimer) {
        clearInterval(this.localAnalyserTimer);
      } else if (!isLocal && this.remoteAnalyserTimer) {
        clearInterval(this.remoteAnalyserTimer);
      }

      const timer = setInterval(checkLevel, 100);
      if (isLocal) {
        this.localAnalyserTimer = timer;
      } else {
        this.remoteAnalyserTimer = timer;
      }
    } catch (e) {
      console.warn('[VideoCall] Audio context error:', e);
    }
  }

  /**
   * Smart media acquisition — enumerates devices first, then requests
   * whatever is available. Falls back progressively.
   */
  private async acquireMedia(): Promise<MediaStream> {
    // Aggressively request both by default. Avoid enumerateDevices() as strict mobile browsers 
    // hide device kinds before permissions are explicitly granted.
    let constraints: MediaStreamConstraints = {
      video: { facingMode: 'user' },
      audio: {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true }
      }
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err: any) {
      // Fallback: If hardware lacks camera, try requesting audio only
      console.warn('[VideoCall] Full media request failed, attempting audio fallback...', err);
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: constraints.audio, video: false });
      } catch (fallbackErr) {
        throw new Error('Could not access camera or microphone. Please check your browser permissions.');
      }
    }
  }

  private createPeer(): Peer {
    return new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });
  }

  private setupMediaConnection(call: MediaConnection): void {
    if (this.mediaConnection) {
      this.mediaConnection.close();
    }
    this.mediaConnection = call;

    call.on('stream', (remoteStream) => {
      this.remoteStream.set(remoteStream);
      this.callState.set('connected');
      this.startDurationTimer();
      this.monitorAudioLevel(remoteStream, false);
    });

    call.on('close', () => {
      // Only drop the UI if THIS connection is still the active one
      if (this.mediaConnection === call) {
        this.remoteStream.set(null);
        this.mediaConnection = null;
        if (this.callState() === 'connected' || this.callState() === 'connecting') {
          this.callState.set('calling');
        }
      }
    });

    call.on('error', (err) => {
      console.error('[VideoCall] Media connection error:', err);
      if (this.mediaConnection === call) {
        this.remoteStream.set(null);
        this.mediaConnection = null;
        if (this.callState() === 'connected' || this.callState() === 'connecting') {
          this.callState.set('calling');
        }
      }
    });
  }

  private handleSignal(data: any): void {
    switch (data.type) {
      case 'call:incoming':
        // If the user happens to already be in the VC waiting for the other person
        // (i.e. both sides clicked "Join Video Call"), seamlessly auto-accept the connection
        if ((this.callState() === 'calling' || this.callState() === 'connecting') && this.peer && this.localStream()) {
           this.sendSignal({ type: 'call:accept', peerId: this.peer.id });
           this.callState.set('connecting');
           return;
        }

        this.incomingCall.set({
          callerName: data.callerName,
          callerPicture: data.callerPicture,
          callerPeerId: data.callerPeerId,
          callerId: data.callerId,
        });
        this.callState.set('incoming');
        break;

      case 'call:accepted':
        // The other party accepted — call them via PeerJS
        if (this.peer && this.localStream()) {
          this.callState.set('connecting');
          const call = this.peer.call(data.accepterPeerId, this.localStream()!);
          this.setupMediaConnection(call);
        }
        break;

      case 'call:rejected':
        this.callState.set('idle');
        this.errorMessage.set(`Call was declined.`);
        this.stopLocalStream();
        this.peer?.destroy();
        this.peer = null;
        setTimeout(() => this.errorMessage.set(null), 3000);
        break;

      case 'call:ended':
        if (this.mediaConnection) {
          this.mediaConnection.close();
          this.mediaConnection = null;
        }
        this.remoteStream.set(null);
        // Switch back to waiting state so they can wait for the person to reconnect
        if (this.callState() === 'connected' || this.callState() === 'connecting') {
           this.callState.set('calling');
        }
        break;
    }
  }

  private sendSignal(data: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private startDurationTimer(): void {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
    }
    this.callDuration.set(0);
    this.durationTimer = setInterval(() => {
      this.callDuration.update(d => d + 1);
    }, 1000);
  }

  private stopLocalStream(): void {
    this.localStream()?.getTracks().forEach(t => t.stop());
    this.localStream.set(null);
  }

  private cleanup(): void {
    this.mediaConnection?.close();
    this.mediaConnection = null;

    this.stopLocalStream();
    this.remoteStream.set(null);

    this.peer?.destroy();
    this.peer = null;

    clearInterval(this.durationTimer);
    this.durationTimer = null;

    this.callState.set('idle');
    this.callDuration.set(0);
    this.isMuted.set(false);
    this.isCameraOff.set(false);
    this.isChatOpen.set(false);
    this.isLocalTalking.set(false);
    this.isRemoteTalking.set(false);
    this.incomingCall.set(null);

    // Clean up audio context checking
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (e) {}
    }
    this.audioContext = null;
    clearInterval(this.localAnalyserTimer);
    clearInterval(this.remoteAnalyserTimer);
  }
}
