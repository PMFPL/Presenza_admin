export const formatedDate = (date) => {
  if (!date) return '—';

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatedTime = (date) => {
  if (!date) return '—';

  // Ensure we have a Date object. If `date` is a string or number, convert it.
  const d = date instanceof Date ? date : new Date(date);

  // Handle invalid dates
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
