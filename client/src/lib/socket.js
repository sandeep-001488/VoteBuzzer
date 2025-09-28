import { io } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

class SocketManager {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(BACKEND_URL, {
        transports: ["websocket"],
        auth: {
          token: token,
        },
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    if (!this.socket || !this.socket.connected) {
      throw new Error("Socket not connected");
    }
    return this.socket;
  }
}

const socketManager = new SocketManager();
export default socketManager;
