export const toCSV = (rows: any[]): string => {
  if (!rows || rows.length === 0) return '';
  const headers = Array.from(new Set(rows.flatMap((r: any) => Object.keys(r))));
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')].concat(
    rows.map((r: any) => headers.map((h) => escape(r[h])).join(','))
  );
  return lines.join('\n');
};
