
import { useState } from 'react';

export interface MessageSchedulingOptions {
  initialScheduleEnabled?: boolean;
  defaultScheduleDate?: Date | null;
}

export interface MessageSchedulingHook {
  scheduleMessage: boolean;
  scheduledDate: Date | null;
  toggleSchedule: () => void;
  setScheduledDate: (date: Date | null) => void;
}

export function useMessageScheduling({
  initialScheduleEnabled = false,
  defaultScheduleDate = null
}: MessageSchedulingOptions = {}): MessageSchedulingHook {
  const [scheduleMessage, setScheduleMessage] = useState<boolean>(initialScheduleEnabled);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(defaultScheduleDate);

  const toggleSchedule = () => {
    setScheduleMessage((current) => {
      const next = !current;
      if (!current) {
        // When turning on scheduling, default to tomorrow at current time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(tomorrow);
      }
      return next;
    });
  };

  return {
    scheduleMessage,
    scheduledDate,
    toggleSchedule,
    setScheduledDate
  };
}
