import React, { useEffect, useRef, useState, useCallback } from 'react';
import { INITIAL_SERVERS, GAME_CONFIG, COLORS, UPGRADE_COSTS } from '../constants';
import { Server, Packet, GameState, Particle, UpgradeType } from '../types';
import { ServerRack } from './ServerRack';
import { Play, RotateCw, ShieldAlert, Cpu, Home, Pause, Activity } from 'lucide-react';

interface LoadBalancerGameProps {
    onBack?: () => void;
}

export const LoadBalancerGame: React.FC<LoadBalancerGameProps> = ({ onBack }) => {
  // --- Refs for Game Loop (Mutable State) ---
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game Entities stored in refs to avoid re-renders during 60fps loop
  const serversRef = useRef<Server[]>(JSON.parse(JSON.stringify(INITIAL_SERVERS)));
  const packetsRef = useRef<Packet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const gameStateRef = useRef<GameState>({
    score: 0,
    money: GAME_CONFIG.INITIAL_MONEY,
    lives: GAME_CONFIG.INITIAL_LIVES,
    wave: 1,
    isGameOver: false,
    isPlaying: false,
    highScore: 0,
  });
  
  // Mouse/Input State
  const gatewayXRef = useRef<number>(0.5); // Normalized 0-1
  const spawnTimerRef = useRef<number>(0);
  const difficultyTimerRef = useRef<number>(0);
  const currentSpawnRateRef = useRef<number>(GAME_CONFIG.SPAWN_RATE_INITIAL);

  // --- React State for UI Sync ---
  const [uiState, setUiState] = useState<{
    servers: Server[];
    score: number;
    money: number;
    lives: number;
    isGameOver: boolean;
    isPlaying: boolean;
    wave: number;
  }>({
    servers: INITIAL_SERVERS,
    score: 0,
    money: GAME_CONFIG.INITIAL_MONEY,
    lives: GAME_CONFIG.INITIAL_LIVES,
    isGameOver: false,
    isPlaying: false,
    wave: 1
  });

  // --- Helper Functions ---

  const spawnPacket = () => {
    const isSpike = Math.random() > 0.9;
    // Speed increases with wave
    const waveSpeedMultiplier = 1 + (gameStateRef.current.wave * 0.15);
    
    const packet: Packet = {
      id: Date.now() + Math.random(),
      x: Math.random() * 0.9 + 0.05, // 5% to 95% width
      y: -0.1, // Start slightly above
      speed: (Math.random() * 0.0002 + 0.0003) * waveSpeedMultiplier,
      type: isSpike ? 'heavy' : 'standard',
      color: isSpike ? COLORS.packetHeavy : COLORS.packetStandard,
      value: isSpike ? 20 : 10,
      heatGenerated: isSpike ? 30 : 10,
    };
    packetsRef.current.push(packet);
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 0.015, // Slightly more explosive
        vy: (Math.random() - 0.5) * 0.015,
        life: 1.0,
        color,
      });
    }
  };

  const handleUpgrade = (serverId: number, type: UpgradeType) => {
    const server = serversRef.current.find(s => s.id === serverId);
    if (!server) return;

    const cost = UPGRADE_COSTS[type];
    if (gameStateRef.current.money >= cost) {
      gameStateRef.current.money -= cost;
      
      if (type === 'COOLING') {
        server.coolingRate += 5;
      } else if (type === 'CAPACITY') {
        server.processingPower = Math.max(5, server.processingPower - 2);
      } else if (type === 'REPAIR') {
        server.status = 'active';
        server.heat = 0;
        server.rebootTimer = 0;
      }

      // Force UI update immediately
      syncUi();
    }
  };

  const syncUi = useCallback(() => {
    setUiState({
      servers: [...serversRef.current],
      score: gameStateRef.current.score,
      money: gameStateRef.current.money,
      lives: gameStateRef.current.lives,
      isGameOver: gameStateRef.current.isGameOver,
      isPlaying: gameStateRef.current.isPlaying,
      wave: gameStateRef.current.wave,
    });
  }, []);

  const startGame = () => {
    serversRef.current = JSON.parse(JSON.stringify(INITIAL_SERVERS));
    packetsRef.current = [];
    particlesRef.current = [];
    
    // Check local storage for high score
    let storedHigh = 0;
    try {
        const stored = localStorage.getItem('lbp_highscore');
        if (stored) storedHigh = parseInt(stored, 10);
    } catch(e) { console.error(e); }

    gameStateRef.current = {
      score: 0,
      money: GAME_CONFIG.INITIAL_MONEY,
      lives: GAME_CONFIG.INITIAL_LIVES,
      wave: 1,
      isGameOver: false,
      isPlaying: true,
      highScore: Math.max(storedHigh, gameStateRef.current.highScore),
    };
    currentSpawnRateRef.current = GAME_CONFIG.SPAWN_RATE_INITIAL;
    lastTimeRef.current = performance.now();
    syncUi();
  };

  // --- Main Game Loop ---
  const update = (time: number) => {
    if (!gameStateRef.current.isPlaying || gameStateRef.current.isGameOver) {
       requestRef.current = requestAnimationFrame(update);
       return;
    }

    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    const safeDt = Math.min(dt, 100);

    // 1. Spawning
    spawnTimerRef.current += safeDt;
    if (spawnTimerRef.current > currentSpawnRateRef.current) {
      spawnPacket();
      spawnTimerRef.current = 0;
    }

    // 2. Difficulty Scaling
    difficultyTimerRef.current += safeDt;
    if (difficultyTimerRef.current > 15000) { // Every 15 seconds
        gameStateRef.current.wave += 1;
        currentSpawnRateRef.current = Math.max(GAME_CONFIG.SPAWN_RATE_MIN, currentSpawnRateRef.current * 0.90);
        difficultyTimerRef.current = 0;
    }

    // 3. Update Packets
    const gatewayLeft = gatewayXRef.current - GAME_CONFIG.GATEWAY_WIDTH / 2;
    const gatewayRight = gatewayXRef.current + GAME_CONFIG.GATEWAY_WIDTH / 2;
    const gatewayY = GAME_CONFIG.GATEWAY_Y;

    for (let i = packetsRef.current.length - 1; i >= 0; i--) {
      const p = packetsRef.current[i];
      p.y += p.speed * safeDt;

      // Collision with Gateway Line
      if (p.y >= gatewayY && p.y <= gatewayY + 0.02) {
        if (p.x >= gatewayLeft && p.x <= gatewayRight) {
            // CAUGHT! Route to server.
            const serverIndex = Math.floor(gatewayXRef.current * GAME_CONFIG.SERVER_COUNT);
            const targetServerIdx = Math.max(0, Math.min(GAME_CONFIG.SERVER_COUNT - 1, serverIndex));
            const targetServer = serversRef.current[targetServerIdx];

            if (targetServer.status === 'active') {
                // Success
                targetServer.heat += (p.heatGenerated / (100 / targetServer.processingPower)); 
                gameStateRef.current.score += p.value;
                gameStateRef.current.money += Math.floor(p.value / 2);
                createParticles(p.x, p.y, COLORS.particleSuccess, 5);
            } else {
                // Server is down - Packet Lost
                gameStateRef.current.lives -= 1;
                createParticles(p.x, p.y, COLORS.particleExplosion, 8);
            }
            
            // Remove packet
            packetsRef.current.splice(i, 1);
            continue;
        }
      }

      // Missed Packet (bottom of screen)
      if (p.y > 1.0) {
        gameStateRef.current.lives -= 1;
        createParticles(p.x, 1.0, COLORS.particleExplosion, 5);
        packetsRef.current.splice(i, 1);
      }
    }

    // 4. Update Servers
    serversRef.current.forEach(srv => {
        if (srv.status === 'active') {
            // Cooling
            srv.heat -= (srv.coolingRate / 1000) * safeDt; 
            if (srv.heat < 0) srv.heat = 0;
            
            // Overheat check
            if (srv.heat >= srv.maxHeat) {
                srv.status = 'rebooting';
                srv.rebootTimer = 5; // 5 seconds crash
                createParticles((srv.id + 0.5) / GAME_CONFIG.SERVER_COUNT, 1.0, COLORS.particleExplosion, 20);
            }
        } else if (srv.status === 'rebooting') {
            srv.rebootTimer -= safeDt / 1000;
            if (srv.rebootTimer <= 0) {
                srv.status = 'active';
                srv.heat = 50; // Reboot to warm
            }
        }
    });

    // 5. Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.02;
        if (pt.life <= 0) particlesRef.current.splice(i, 1);
    }

    // 6. Game Over Check
    if (gameStateRef.current.lives <= 0 && !gameStateRef.current.isGameOver) {
        gameStateRef.current.isGameOver = true;
        gameStateRef.current.isPlaying = false;
        
        // Save high score
        if (gameStateRef.current.score > gameStateRef.current.highScore) {
            gameStateRef.current.highScore = gameStateRef.current.score;
            try {
                localStorage.setItem('lbp_highscore', gameStateRef.current.highScore.toString());
            } catch(e) {}
        }
        syncUi();
    }

    syncUi();
    requestRef.current = requestAnimationFrame(update);
  };

  // --- Rendering Loop (Canvas) ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
         canvas.width = canvas.offsetWidth;
         canvas.height = canvas.offsetHeight;
    }

    // Clear and draw subtle grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    // Vertical lines
    for(let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    // Horizontal lines
    for(let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw Gateway
    const gatewayWPx = canvas.width * GAME_CONFIG.GATEWAY_WIDTH;
    const gatewayHPx = 12;
    const gatewayXPx = (gatewayXRef.current * canvas.width) - (gatewayWPx / 2);
    const gatewayYPx = canvas.height * GAME_CONFIG.GATEWAY_Y;

    // Gateway Beam/Bar
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.packetStandard;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    // Rounded rect manually for better support if roundRect isn't everywhere (it mostly is now)
    if (ctx.roundRect) {
        ctx.roundRect(gatewayXPx, gatewayYPx, gatewayWPx, gatewayHPx, 4);
    } else {
        ctx.rect(gatewayXPx, gatewayYPx, gatewayWPx, gatewayHPx);
    }
    ctx.fill();
    
    // Draw Connection Line to Target Server
    const serverIndex = Math.floor(gatewayXRef.current * GAME_CONFIG.SERVER_COUNT);
    const clampedIdx = Math.max(0, Math.min(GAME_CONFIG.SERVER_COUNT - 1, serverIndex));
    const serverWidth = canvas.width / GAME_CONFIG.SERVER_COUNT;
    const serverCenterX = (clampedIdx * serverWidth) + (serverWidth / 2);

    // Dynamic Gradient Beam
    const grad = ctx.createLinearGradient(0, gatewayYPx, 0, canvas.height);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)'); 
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.moveTo(gatewayXPx, gatewayYPx + gatewayHPx);
    ctx.lineTo(gatewayXPx + gatewayWPx, gatewayYPx + gatewayHPx);
    ctx.lineTo(serverCenterX + (serverWidth * 0.4), canvas.height);
    ctx.lineTo(serverCenterX - (serverWidth * 0.4), canvas.height);
    ctx.fill();

    // Reset Shadow
    ctx.shadowBlur = 0;

    // Draw Packets (Digital squares/diamonds instead of circles for cyberpunk feel)
    packetsRef.current.forEach(p => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        ctx.fillStyle = p.color;
        
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.type === 'heavy') {
            // Rotating diamond for heavy
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Date.now() / 200);
            ctx.fillRect(-7, -7, 14, 14);
            ctx.restore();
        } else {
            // Small square for standard
            ctx.fillRect(x - 4, y - 4, 8, 8);
        }
        ctx.shadowBlur = 0;
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        // Draw small squares
        ctx.fillRect((p.x * canvas.width) - 2, (p.y * canvas.height) - 2, 4, 4);
        ctx.globalAlpha = 1.0;
    });

    requestAnimationFrame(draw);
  };

  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current && containerRef.current) {
            canvasRef.current.width = containerRef.current.clientWidth;
            canvasRef.current.height = containerRef.current.clientHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return;
        if (e.type === 'touchmove') e.preventDefault();

        const rect = containerRef.current.getBoundingClientRect();
        let clientX = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as MouseEvent).clientX;
        }
        
        const rawX = clientX - rect.left;
        const normalizedX = Math.max(0, Math.min(1, rawX / rect.width));
        gatewayXRef.current = normalizedX;
    };

    const container = containerRef.current;
    if (container) {
        container.addEventListener('mousemove', handleMove);
        container.addEventListener('touchmove', handleMove, { passive: false });
    }

    requestRef.current = requestAnimationFrame(update);
    const drawHandle = requestAnimationFrame(draw);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (container) {
            container.removeEventListener('mousemove', handleMove);
            container.removeEventListener('touchmove', handleMove);
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        cancelAnimationFrame(drawHandle);
    };
  }, []);

  const targetedServerIndex = Math.min(GAME_CONFIG.SERVER_COUNT - 1, Math.floor(gatewayXRef.current * GAME_CONFIG.SERVER_COUNT));

  return (
    <div className="game-container w-full h-full flex flex-col bg-slate-900 relative select-none font-sans overflow-hidden">
      
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none"></div>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-3 md:p-4 flex justify-between items-start z-30 pointer-events-none">
        <div className="flex flex-col space-y-2 animate-slide-in">
            {/* Score Panel */}
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg flex flex-col min-w-[130px] shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky-500 to-transparent"></div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">THROUGHPUT</span>
                    <Activity size={10} className="text-sky-500 animate-pulse" />
                </div>
                <span className="text-2xl font-mono text-white font-bold tracking-tight text-glow">{uiState.score.toLocaleString()}</span>
                <span className="text-slate-500 text-[10px] font-mono mt-1">PEAK: {gameStateRef.current.highScore}</span>
            </div>
            
            {/* Money Panel */}
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg flex items-center space-x-2 shadow-lg w-fit relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500"></div>
                 <div className="flex items-center text-emerald-400 pl-1">
                    <span className="text-lg font-bold mr-1">$</span>
                    <span className="font-mono text-lg tracking-wide">{uiState.money}</span>
                 </div>
            </div>
        </div>

        <div className="flex flex-col items-end space-y-2 animate-slide-in" style={{animationDelay: '0.1s'}}>
            {/* Integrity Panel */}
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg text-right shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-red-500 to-transparent"></div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">SYSTEM INTEGRITY</span>
                <div className="flex space-x-1.5 mt-2 justify-end">
                    {Array.from({length: GAME_CONFIG.INITIAL_LIVES}).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1.5 h-3 md:w-2 md:h-4 rounded-[1px] skew-x-12 transition-all duration-300 ${i < uiState.lives ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-slate-800'}`} 
                        />
                    ))}
                </div>
            </div>
            
            {/* Wave Badge */}
            <div className="bg-slate-900/90 backdrop-blur border border-orange-500/30 px-3 py-1 rounded shadow-lg">
                <span className="text-orange-400 text-xs font-bold tracking-[0.2em] font-mono animate-pulse">WAVE_{uiState.wave}</span>
            </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        <canvas ref={canvasRef} className="absolute inset-0 z-10 block" aria-label="Game Board - Move mouse to route packets" />
        
        {/* Start / Game Over Overlay */}
        {(!uiState.isPlaying || uiState.isGameOver) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-[4px] animate-fade-in p-4">
                <div className="text-center p-6 md:p-8 border border-slate-700 bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
                    {/* Decorative cyber lines */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-emerald-500"></div>
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-sky-500 via-purple-500 to-emerald-500"></div>

                    {uiState.isGameOver ? (
                        <>
                            <div className="inline-block p-4 rounded-full bg-red-500/10 mb-4 animate-bounce">
                                <ShieldAlert size={48} className="text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tighter">SYSTEM CRITICAL</h2>
                            <p className="text-slate-400 mb-6 font-mono text-xs uppercase tracking-widest">Infrastructure Compromised</p>
                            <div className="bg-slate-950 p-4 rounded-lg mb-6 border border-slate-800 shadow-inner">
                                <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-1">Final Throughput</div>
                                <div className="text-4xl font-mono text-sky-400 font-bold text-glow">{uiState.score.toLocaleString()}</div>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="inline-block p-4 rounded-full bg-sky-500/10 mb-4 animate-float">
                                <Cpu size={48} className="text-sky-500" />
                             </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-mono tracking-tighter">LOAD BALANCER PRO</h2>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed max-w-xs mx-auto font-light">
                                Traffic spikes detected. Slide the <span className="text-sky-400 font-bold font-mono">Gateway</span> to route packets. Prevent server meltdowns.
                            </p>
                        </>
                    )}
                    
                    <div className="space-y-3">
                        <button 
                            onClick={startGame}
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded transition-all shadow-[0_0_20px_rgba(2,132,199,0.3)] hover:shadow-[0_0_30px_rgba(2,132,199,0.5)] hover:scale-[1.02] flex items-center justify-center group font-mono tracking-wider border border-sky-400/50"
                        >
                            {uiState.isGameOver ? <RotateCw className="mr-2 group-hover:rotate-180 transition-transform" /> : <Play className="mr-2 fill-current" />}
                            {uiState.isGameOver ? 'REBOOT_SYSTEM()' : 'INITIALIZE_GAME()'}
                        </button>
                        
                        {uiState.isGameOver && onBack && (
                             <button 
                                onClick={onBack}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold py-3.5 px-6 rounded transition-colors flex items-center justify-center group font-mono text-sm border border-slate-700"
                            >
                                <Home className="mr-2" size={16} />
                                RETURN TO MENU
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Bottom: Servers */}
      <div className="h-44 md:h-56 bg-slate-950 border-t border-slate-800 p-2 md:p-4 z-20 shrink-0 relative">
         {/* Background glow from bottom */}
         <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-sky-900/10 to-transparent pointer-events-none"></div>
         
         <div className="h-full w-full max-w-5xl mx-auto grid grid-cols-4 gap-2 md:gap-4 relative z-10">
            {uiState.servers.map((server, idx) => (
                <ServerRack 
                    key={server.id} 
                    server={server} 
                    money={uiState.money} 
                    onUpgrade={handleUpgrade}
                    isHovered={uiState.isPlaying && !uiState.isGameOver && idx === targetedServerIndex}
                />
            ))}
         </div>
      </div>
    </div>
  );
};