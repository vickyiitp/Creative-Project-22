import React from 'react';
import { Server, UpgradeType } from '../types';
import { UPGRADE_COSTS } from '../constants';
import { Server as ServerIcon, Thermometer, Zap, AlertTriangle, RotateCcw, Fan } from 'lucide-react';

interface ServerRackProps {
  server: Server;
  money: number;
  onUpgrade: (serverId: number, type: UpgradeType) => void;
  isHovered: boolean; // Is the gateway currently targeting this server?
}

export const ServerRack: React.FC<ServerRackProps> = ({ server, money, onUpgrade, isHovered }) => {
  const heatPercent = Math.min(100, Math.max(0, server.heat));
  
  // Visual state classes
  const isOverheated = server.status === 'overheated' || server.status === 'rebooting';
  const heatColor = heatPercent > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]' : heatPercent > 50 ? 'bg-orange-500' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]';
  const borderColor = isHovered 
    ? (isOverheated ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]') 
    : 'border-slate-800 bg-slate-900/80';
  
  const bgClass = isOverheated ? 'bg-red-950/20' : 'bg-slate-900/90';

  const getStatusText = () => {
    if (server.status === 'rebooting') return `REBOOT ${server.rebootTimer.toFixed(1)}s`;
    if (server.status === 'overheated') return 'CRITICAL';
    return 'ONLINE';
  };

  return (
    <div className={`relative flex flex-col h-full rounded-lg p-2 transition-all duration-200 border-2 select-none overflow-hidden ${borderColor} ${bgClass}`}>
      
      {/* Background Grid Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <ServerIcon size={14} className={isOverheated ? 'text-red-500 shrink-0 animate-pulse' : 'text-slate-500 shrink-0'} />
          <span className="text-[10px] md:text-xs font-bold text-slate-300 font-mono truncate tracking-tight">{server.name}</span>
        </div>
        <div className={`flex items-center text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap border ${server.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {/* Status LED */}
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${server.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`}></span>
          {getStatusText()}
        </div>
      </div>

      {/* Rack Visuals (Industrial Look) */}
      <div className="relative z-10 flex-1 flex flex-col space-y-1 mb-2 opacity-80">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 md:h-2 bg-slate-800 rounded-[1px] w-full overflow-hidden flex items-center justify-between px-1 border border-slate-700/50">
             {/* Blinking Lights */}
             <div className="flex space-x-0.5">
                <div className={`h-1 w-1 rounded-full ${server.status === 'active' && Math.random() > 0.3 ? 'bg-sky-500 animate-pulse' : 'bg-slate-700'}`}></div>
                <div className={`h-1 w-1 rounded-full ${server.status === 'active' && Math.random() > 0.7 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
             </div>
             {/* Vent Slots */}
             <div className="flex space-x-0.5 opacity-30">
                <div className="w-2 h-0.5 bg-slate-500"></div>
                <div className="w-2 h-0.5 bg-slate-500"></div>
                <div className="w-2 h-0.5 bg-slate-500"></div>
             </div>
          </div>
        ))}
        
        {/* Fan Animation Section */}
        <div className="flex justify-center mt-2 opacity-50">
             <Fan 
                size={24} 
                className={`text-slate-600 transition-all duration-500 ${server.status === 'active' ? (heatPercent > 50 ? 'animate-spin' : 'animate-spin-slow') : ''} ${isOverheated ? 'text-red-900' : ''}`} 
             />
        </div>
      </div>

      {/* Heat Gauge */}
      <div className="relative z-10 mb-2 md:mb-3">
        <div className="flex justify-between text-[9px] md:text-[10px] text-slate-500 mb-1">
          <span className="flex items-center"><Thermometer size={10} className="mr-1"/> TEMP</span>
          <span className={`font-mono transition-colors ${heatPercent > 80 ? 'text-red-400 font-bold' : ''}`}>{Math.floor(server.heat)}°C</span>
        </div>
        <div className="h-3 md:h-4 w-full bg-slate-950 rounded border border-slate-800 overflow-hidden relative shadow-inner">
           <div 
             className={`h-full transition-all duration-200 ease-out ${heatColor}`} 
             style={{ width: `${heatPercent}%` }}
           />
           {/* Scanline overlay on bar */}
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
           {/* Grid lines on bar */}
           <div className="absolute inset-0 grid grid-cols-4 w-full h-full pointer-events-none">
             <div className="border-r border-slate-900/50"></div>
             <div className="border-r border-slate-900/50"></div>
             <div className="border-r border-slate-900/50"></div>
           </div>
        </div>
      </div>

      {/* Upgrades */}
      <div className="relative z-10 grid grid-cols-2 gap-1.5 md:gap-2 mt-auto">
        <button
          onClick={() => onUpgrade(server.id, 'COOLING')}
          disabled={money < UPGRADE_COSTS.COOLING || server.status !== 'active'}
          aria-label={`Upgrade Cooling for ${server.name} cost ${UPGRADE_COSTS.COOLING}`}
          className="group flex flex-col items-center justify-center py-1.5 px-1 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded border border-slate-700 hover:border-sky-500/50 transition-all hover:shadow-[0_0_10px_rgba(56,189,248,0.1)] relative overflow-hidden"
          title="Upgrade Cooling System"
        >
          <div className="flex items-center text-[10px] md:text-xs text-sky-400 font-bold mb-0.5 relative z-10">
            <RotateCcw size={10} className="mr-1 hidden md:block group-hover:-rotate-180 transition-transform duration-500" />
            COOL
          </div>
          <div className="text-[9px] md:text-[10px] text-slate-500 group-hover:text-white font-mono relative z-10">${UPGRADE_COSTS.COOLING}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <button
          onClick={() => onUpgrade(server.id, 'CAPACITY')}
          disabled={money < UPGRADE_COSTS.CAPACITY || server.status !== 'active'}
          aria-label={`Upgrade Capacity for ${server.name} cost ${UPGRADE_COSTS.CAPACITY}`}
          className="group flex flex-col items-center justify-center py-1.5 px-1 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded border border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-[0_0_10px_rgba(168,85,247,0.1)] relative overflow-hidden"
          title="Upgrade Processing Capacity"
        >
          <div className="flex items-center text-[10px] md:text-xs text-purple-400 font-bold mb-0.5 relative z-10">
            <Zap size={10} className="mr-1 hidden md:block group-hover:scale-125 transition-transform" />
            CAP
          </div>
          <div className="text-[9px] md:text-[10px] text-slate-500 group-hover:text-white font-mono relative z-10">${UPGRADE_COSTS.CAPACITY}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {/* Repair Overlay */}
      {server.status === 'rebooting' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 rounded-lg border-2 border-red-500/50 animate-pulse">
           <AlertTriangle size={24} className="text-red-500 mb-2 animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
           <span className="text-red-400 font-mono text-[10px] font-bold text-center px-2 mb-1">SYSTEM FAILURE</span>
           <span className="text-red-500/70 text-[9px] font-mono animate-pulse">REBOOTING...</span>
           <button 
             onClick={() => onUpgrade(server.id, 'REPAIR')}
             disabled={money < UPGRADE_COSTS.REPAIR}
             aria-label={`Repair ${server.name} for ${UPGRADE_COSTS.REPAIR}`}
             className="mt-3 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[10px] font-bold disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
           >
             FORCE START ${UPGRADE_COSTS.REPAIR}
           </button>
        </div>
      )}
    </div>
  );
};