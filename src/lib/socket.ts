// WebSocket / Socket.io yapılandırması
// Next.js App Router ile Socket.io kullanmak için custom server gerekir.
// Bu dosya socket.io client bağlantısını yönetir.

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export const SOCKET_EVENTS = {
  JOIN_TENANT: "join_tenant",
  NEW_ORDER: "new_order",
  ORDER_STATUS_CHANGED: "order_status_changed",
  PAYMENT_COMPLETED: "payment_completed",
  TABLE_STATUS_CHANGED: "table_status_changed",
} as const;
