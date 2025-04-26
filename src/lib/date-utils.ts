
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

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '—';
  
  const now = new Date();
  const diffInDays = getDaysFromNow(d);
  
  // Same day
  if (diffInDays === 0) {
    return 'Today';
  }
  
  // Future
  if (diffInDays > 0) {
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays <= 7) return `In ${diffInDays} days`;
    if (diffInDays <= 30) return `In ${Math.floor(diffInDays / 7)} weeks`;
    return formatDate(date);
  }
  
  // Past
  const absDiff = Math.abs(diffInDays);
  if (absDiff === 1) return 'Yesterday';
  if (absDiff <= 7) return `${absDiff} days ago`;
  if (absDiff <= 30) return `${Math.floor(absDiff / 7)} weeks ago`;
  return formatDate(date);
}
