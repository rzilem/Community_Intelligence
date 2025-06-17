
export const parseEmails = (email: string | undefined): string[] => {
  if (!email) return [];
  return email.split(',').map(e => e.trim()).filter(e => e.length > 0);
};
