/**
 * Discovery animation system
 * 
 * When a new topic is discovered (link becomes visible), this system:
 * 1. Creates a burst of stardust particles at the link location
 * 2. Animates a "flying" element from the link to the quest log sidebar
 * 3. Highlights the newly added item in the sidebar
 */

import { useEffect, useRef } from 'preact/hooks';
import { onDiscovery } from '../progress.ts';
import { getNodeMeta } from '../../content/_registry.ts';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface FlyingElement {
  id: number;
  nodeId: string;
  title: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
}

let particleIdCounter = 0;
let flyingIdCounter = 0;

export function DiscoveryAnimationLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const flyingRef = useRef<FlyingElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  
  // Start animation loop
  const startAnimation = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      // Resize canvas if needed
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0.01);
      
      for (const particle of particlesRef.current) {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.vx *= 0.98; // Air resistance
        particle.opacity *= 0.96;
        particle.size *= 0.98;
        
        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, 1)`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, 60%, 0.5)`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 90%, 1)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
      
      // Update flying elements
      flyingRef.current = flyingRef.current.filter(f => f.progress < 1);
      
      for (const flying of flyingRef.current) {
        flying.progress += 0.025; // Speed of flight
        
        // Eased position along bezier curve
        const t = easeOutCubic(Math.min(1, flying.progress));
        
        // Control point for arc (above the line)
        const midX = (flying.startX + flying.endX) / 2;
        const midY = Math.min(flying.startY, flying.endY) - 100;
        
        // Quadratic bezier
        const x = quadraticBezier(flying.startX, midX, flying.endX, t);
        const y = quadraticBezier(flying.startY, midY, flying.endY, t);
        
        // Draw trail
        ctx.save();
        ctx.globalAlpha = 0.3 * (1 - flying.progress);
        
        for (let i = 0; i < 5; i++) {
          const trailT = Math.max(0, t - i * 0.05);
          const trailX = quadraticBezier(flying.startX, midX, flying.endX, trailT);
          const trailY = quadraticBezier(flying.startY, midY, flying.endY, trailT);
          
          ctx.fillStyle = `hsla(45, 100%, ${70 - i * 10}%, ${0.8 - i * 0.15})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, 4 - i * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        
        // Draw flying orb
        ctx.save();
        ctx.globalAlpha = 1 - flying.progress * 0.3;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, 'hsla(45, 100%, 80%, 1)');
        gradient.addColorStop(0.5, 'hsla(45, 100%, 60%, 0.5)');
        gradient.addColorStop(1, 'hsla(45, 100%, 50%, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = 'hsla(45, 100%, 95%, 1)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Spawn trail particles occasionally
        if (Math.random() < 0.3) {
          particlesRef.current.push({
            id: particleIdCounter++,
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 2,
            opacity: 0.8,
            hue: 40 + Math.random() * 20,
          });
        }
      }
      
      // Continue animation if there are active elements
      if (particlesRef.current.length > 0 || flyingRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // Create particle burst
  const createParticleBurst = (x: number, y: number) => {
    const particleCount = 12 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      
      particlesRef.current.push({
        id: particleIdCounter++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        size: 3 + Math.random() * 4,
        opacity: 1,
        hue: 45 + Math.random() * 30, // Golden/yellow range
      });
    }
    
    startAnimation();
  };
  
  // Handle new discoveries
  useEffect(() => {
    const unsubscribe = onDiscovery(async (nodeId, sourceElement) => {
      console.log('Discovery animation triggered for:', nodeId);
      
      // Get the position of the source link
      const rect = sourceElement.getBoundingClientRect();
      const sourceX = rect.left + rect.width / 2;
      const sourceY = rect.top + rect.height / 2;
      
      // Get the position of the quest log toggle (target)
      const questToggle = document.querySelector('.progress-toggle');
      let targetX = window.innerWidth - 100;
      let targetY = 60;
      
      if (questToggle) {
        const toggleRect = questToggle.getBoundingClientRect();
        targetX = toggleRect.left + toggleRect.width / 2;
        targetY = toggleRect.top + toggleRect.height / 2;
      }
      
      // Create particle burst at source
      createParticleBurst(sourceX, sourceY);
      
      // Get the node title for the flying element
      let title = nodeId;
      const nodeMeta = getNodeMeta(nodeId);
      if (nodeMeta?.title) {
        title = nodeMeta.title;
      }
      
      // Create flying element
      flyingRef.current.push({
        id: flyingIdCounter++,
        nodeId,
        title,
        startX: sourceX,
        startY: sourceY,
        endX: targetX,
        endY: targetY,
        progress: 0,
      });
      
      // Ensure animation is running
      startAnimation();
      
      // Flash the quest toggle
      questToggle?.classList.add('progress-toggle--flash');
      setTimeout(() => {
        questToggle?.classList.remove('progress-toggle--flash');
      }, 600);
    });
    
    return () => {
      unsubscribe();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="discovery-canvas"
      aria-hidden="true"
    />
  );
}

// Easing function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Quadratic bezier
function quadraticBezier(p0: number, p1: number, p2: number, t: number): number {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}
