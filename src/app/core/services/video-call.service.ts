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
  peerLeftMessage = signal<string | null>(null);

  private audioContext: AudioContext | null = null;
  private localAnalyserTimer: any = null;
  private remoteAnalyserTimer: any = null;

  private ws: WebSocket | null = null;
  private peer: Peer | null = null;
  private mediaConnection: MediaConnection | null = null;
  bookingId = signal<number>(0);
  private durationTimer: any = null;
  private signalingReconnectTimer: any = null;
  private signalingRetries = 0;
  private signalingMaxRetries = 10;
  private isIntentionalDisconnect = false;

  /**
   * Connect to the video signaling WebSocket for a booking
   */
  connectSignaling(bookingId: number): void {
    // Don't reconnect if already open for the same booking
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.bookingId() === bookingId
    ) return;

    // Close any existing connection cleanly before reconnecting
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.isIntentionalDisconnect = true; // prevents auto-reconnect on this close
      this.ws.close();
    }

    this.isIntentionalDisconnect = false;
    this.signalingRetries = 0;
    this.bookingId.set(bookingId);
    this._openSignalingSocket(bookingId);
  }

  private _openSignalingSocket(bookingId: number): void {
    const token = this.auth.getToken();
    const wsBase = environment.apiUrl.replace('http', 'ws');
    const url = `${wsBase}/ws/video?token=${token}&bookingId=${bookingId}`;

    console.log(`[VideoCall] Opening signaling socket (attempt ${this.signalingRetries + 1})`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[VideoCall] Signaling connected');
      this.signalingRetries = 0;
      clearTimeout(this.signalingReconnectTimer);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleSignal(data);
    };

    this.ws.onclose = () => {
      console.log('[VideoCall] Signaling disconnected');
      // Always reconnect unless we deliberately disconnected (e.g. navigating away)
      // This handles the case where the socket drops mid-call or between calls
      if (!this.isIntentionalDisconnect) {
        this.signalingRetries = 0; // reset retries on each new close so second calls work
        this._scheduleSignalingReconnect(bookingId);
      }
    };

    this.ws.onerror = (e) => {
      console.error('[VideoCall] Signaling error', e);
    };
  }

  private _scheduleSignalingReconnect(bookingId: number): void {
    if (this.signalingRetries >= this.signalingMaxRetries) {
      console.warn('[VideoCall] Max signaling reconnect attempts reached.');
      return;
    }
    // Exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
    const delay = Math.min(1000 * Math.pow(2, this.signalingRetries), 30000);
    console.log(`[VideoCall] Reconnecting signaling in ${delay}ms...`);
    this.signalingRetries++;
    clearTimeout(this.signalingReconnectTimer);
    this.signalingReconnectTimer = setTimeout(() => {
      // Reconnect unless a new booking was selected or we're mid-call
      const notInActiveCall = this.callState() !== 'connected' && this.callState() !== 'connecting' && this.callState() !== 'calling';
      if (this.bookingId() === bookingId && notInActiveCall) {
        this._openSignalingSocket(bookingId);
      }
    }, delay);
  }

  /**
   * Disconnect from the signaling WebSocket
   */
  disconnectSignaling(): void {
    this.isIntentionalDisconnect = true;
    clearTimeout(this.signalingReconnectTimer);
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

    // Stop ringtone immediately when user taps Accept
    this.stopRingtone();

    try {
      this.errorMessage.set(null);
      this.callState.set('connecting');

      const stream = await this.acquireMedia();
      this.localStream.set(stream);
      this.monitorAudioLevel(stream, true);

      this.peer = this.createPeer();
      this.peer.on('open', (peerId) => {
        this.sendSignal({ type: 'call:accept', peerId });

        // Call the initiator via PeerJS
        const call = this.peer!.call(incoming.callerPeerId, stream);
        this.setupMediaConnection(call);
      });

      // Also handle if the initiator tries to call us back (defensive)
      this.peer.on('call', (call) => {
        call.answer(stream);
        // Only override active connection if we don't already have one
        if (!this.remoteStream()) {
          this.setupMediaConnection(call);
        }
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
   * End MY side of the call — local cleanup only.
   * The other person is NOT forced out; they'll see "partner left" and can end themselves.
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
          { urls: 'stun:stun2.l.google.com:19302' },
          // TURN servers for NAT traversal (when STUN alone fails)
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
          {
            urls: 'turns:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
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
        // Auto-accept: both sides clicked Start simultaneously.
        // Send our acceptance signal AND make the actual PeerJS call.
        if ((this.callState() === 'calling' || this.callState() === 'connecting') && this.peer && this.localStream()) {
           this.sendSignal({ type: 'call:accept', peerId: this.peer.id });
           // Actually call the other peer — without this the connection never forms
           const call = this.peer.call(data.callerPeerId, this.localStream()!);
           this.setupMediaConnection(call);
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
        this.playRingtone();
        break;

      case 'call:accepted':
        // The accepter has already called us via PeerJS directly.
        // Our peer.on('call') handler (set up in confirmCall) will answer it.
        // Do NOT call peer.call() here — that would override the working connection
        // with a second call that the accepter has no handler for.
        if (this.callState() === 'calling') {
          this.callState.set('connecting');
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
        // Only drop REMOTE media — the receiver keeps their own camera/mic.
        // They can still click "End Call" themselves to fully leave.
        this.stopRingtone();
        if (this.mediaConnection) {
          this.mediaConnection.close();
          this.mediaConnection = null;
        }
        // Destroy the peer so stale peer state doesn't interfere with next call.
        // The next call will create a fresh peer regardless.
        this.peer?.destroy();
        this.peer = null;
        this.remoteStream.set(null);
        this.isRemoteTalking.set(false);
        clearInterval(this.durationTimer);
        this.durationTimer = null;
        this.callDuration.set(0);
        this.incomingCall.set(null);
        // Show who left, then stay on the call screen so the receiver can end themselves
        this.peerLeftMessage.set(
          data.endedBy ? `${data.endedBy} left the call` : 'Other participant left the call'
        );
        this.callState.set('calling'); // back to waiting state, UI shows "partner left"
        setTimeout(() => this.peerLeftMessage.set(null), 5000);
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
    this.peerLeftMessage.set(null);
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

    this.stopRingtone();

    // Force a fresh signaling reconnect so the backend room is clean for the next call.
    // Without this, stale server-side state can prevent incoming call signals from being replayed.
    const bid = this.bookingId();
    if (bid) {
      setTimeout(() => {
        // Close old socket intentionally, then open a fresh one
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
          this.isIntentionalDisconnect = true;
          this.ws.close();
          this.ws = null;
        }
        this.isIntentionalDisconnect = false;
        this.signalingRetries = 0;
        this._openSignalingSocket(bid);
      }, 800); // short delay lets the call:end backend processing complete
    }
  }

  // ── Ringtone Synthesizer ──────────────────────────

  private ringtoneInterval: any = null;
  private ringtoneAudioCtx: AudioContext | null = null;

  private playRingtone(): void {
    this.stopRingtone(); // ensure clean slate
    if (!this.ringtoneAudioCtx) {
      this.ringtoneAudioCtx = new AudioContext();
    }
    
    // Play immediately and repeat every 4 seconds
    this.synthesizeRing();
    this.ringtoneInterval = setInterval(() => {
      this.synthesizeRing();
    }, 4000);
  }

  private synthesizeRing(): void {
    if (!this.ringtoneAudioCtx) return;
    const ctx = this.ringtoneAudioCtx;
    
    // Create dual-tone frequencies mimicking a modern digital bell
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 440; // A4
    
    osc2.type = 'sine';
    osc2.frequency.value = 480; // slight dissonance for alert

    // Smooth envelope to prevent popping
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05); // quick fade in
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 1.2); // ring duration
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4); // fade out

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.5);
    osc2.stop(ctx.currentTime + 1.5);
  }

  private stopRingtone(): void {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }
}
