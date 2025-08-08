
import React, { useMemo, useState } from 'react';
import { useAmenityBlackouts } from '@/hooks/amenities/useAmenityBlackouts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';

interface AmenityBlackoutsProps {
  amenityId: string;
}

const AmenityBlackouts: React.FC<AmenityBlackoutsProps> = ({ amenityId }) => {
  const { blackouts, loading, createBlackout, deleteBlackout } = useAmenityBlackouts(amenityId);
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [reason, setReason] = useState<string>('');

  const canSubmit = useMemo(() => !!date && !!startTime && !!endTime, [date, startTime, endTime]);

  const handleAdd = () => {
    if (!canSubmit) return;
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    createBlackout.mutate(
      { amenity_id: amenityId, start_time: start.toISOString(), end_time: end.toISOString(), reason: reason || null } as any
    );
    setReason('');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Start time</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>End time</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Reason (optional)</Label>
          <Input placeholder="e.g., Maintenance" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={!canSubmit}>
          Add blackout
        </Button>
      </div>

      <Separator />

      {loading ? (
        <div className="h-16 rounded border animate-pulse bg-muted/50" />
      ) : blackouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blackout periods configured.</p>
      ) : (
        <div className="space-y-2">
          {blackouts.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded border">
              <div className="text-sm">
                <div className="font-medium">{new Date(b.start_time).toLocaleString()} — {new Date(b.end_time).toLocaleString()}</div>
                {b.reason && <div className="text-xs text-muted-foreground">{b.reason}</div>}
              </div>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => deleteBlackout.mutate(b.id)}
                title="Delete blackout"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmenityBlackouts;
