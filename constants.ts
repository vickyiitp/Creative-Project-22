import { Server } from './types';

export const GAME_CONFIG = {
  SERVER_COUNT: 4,
  INITIAL_LIVES: 10,
  INITIAL_MONEY: 0,
  FPS: 60,
  GATEWAY_Y: 0.75, // Gateway is at 75% down the screen
  GATEWAY_WIDTH: 0.15, // 15% of screen width
  SPAWN_RATE_INITIAL: 1500, // ms between spawns
  SPAWN_RATE_MIN: 200,
  GRAVITY: 0.0005,
};

export const INITIAL_SERVERS: Server[] = Array.from({ length: GAME_CONFIG.SERVER_COUNT }).map((_, i) => ({
  id: i,
  name: `SRV-0${i + 1}`,
  heat: 0,
  maxHeat: 100,
  coolingRate: 15, // Low initial cooling
  processingPower: 15, // High heat generation initially
  status: 'active',
  rebootTimer: 0,
}));

export const COLORS = {
  packetStandard: '#38bdf8', // sky-400
  packetHeavy: '#f472b6', // pink-400
  packetDDoS: '#ef4444', // red-500
  particleSuccess: '#4ade80', // green-400
  particleExplosion: '#ef4444', // red-500
};

export const UPGRADE_COSTS = {
  COOLING: 100,
  CAPACITY: 150,
  REPAIR: 500,
};
