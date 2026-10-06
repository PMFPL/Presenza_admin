const initialState = {
  totalActiveTime: '0',
  mostUsedTime: '0',
  totalIdleTime: '0',
  mostUsedAppName: '',
  productivity: 0,
};

export const calculateEfficiency = (data) => {
  if (!data || !Array.isArray(data)) return initialState;

  let totalActive = 0;
  let totalIdle = 0;
  let mostUsed = 0;
  let codeTime = 0;
  let mostUsedAppName = '';

  data.forEach((item) => {
    const duration = Number(item.totalDuration) || 0;

    // Track most used time
    if (duration > mostUsed) {
      mostUsed = duration;
      mostUsedAppName = item.app;
    }
    // Idle app condition
    if (item.app === 'LockApp.exe') {
      totalIdle += duration;
    }
    if (item.app === 'Code.exe' || item.app === 'idea64.exe') {
      codeTime += duration;
      totalActive +=duration;
    } 
    else {
      totalActive += duration;
    }
  });

  const totalTime = totalActive + totalIdle;

  const productivity = totalTime > 0 ? ((totalActive / totalTime) * 100).toFixed(2) : 0;

  return {
    totalActiveTime: formatTime(totalActive.toFixed(2) - totalIdle.toFixed(2)),
    mostUsedTime: formatTime(mostUsed.toFixed(2)),
    mostUsedAppName: mostUsedAppName,
    codeTime: formatTime(codeTime.toFixed(2)),
    totalIdleTime: formatTime(totalIdle.toFixed(2)),
    productivity: Number(productivity),
  };
};

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hrs}h ${mins}m ${secs}s`;
};
