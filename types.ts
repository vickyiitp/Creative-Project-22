export type ServerStatus = 'active' | 'overheated' | 'rebooting';

export interface Server {
  id: number;
  name: string;
  heat: number; // 0 to 100
  maxHeat: number;
  coolingRate: number; // Heat removed per second
  processingPower: number; // Heat added per packet (lower is better)
  status: ServerStatus;
  rebootTimer: number; // Seconds remaining if rebooting
}

export interface Packet {
  id: number;
  x: number; // 0-1 (normalized width)
  y: number; // 0-1 (normalized height)
  speed: number;
  type: 'standard' | 'heavy' | 'ddos';
  color: string;
  value: number; // Points awarded
  heatGenerated: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0-1
  color: string;
}

export interface GameState {
  score: number;
  money: number;
  lives: number;
  wave: number;
  isGameOver: boolean;
  isPlaying: boolean;
  highScore: number;
}

export type UpgradeType = 'COOLING' | 'CAPACITY' | 'REPAIR';
