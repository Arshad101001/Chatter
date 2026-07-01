class PeerService {
    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    'stun:stun.l.google.com:19302',
                    "stun:global.stun.twilio.com:3478",
                ],
            }]
        });
        this.pendingCandidates = []; // ← buffer for early candidates
    }

    initListeners(socket, targetUserId, onRemoteStream) {
        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice:candidate", {
                    to: targetUserId,
                    candidate: event.candidate,
                });
            }
        };

        this.peer.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                onRemoteStream(event.streams[0]);
            }
        };
    }

    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));

            // Flush any candidates that arrived before remote description was set
            for (const candidate of this.pendingCandidates) {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
            this.pendingCandidates = [];

            return ans;
        }
    }

    async setRemoteDescription(ans) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));

            // Flush pending candidates on caller side too
            for (const candidate of this.pendingCandidates) {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
            this.pendingCandidates = [];
        }
    }

    async getOffer() {
        if (this.peer) {
            if (this.peer.signalingState !== 'stable') {
                console.warn('Skipping getOffer — signalingState is:', this.peer.signalingState);
                return;
            }
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async addIceCandidate(candidate) {
        if (this.peer && candidate) {
            // If remote description not set yet, buffer the candidate
            if (!this.peer.remoteDescription) {
                this.pendingCandidates.push(candidate);
                return;
            }
            await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    reset() {
        this.peer.close();
        this.peer = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    'stun:stun.l.google.com:19302',
                    "stun:global.stun.twilio.com:3478",
                ],
            }]
        });
        this.pendingCandidates = [];
    }
}

export default new PeerService();