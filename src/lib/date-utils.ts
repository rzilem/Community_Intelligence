
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString();
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '—';
  
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getDaysFromNow(date: string | Date): number {
  const now = new Date();
  const targetDate = new Date(date);
  
  // Return difference in days
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: string | Date): boolean {
  return getDaysFromNow(date) < 0;
}
