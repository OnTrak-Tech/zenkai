const PROFILE_KEY_PREFIX = 'zenkai_profile_';
const SETTINGS_KEY = 'zenkai_settings';

// --- Profile (username & avatar) ---

export interface UserProfile {
  username: string;
  avatarIndex: number; // Index into AVATAR_OPTIONS
}

/** Preset avatar options — cyberpunk-themed material icons */
export const AVATAR_OPTIONS = [
  { icon: 'person', color: '#ff2d78' },
  { icon: 'smart_toy', color: '#2dffb4' },
  { icon: 'psychology', color: '#ffe04a' },
  { icon: 'shield', color: '#ff6b35' },
  { icon: 'bolt', color: '#00d4ff' },
  { icon: 'local_fire_department', color: '#ff4444' },
  { icon: 'diamond', color: '#b388ff' },
  { icon: 'stars', color: '#ffd740' },
];

function profileKey(address: string): string {
  return `${PROFILE_KEY_PREFIX}${address.toLowerCase()}`;
}

export function getProfile(address: string): UserProfile {
  try {
    const stored = localStorage.getItem(profileKey(address));
    if (stored) return JSON.parse(stored);
  } catch {}
  // Default profile
  return {
    username: `Player_${address.slice(2, 6)}`,
    avatarIndex: 0,
  };
}

export function saveProfile(address: string, profile: UserProfile): void {
  localStorage.setItem(profileKey(address), JSON.stringify(profile));
}

// --- Game Settings ---

export interface GameSettings {
  bgm: boolean;
  sfx: boolean;
  haptics: boolean;
}

export function getSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // Defaults: everything on
  return { bgm: true, sfx: true, haptics: true };
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
