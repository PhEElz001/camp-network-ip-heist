import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Idea {
  x: number;
  y: number;
  r: number;
  kind: {
    t: string;
    color: string;
    emoji: string;
  };
  lock: number;
}

interface Bot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  r: number;
  hp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GameCanvasProps {
  gameState: {
    running: boolean;
    paused: boolean;
    score: number;
    wave: number;
    lives: number;
    shield: number;
    overdrive: boolean;
  };
  onGameStateUpdate: (updates: Partial<GameCanvasProps['gameState']>) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

const ICONS = [
  { t: 'Art', color: '#ffb38a', emoji: '🎨' },
  { t: 'Music', color: '#ffd27a', emoji: '🎵' },
  { t: 'Code', color: '#b3e5ff', emoji: '💻' },
  { t: 'Research', color: '#d6ffa6', emoji: '🔬' }
];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameStateUpdate,
  onGameOver,
  soundEnabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameDataRef = useRef({
    ideas: [] as Idea[],
    bots: [] as Bot[],
    particles: [] as Particle[],
    frame: 0,
    combo: 0,
    overdriveTimer: 0,
    pointer: { x: 0, y: 0 }
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const beep = useCallback((freq = 600, time = 0.06, type: OscillatorType = 'sine', vol = 0.02) => {
    if (!soundEnabled) return;
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return;
      }
    }
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    osc.start();
    setTimeout(() => osc.stop(), time * 1000);
  }, [soundEnabled]);

  const rng = (min: number, max: number) => Math.random() * (max - min) + min;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  const spawnIdea = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const x = rng(100, canvas.width - 100);
    const y = rng(100, canvas.height - 100);
    const kind = ICONS[Math.floor(rng(0, ICONS.length))];
    gameDataRef.current.ideas.push({ x, y, r: 18, kind, lock: 0 });
  }, []);

  const spawnBot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate level based on score (every 15 points = new level)
    const currentLevel = Math.floor(gameState.score / 15) + 1;

    const edge = Math.floor(rng(0, 4));
    let x: number, y: number;
    
    if (edge === 0) { x = rng(0, canvas.width); y = -20; }
    else if (edge === 1) { x = canvas.width + 20; y = rng(0, canvas.height); }
    else if (edge === 2) { x = rng(0, canvas.width); y = canvas.height + 20; }
    else { x = -20; y = rng(0, canvas.height); }

    // Much slower initial speed, gradual increase based on level
    const baseSpeed = 0.3; // Start much slower
    const speedIncrease = 0.1; // Smaller increments
    const speed = baseSpeed + (currentLevel - 1) * speedIncrease;
    
    // HP increases every 3 levels instead of every 3 waves
    const hp = 1 + Math.floor((currentLevel - 1) / 3);
    gameDataRef.current.bots.push({ x, y, vx: 0, vy: 0, speed, r: 14, hp });
  }, [gameState.score]);

  const addParticle = useCallback((x: number, y: number, color: string) => {
    gameDataRef.current.particles.push({
      x, y,
      vx: rng(-1.3, 1.3),
      vy: rng(-1.3, 1.3),
      life: 30,
      color
    });
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.running || gameState.paused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (!gameState.overdrive) {
      if (gameState.shield < 6) {
        beep(240, 0.05, 'square', 0.03);
        return;
      }
      onGameStateUpdate({ shield: clamp(gameState.shield - 6, 0, 100) });
    }

    let hit = false;
    for (let i = gameDataRef.current.bots.length - 1; i >= 0; i--) {
      const bot = gameDataRef.current.bots[i];
      const distance = Math.hypot(bot.x - x, bot.y - y);
      
      if (distance < 24) {
        bot.hp -= 1;
        addParticle(x, y, '#ff4d4f');
        
        if (bot.hp <= 0) {
          gameDataRef.current.bots.splice(i, 1);
          gameDataRef.current.combo = clamp(gameDataRef.current.combo + 1, 0, 100);
          onGameStateUpdate({ score: gameState.score + 10 + gameDataRef.current.combo });
          beep(820, 0.05, 'sawtooth', 0.02);
        } else {
          beep(520, 0.04, 'square', 0.02);
        }
        hit = true;
        break;
      }
    }
    
    if (!hit) {
      gameDataRef.current.combo = 0;
    }
  }, [gameState, onGameStateUpdate, beep, addParticle]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    gameDataRef.current.pointer.x = event.clientX - rect.left;
    gameDataRef.current.pointer.y = event.clientY - rect.top;
  }, []);

  const drawGlow = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
    const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = 'rgba(255,122,0,0.18)';
    ctx.lineWidth = 1;
    const gap = 40;
    
    for (let x = 0; x < canvas.width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw ideas
    gameDataRef.current.ideas.forEach(idea => {
      drawGlow(ctx, idea.x, idea.y, 28, idea.kind.color);
      ctx.fillStyle = idea.kind.color;
      ctx.beginPath();
      ctx.arc(idea.x, idea.y, idea.r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#0a0a0f';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(idea.kind.emoji, idea.x, idea.y);
      
      if (idea.lock > 0) {
        ctx.strokeStyle = '#ff7a00';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(idea.x, idea.y, idea.r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw bots
    gameDataRef.current.bots.forEach(bot => {
      drawGlow(ctx, bot.x, bot.y, 24, 'rgba(255,77,79,0.55)');
      ctx.save();
      ctx.translate(bot.x, bot.y);
      const angle = Math.atan2(bot.vy, bot.vx);
      ctx.rotate(angle);
      
      ctx.fillStyle = '#ff4d4f';
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(14, 0);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(4, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(4, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      if (bot.hp > 1) {
        const maxHp = 1 + Math.floor(gameState.wave / 3);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(bot.x - 12, bot.y - 20, 24, 4);
        ctx.fillStyle = '#ff4d4f';
        ctx.fillRect(bot.x - 12, bot.y - 20, 24 * (bot.hp / maxHp), 4);
      }
    });

    // Draw particles
    for (let i = gameDataRef.current.particles.length - 1; i >= 0; i--) {
      const p = gameDataRef.current.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.vy += 0.02;
      
      if (p.life <= 0) {
        gameDataRef.current.particles.splice(i, 1);
      } else {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
        ctx.globalAlpha = 1;
      }
    }

    // Draw crosshair
    const { x: px, y: py } = gameDataRef.current.pointer;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 14, py);
    ctx.lineTo(px + 14, py);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px, py + 14);
    ctx.stroke();
  }, [gameState.wave, drawGlow]);

  const update = useCallback(() => {
    if (!gameState.running || gameState.paused) return;

    const data = gameDataRef.current;
    data.frame++;

    // Calculate current level based on score
    const currentLevel = Math.floor(gameState.score / 15) + 1;
    
    // Update wave display to show current level
    if (currentLevel !== gameState.wave) {
      onGameStateUpdate({ wave: currentLevel });
    }

    // Spawn enemies - start slower, gradually increase frequency
    const baseSpawnRate = 90; // Much slower initial spawn rate
    const minSpawnRate = 20; // Minimum spawn rate at high levels
    const spawnRate = Math.max(minSpawnRate, baseSpawnRate - (currentLevel - 1) * 5);
    
    if (data.frame % spawnRate === 0) {
      spawnBot();
    }
    
    // Spawn ideas - slower rate, increases slightly with level
    const ideaSpawnRate = Math.max(120, 300 - (currentLevel - 1) * 10);
    if (data.frame % ideaSpawnRate === 0) {
      spawnIdea();
    }

    // Update shield and overdrive
    if (!gameState.overdrive) {
      onGameStateUpdate({ shield: clamp(gameState.shield + 0.3, 0, 100) }); // Slower shield regeneration
    } else {
      data.overdriveTimer -= 16;
      if (data.overdriveTimer <= 0) {
        onGameStateUpdate({ overdrive: false, shield: 0 });
      }
    }

    // Update bots
    for (let i = data.bots.length - 1; i >= 0; i--) {
      const bot = data.bots[i];
      
      // Find nearest idea
      let nearestIdea: Idea | null = null;
      let nearestDistance = Infinity;
      
      for (const idea of data.ideas) {
        const distance = Math.hypot(idea.x - bot.x, idea.y - bot.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIdea = idea;
        }
      }
      
      if (nearestIdea) {
        const dx = nearestIdea.x - bot.x;
        const dy = nearestIdea.y - bot.y;
        const distance = Math.hypot(dx, dy) || 1;
        
        bot.vx = (dx / distance) * bot.speed * (gameState.overdrive ? 0.5 : 1);
        bot.vy = (dy / distance) * bot.speed * (gameState.overdrive ? 0.5 : 1);
        bot.x += bot.vx;
        bot.y += bot.vy;
        
        // Check collision
        if (Math.hypot(nearestIdea.x - bot.x, nearestIdea.y - bot.y) < bot.r + nearestIdea.r) {
          if (nearestIdea.lock > 0) {
            nearestIdea.lock = Math.max(0, nearestIdea.lock - 0.5);
            addParticle(bot.x, bot.y, '#ffb38a');
            beep(300, 0.04, 'sine', 0.02);
            bot.vx *= -0.6;
            bot.vy *= -0.6;
          } else {
            data.ideas.splice(data.ideas.indexOf(nearestIdea), 1);
            data.bots.splice(i, 1);
            data.combo = 0;
            beep(180, 0.07, 'square', 0.03);
            
            for (let k = 0; k < 10; k++) {
              addParticle(nearestIdea.x, nearestIdea.y, '#ff9aa0');
            }
            
            const newLives = gameState.lives - 1;
            onGameStateUpdate({ lives: newLives });
            
            if (newLives <= 0) {
              onGameOver();
              return;
            }
          }
        }
      }
    }

    // Update idea locks
    data.ideas.forEach(idea => {
      if (idea.lock > 0) {
        idea.lock -= 0.35;
      }
    });

    // Random idea lock - less frequent at start, more frequent at higher levels
    const lockChance = 360 - (Math.floor(gameState.score / 15) * 20); // Start at 360 frames, decrease by 20 each level
    if (data.frame % Math.max(lockChance, 120) === 0 && data.ideas.length) {
      const randomIdea = data.ideas[Math.floor(rng(0, data.ideas.length))];
      randomIdea.lock = 100;
    }
  }, [gameState, onGameStateUpdate, onGameOver, spawnBot, spawnIdea, addParticle, beep]);

  useEffect(() => {
    if (gameState.running && !gameState.paused) {
      const gameLoop = () => {
        update();
        render();
        animationRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoop();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.running, gameState.paused, update, render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Initialize game with some ideas and bots
  useEffect(() => {
    if (gameState.running) {
      gameDataRef.current.ideas = [];
      gameDataRef.current.bots = [];
      gameDataRef.current.particles = [];
      gameDataRef.current.frame = 0;
      gameDataRef.current.combo = 0;
      gameDataRef.current.overdriveTimer = 0;
      
      // Spawn initial ideas and bots
      for (let i = 0; i < 4; i++) {
        spawnIdea();
        spawnBot();
      }
    }
  }, [gameState.running, spawnIdea, spawnBot]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-gradient-to-br from-background via-background to-muted/20 border border-border rounded-3xl cursor-crosshair"
      style={{
        background: 'var(--gradient-game)'
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      aria-label="IP Heist Game Canvas"
    />
  );
};