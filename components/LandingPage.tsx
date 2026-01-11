import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Activity, Thermometer, Server, Shield, Cpu, ChevronDown, Menu, X, ArrowUp, Mail, Globe, Youtube, Linkedin, Github, Instagram, Twitter } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenPrivacy, onOpenTerms }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Background Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Nodes
    const nodes: {x: number, y: number, vx: number, vy: number}[] = [];
    const isMobile = width < 768;
    const nodeCount = Math.floor(width * height / (isMobile ? 25000 : 15000));

    for(let i=0; i<nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    // Traffic Packets
    const packets: {x: number, y: number, targetIndex: number, speed: number, progress: number}[] = [];
    const packetSpawnRate = 0.05; // Chance per frame

    let animId: number;

    const draw = () => {
        // Clear with trail effect
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // bg-slate-900 with fade
        ctx.fillRect(0, 0, width, height);

        // Update Nodes
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)'; 
        ctx.lineWidth = 1;
        
        nodes.forEach((node, i) => {
            node.x += node.vx;
            node.y += node.vy;

            // Bounce
            if(node.x < 0 || node.x > width) node.vx *= -1;
            if(node.y < 0 || node.y > height) node.vy *= -1;

            // Draw Node
            ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
            ctx.fill();

            // Connect nearby nodes
            for(let j=i+1; j<nodes.length; j++) {
                const dx = nodes[j].x - node.x;
                const dy = nodes[j].y - node.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();

                    // Randomly spawn packet on this connection
                    if (Math.random() < packetSpawnRate && packets.length < 20) {
                        packets.push({
                            x: node.x,
                            y: node.y,
                            targetIndex: j,
                            speed: 0.02 + Math.random() * 0.03,
                            progress: 0
                        });
                    }
                }
            }
        });

        // Draw Moving Packets
        for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            const startNode = nodes.find(n => Math.abs(n.x - p.x) < 1 && Math.abs(n.y - p.y) < 1) || nodes[0]; // approximate find, actually we should store indices, but simplified here by just interpolating
            
            // Re-logic: We stored start coordinates, but nodes move. 
            // Better to store sourceIndex and targetIndex. 
            // For visual simplicity in this stateless frame loop, we'll just move 'p' towards target.
            
            const target = nodes[p.targetIndex];
            if (!target) {
                packets.splice(i, 1);
                continue;
            }

            const dx = target.x - p.x;
            const dy = target.y - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 5) {
                packets.splice(i, 1);
                continue;
            }

            p.x += (dx / dist) * 2; // Speed constant
            p.y += (dy / dist) * 2;

            ctx.fillStyle = '#38bdf8'; // Sky blue
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        animId = requestAnimationFrame(draw);
    };
    
    animId = requestAnimationFrame(draw);

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Back to top listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white relative font-sans flex flex-col animate-fade-in">
      {/* Background Canvas */}
      <div className="fixed inset-0 z-0 cyber-grid-bg opacity-30 pointer-events-none"></div>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      {/* Navigation */}
      <nav className="relative z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={scrollToTop}>
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors border border-slate-700 group-hover:border-sky-500/50 group-hover:shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                  <Cpu className="text-sky-500" size={24} />
                </div>
                <span className="font-mono text-lg md:text-xl font-bold tracking-widest text-white group-hover:text-sky-400 transition-colors">
                  LOAD_BALANCER_PRO
                </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-400 font-mono tracking-wide">
                <a href="#features" className="hover:text-sky-400 transition-colors hover:shadow-sky-500/20">FEATURES</a>
                <a href="#story" className="hover:text-sky-400 transition-colors">SYSTEM_STATUS</a>
                <a href="#contact" className="hover:text-sky-400 transition-colors">CONTACT</a>
                <button 
                    onClick={onStart}
                    className="bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold py-2 px-6 border border-sky-500/30 rounded transition-all hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:scale-105 active:scale-95 overflow-hidden relative group"
                >
                    <span className="relative z-10">ENTER CONSOLE</span>
                    <div className="absolute inset-0 h-full w-full bg-sky-400/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out skew-x-12"></div>
                </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-6 space-y-4 shadow-2xl animate-slide-in absolute w-full">
             <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-lg text-slate-400 hover:text-white font-mono border-b border-slate-800 pb-2">FEATURES</a>
             <a href="#story" onClick={() => setIsMenuOpen(false)} className="block text-lg text-slate-400 hover:text-white font-mono border-b border-slate-800 pb-2">SYSTEM_STATUS</a>
             <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-lg text-slate-400 hover:text-white font-mono border-b border-slate-800 pb-2">CONTACT</a>
             <button 
                onClick={() => { setIsMenuOpen(false); onStart(); }}
                className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold py-4 rounded-lg mt-4 shadow-lg active:scale-[0.98] transition-transform font-mono tracking-wider border border-sky-400/30"
            >
                >> ENTER CONSOLE
            </button>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative z-10 container mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
            <div className="inline-block px-4 py-1.5 mb-8 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                v2.4.0 System Online | Developed by Vickyiitp
            </div>
            <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight text-white drop-shadow-[0_0_35px_rgba(56,189,248,0.2)]">
              <div className="hover:animate-glitch inline-block">SCALE.</div><br/>
              <div className="hover:animate-glitch inline-block delay-75">ROUTE.</div><br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 text-glow">SURVIVE.</span>
            </h1>
            <p className="text-slate-400 text-base md:text-xl max-w-2xl mb-12 leading-relaxed px-4 font-light">
                The world's first high-fidelity load balancing simulator. 
                Manage millions of requests. Prevent server meltdown. 
                <span className="text-slate-200 font-semibold"> Keep the internet alive.</span>
            </p>
            <button 
                onClick={onStart}
                className="group relative inline-flex items-center justify-center px-10 py-6 text-lg font-bold text-white transition-all duration-200 bg-sky-600 font-mono rounded-xl hover:bg-sky-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] border border-sky-400/50 overflow-hidden"
            >
                <span className="relative z-10 flex items-center">
                  INITIALIZE_GAME()
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Scanline effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:animate-scan"></div>
            </button>
            
            <div className="absolute bottom-8 animate-bounce text-slate-600 hidden md:block">
                <ChevronDown className="opacity-50" />
            </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="relative z-10 bg-slate-950/50 py-24 backdrop-blur-sm border-y border-slate-800">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">CORE MECHANICS</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 mx-auto rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group bg-slate-900/50 border border-slate-800 p-8 rounded-xl hover:border-sky-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:-translate-y-2 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-sky-500/20 transition-colors border border-slate-700 group-hover:border-sky-500/50">
                            <Activity className="text-sky-400" size={28} />
                        </div>
                        <h3 className="font-mono text-xl font-bold mb-3 text-white">Traffic Routing</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Incoming packets must be manually routed to active server nodes. Balance the load to prevent bottlenecks.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group bg-slate-900/50 border border-slate-800 p-8 rounded-xl hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:-translate-y-2 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors border border-slate-700 group-hover:border-red-500/50">
                            <Thermometer className="text-red-400" size={28} />
                        </div>
                        <h3 className="font-mono text-xl font-bold mb-3 text-white">Thermal Management</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Every request generates heat. Overheated servers crash and require costly reboots. Monitor thermals closely.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group bg-slate-900/50 border border-slate-800 p-8 rounded-xl hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-2 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors border border-slate-700 group-hover:border-emerald-500/50">
                            <Server className="text-emerald-400" size={28} />
                        </div>
                        <h3 className="font-mono text-xl font-bold mb-3 text-white">Vertical Scaling</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Earn revenue from processed requests. Invest in better cooling and higher capacity processing units.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Story Section */}
        <section id="story" className="relative z-10 py-24 container mx-auto px-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl group">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                    <Shield size={300} />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30"></div>
                
                <div className="relative z-10 max-w-3xl">
                    <h2 className="font-mono text-3xl md:text-4xl font-bold mb-8 text-white">
                        MISSION BRIEFING: <span className="text-sky-400 bg-sky-900/20 px-2 rounded">SYSADMIN LEVEL 5</span>
                    </h2>
                    <div className="prose prose-invert prose-lg text-slate-300 text-sm md:text-lg">
                        <p className="mb-4 flex items-start">
                            <span className="text-sky-400 font-bold mr-2 mt-1 font-mono text-xs"> >> </span> 
                            <span>The year is 20X6. Global data consumption has exceeded 400 Zettabytes. 
                            Legacy infrastructure is crumbling under the weight of AI traffic and DDoS botnets.</span>
                        </p>
                        <p className="mb-6 flex items-start">
                            <span className="text-sky-400 font-bold mr-2 mt-1 font-mono text-xs"> >> </span> 
                            <span>You are the last line of defense. As the lead engineer for the Load Balancer Pro initiative, 
                            your job is to manually route critical data packets to the remaining functional server clusters.</span>
                        </p>
                        <p className="text-white font-bold italic border-l-4 border-sky-500 pl-4 py-4 bg-slate-900/50 rounded-r-lg shadow-inner">
                            "Can you keep the system online? Or will you let the network go dark?"
                        </p>
                    </div>
                    
                    <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-lg">
                                    {String.fromCharCode(64+i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-slate-400 font-mono flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Join 12,400+ SysAdmins currently online
                        </span>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="relative z-10 bg-slate-950 pt-20 pb-10 border-t border-slate-900 text-slate-400 text-sm">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <div className="md:col-span-1">
                    <div className="flex items-center space-x-2 mb-6 group">
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 group-hover:border-sky-500/50 transition-colors">
                            <Cpu className="text-sky-500" size={20} />
                        </div>
                        <span className="font-mono font-bold text-white text-lg group-hover:text-sky-400 transition-colors">Vickyiitp</span>
                    </div>
                    <p className="text-slate-500 mb-6 leading-relaxed">
                        Building the future of web gaming and AI. <br/> 
                        Based in IIT Patna.
                    </p>
                    <a 
                        href="https://vickyiitp.tech" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors font-bold group"
                    >
                        <Globe size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
                        vickyiitp.tech
                    </a>
                </div>

                {/* Socials */}
                <div className="md:col-span-1">
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-xs font-mono">Connect</h3>
                    <div className="flex flex-col space-y-4">
                         <a href="https://youtube.com/@vickyiitp" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-red-500 transition-colors">
                            <Youtube size={18} className="mr-3" /> YouTube
                         </a>
                         <a href="https://linkedin.com/in/vickyiitp" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500 transition-colors">
                            <Linkedin size={18} className="mr-3" /> LinkedIn
                         </a>
                         <a href="https://x.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white transition-colors">
                            <Twitter size={18} className="mr-3" /> X / Twitter
                         </a>
                         <a href="https://instagram.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-pink-500 transition-colors">
                            <Instagram size={18} className="mr-3" /> Instagram
                         </a>
                         <a href="https://github.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white transition-colors">
                            <Github size={18} className="mr-3" /> GitHub
                         </a>
                    </div>
                </div>

                {/* Contact */}
                <div className="md:col-span-1">
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-xs font-mono">Contact</h3>
                    <div className="flex flex-col space-y-4">
                        <a href="mailto:themvaplatform@gmail.com" className="flex items-center hover:text-sky-400 transition-colors break-all">
                            <Mail size={18} className="mr-3 flex-shrink-0" /> themvaplatform@gmail.com
                        </a>
                    </div>
                </div>

                {/* Legal */}
                <div className="md:col-span-1">
                     <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-xs font-mono">Legal</h3>
                     <div className="flex flex-col space-y-4">
                        <button onClick={onOpenPrivacy} className="text-left hover:text-white transition-colors">Privacy Policy</button>
                        <button onClick={onOpenTerms} className="text-left hover:text-white transition-colors">Terms of Service</button>
                     </div>
                </div>
            </div>

            <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                <div className="mb-4 md:mb-0">
                    &copy; 2025 Vickyiitp. All rights reserved.
                </div>
                <div>
                    Designed with <span className="text-red-500 animate-pulse">♥</span> by Vicky Kumar.
                </div>
            </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-sky-600 hover:bg-sky-500 text-white p-3 md:p-4 rounded-full shadow-2xl transition-all duration-300 z-50 hover:shadow-sky-500/50 hover:scale-110 ${showBackToTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <ArrowUp size={24} />
      </button>

    </div>
  );
};