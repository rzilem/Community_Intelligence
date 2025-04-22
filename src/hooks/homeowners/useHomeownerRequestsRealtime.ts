
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomeownerRequest } from "@/types/homeowner-request-types";

/**
 * Subscribes to real-time homeowner request changes for a given association and invokes a callback.
 * Returns a boolean ref for "isRealtime" so the UI can reflect live status.
 */
export function useHomeownerRequestsRealtime(associationId: string | undefined, onRealtimeUpdate: (payload: { event: string; request: HomeownerRequest }) => void) {
  const isRealtimeRef = useRef(false);

  useEffect(() => {
    if (!associationId) return;

    // Subscribe to INSERT, UPDATE, DELETE events for homeowner_requests
    const channel = supabase
      .channel("homeowner_requests-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "homeowner_requests",
        filter: `association_id=eq.${associationId}`,
      }, (payload) => {
        isRealtimeRef.current = true;
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          onRealtimeUpdate({ event: payload.eventType, request: payload.new as HomeownerRequest });
        } else if (payload.eventType === "DELETE") {
          onRealtimeUpdate({ event: payload.eventType, request: payload.old as HomeownerRequest });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [associationId]);

  return isRealtimeRef;
}
