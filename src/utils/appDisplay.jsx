// utils/appDisplay.js
//
// Single source of truth for app/window display helpers that were
// previously copy-pasted (with tiny inconsistencies) across
// ActivityStatus.jsx, ApplicationUsedByEmp.jsx, WindowsUsedByEmp.jsx
// and AppDetailsViewer.jsx.
//
// Drop this file at: src/utils/appDisplay.js
// and replace the duplicated blocks in those components with:
//   import { TONE, getDisplayAppName, getAppIcon, getAppTone } from '../../../utils/appDisplay';
// (adjust the relative path depth per file)

export const TONE = {
  primary: {
    text: 'text-[#4EA1FF]',
    bg: 'bg-[#4EA1FF]',
    soft: 'bg-[#4EA1FF]/10',
    ring: 'ring-[#4EA1FF]/20',
    border: 'border-[#4EA1FF]/20',
    glow: 'shadow-[#4EA1FF]/20',
  },
  cyan: {
    text: 'text-[#22D3EE]',
    bg: 'bg-[#22D3EE]',
    soft: 'bg-[#22D3EE]/10',
    ring: 'ring-[#22D3EE]/20',
    border: 'border-[#22D3EE]/20',
    glow: 'shadow-[#22D3EE]/20',
  },
  amber: {
    text: 'text-[#FBBF24]',
    bg: 'bg-[#FBBF24]',
    soft: 'bg-[#FBBF24]/10',
    ring: 'ring-[#FBBF24]/20',
    border: 'border-[#FBBF24]/20',
    glow: 'shadow-[#FBBF24]/20',
  },
  rose: {
    text: 'text-[#FB7185]',
    bg: 'bg-[#FB7185]',
    soft: 'bg-[#FB7185]/10',
    ring: 'ring-[#FB7185]/20',
    border: 'border-[#FB7185]/20',
    glow: 'shadow-[#FB7185]/20',
  },
  emerald: {
    text: 'text-[#34D399]',
    bg: 'bg-[#34D399]',
    soft: 'bg-[#34D399]/10',
    ring: 'ring-[#34D399]/20',
    border: 'border-[#34D399]/20',
    glow: 'shadow-[#34D399]/20',
  },
};

const APP_TONE_MAP = {
  chrome: 'primary', browser: 'primary', msedge: 'primary', firefox: 'primary',
  vscode: 'cyan', code: 'cyan', devenv: 'cyan', idea: 'cyan', intellij: 'cyan',
  slack: 'cyan', teams: 'primary', zoom: 'cyan', discord: 'cyan', skype: 'cyan',
  spotify: 'emerald', excel: 'emerald',
  word: 'primary', outlook: 'primary', onenote: 'primary',
  powerpoint: 'amber', ppt: 'amber', photoshop: 'amber', figma: 'cyan',
  github: 'amber', git: 'amber', youtube: 'rose',
};

export const getAppTone = (appName) => {
  const app = appName?.toLowerCase() || '';
  for (const [key, tone] of Object.entries(APP_TONE_MAP)) {
    if (app.includes(key)) return tone;
  }
  return 'primary';
};

export const APP_NAME_MAP = {
  'chrome.exe': 'Google Chrome',
  'msedge.exe': 'Microsoft Edge',
  'firefox.exe': 'Mozilla Firefox',
  'excel.exe': 'Microsoft Excel',
  'winword.exe': 'Microsoft Word',
  'outlook.exe': 'Microsoft Outlook',
  'powerpnt.exe': 'Microsoft PowerPoint',
  'onenote.exe': 'Microsoft OneNote',
  'explorer.exe': 'File Explorer',
  'acrobat.exe': 'Adobe Acrobat',
  'acrord32.exe': 'Adobe Acrobat Reader',
  'photoshop.exe': 'Adobe Photoshop',
  'lockapp.exe': 'Lock Screen',
  'shellexperiencehost.exe': 'Windows Shell Experience',
  'applicationframehost.exe': 'Windows App Frame',
  'searchapp.exe': 'Windows Search',
  'searchhost.exe': 'Windows Search',
  'textinputhost.exe': 'Windows Input Experience',
  'systemsettings.exe': 'Windows Settings',
  'taskmgr.exe': 'Task Manager',
  'slack.exe': 'Slack',
  'spotify.exe': 'Spotify',
  'zoom.exe': 'Zoom',
  'teams.exe': 'Microsoft Teams',
  'ms-teams.exe': 'Microsoft Teams',
  'code.exe': 'Visual Studio Code',
  'devenv.exe': 'Visual Studio',
  'figma.exe': 'Figma',
  'idea64.exe': 'IntelliJ IDEA',
  'github.exe': 'GitHub Desktop',
  'githubdesktop.exe': 'GitHub Desktop',
  'notepad.exe': 'Notepad',
  'notepad++.exe': 'Notepad++',
  'cmd.exe': 'Command Prompt',
  'powershell.exe': 'PowerShell',
  'windowsterminal.exe': 'Windows Terminal',
  'discord.exe': 'Discord',
  'skype.exe': 'Skype',
};

export const getDisplayAppName = (appName) => {
  if (!appName) return 'Unknown';
  const key = appName.toLowerCase().trim();
  if (APP_NAME_MAP[key]) return APP_NAME_MAP[key];

  return appName
    .replace(/\.exe$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || appName;
};

export const getAppIcon = (appName) => {
  const app = appName?.toLowerCase() || '';
  if (app.includes('chrome') || app.includes('browser')) return '🌐';
  if (app.includes('vscode') || app.includes('code')) return '💻';
  if (app.includes('slack')) return '💬';
  if (app.includes('spotify')) return '🎵';
  if (app.includes('zoom')) return '📹';
  if (app.includes('teams')) return '👥';
  if (app.includes('excel')) return '📊';
  if (app.includes('word')) return '📝';
  if (app.includes('powerpoint') || app.includes('ppt')) return '📽️';
  if (app.includes('outlook')) return '📧';
  if (app.includes('photoshop')) return '🎨';
  if (app.includes('figma')) return '✏️';
  if (app.includes('terminal') || app.includes('cmd')) return '⌨️';
  if (app.includes('intellij') || app.includes('idea')) return '🧠';
  if (app.includes('github') || app.includes('git')) return '🐙';
  if (app.includes('youtube')) return '▶️';
  if (app.includes('notion')) return '📓';
  if (app.includes('discord')) return '🎮';
  if (app.includes('google')) return '🔍';
  if (app.includes('explorer')) return '📁';
  if (app.includes('acrobat')) return '📄';
  return '📄';
};

export const RANK_STYLE = {
  1: 'bg-[#FBBF24]/20 text-[#FBBF24]',
  2: 'bg-[#B8C7DA]/20 text-[#CBD5E1]',
  3: 'bg-[#F97316]/20 text-[#F97316]',
};

// Deterministic initials + color for an employee avatar badge, used by
// Tracker.jsx's header selector so employees are visually distinguishable
// at a glance instead of being a plain <select> row.
const AVATAR_TONES = ['primary', 'cyan', 'amber', 'rose', 'emerald'];

export const getEmployeeInitials = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getEmployeeTone = (id = '') => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};