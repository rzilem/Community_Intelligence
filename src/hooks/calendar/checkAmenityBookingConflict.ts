
import { CalendarEvent } from "@/types/calendar-types";

/**
 * Checks for conflicting amenity bookings.
 * Returns true if conflict detected, false otherwise.
 * @param existingEvents List of existing events for the amenity (already filtered by date/amenity)
 * @param start Proposed start time (Date)
 * @param end Proposed end time (Date)
 */
export function checkAmenityBookingConflict(
  existingEvents: CalendarEvent[],
  start: Date,
  end: Date
): boolean {
  return existingEvents.some(ev => {
    const eventStart = new Date(ev.start_time);
    const eventEnd = new Date(ev.end_time);

    // Overlap check: [start < db.end && end > db.start]
    return start < eventEnd && end > eventStart;
  });
}
