"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  id: string;
  externalOrderId: string;
  total: number;
  platform: { displayName: string };
  placedAt: string;
}

const PING_SOUND_URL = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7315b.mp3";

export function useBridgeNotifications(orders: Order[] | undefined) {
  const previousOrderIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio object once
    if (!audioRef.current) {
      audioRef.current = new Audio(PING_SOUND_URL);
    }
  }, []);

  useEffect(() => {
    if (!orders) return;

    // On initial mount, just populate the set without notifying
    if (isInitialMount.current) {
      orders.forEach(order => previousOrderIds.current.add(order.id));
      isInitialMount.current = false;
      return;
    }

    // Find new orders
    const newOrders = orders.filter(order => !previousOrderIds.current.has(order.id));

    if (newOrders.length > 0) {
      newOrders.forEach(order => {
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn("Audio playback blocked:", e));
        }

        // Show Sonner toast
        toast.success(`New Bridge Event`, {
          description: `${order.platform.displayName} Order #${order.externalOrderId} • ₹${order.total}`,
          action: {
            label: "View Details",
            onClick: () => console.log("Viewing order", order.id),
          },
        });

        // Add to processed set
        previousOrderIds.current.add(order.id);
      });
    }
  }, [orders]);

  return null;
}
