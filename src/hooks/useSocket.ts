"use client";

import { useEffect, useRef } from "react";
import { getSocket, SOCKET_EVENTS } from "@/lib/socket";

export function useSocketRoom(tenantId: string | null, onNewOrder?: (order: unknown) => void, onStatusChange?: (data: unknown) => void) {
  const joined = useRef(false);

  useEffect(() => {
    if (!tenantId || joined.current) return;
    const socket = getSocket();

    socket.emit(SOCKET_EVENTS.JOIN_TENANT, tenantId);
    joined.current = true;

    if (onNewOrder) socket.on(SOCKET_EVENTS.NEW_ORDER, onNewOrder);
    if (onStatusChange) socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, onStatusChange);

    return () => {
      if (onNewOrder) socket.off(SOCKET_EVENTS.NEW_ORDER, onNewOrder);
      if (onStatusChange) socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, onStatusChange);
      joined.current = false;
    };
  }, [tenantId, onNewOrder, onStatusChange]);
}
