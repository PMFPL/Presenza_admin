  export const formatDuration = (minutes) => {
    if (!minutes) return '0mins';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}mins`;
    }
    return `${mins}mins`;
  };
