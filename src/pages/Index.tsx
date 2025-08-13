import React, { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameControls } from '@/components/GameControls';
import { GameHUD } from '@/components/GameHUD';
import { GameOverlay } from '@/components/GameOverlay';
import { Toast } from '@/components/Toast';

interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  wave: number;
  lives: number;
  shield: number;
  overdrive: boolean;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    running: false,
    paused: false,
    score: 0,
    wave: 1,
    lives: 3,
    shield: 100,
    overdrive: false
  });
  
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      running: true,
      paused: false,
      score: 0,
      wave: 1,
      lives: 3,
      shield: 100,
      overdrive: false
    });
    setShowStartOverlay(false);
    setShowGameOverOverlay(false);
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(prev => ({ ...prev, running: false }));
    setShowGameOverOverlay(true);
  }, []);

  const handleGameStateUpdate = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleShare = useCallback(() => {
    const text = `I scored ${gameState.score.toLocaleString()} in Camp Network – IP Heist! #CampNetwork #Web3`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ title: 'IP Heist', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      showToast('Score copied to clipboard ✅');
    }
  }, [gameState.score, showToast]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!gameState.running) {
          startGame();
        } else {
          pauseGame();
        }
        e.preventDefault();
      }
      
      if (e.key === 'p' || e.key === 'P') {
        if (gameState.running) {
          pauseGame();
        }
      }
      
      if (e.key === 'o' || e.key === 'O') {
        if (gameState.shield >= 100 && !gameState.overdrive) {
          setGameState(prev => ({ ...prev, overdrive: true }));
          showToast('OVERDRIVE ⚡');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.running, gameState.shield, gameState.overdrive, startGame, pauseGame, showToast]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center gap-4 p-4"
      style={{ background: 'var(--gradient-bg), hsl(var(--background))' }}
    >
      <GameControls
        onStart={startGame}
        onPause={pauseGame}
        isRunning={gameState.running}
        isPaused={gameState.paused}
        soundEnabled={soundEnabled}
        onSoundToggle={setSoundEnabled}
      />

      <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl">
        <GameCanvas
          gameState={gameState}
          onGameStateUpdate={handleGameStateUpdate}
          onGameOver={handleGameOver}
          soundEnabled={soundEnabled}
        />
        
        <GameHUD
          score={gameState.score}
          wave={gameState.wave}
          lives={gameState.lives}
          shield={gameState.shield}
        />

        <GameOverlay
          type="start"
          onStart={startGame}
          onRestart={startGame}
          onShare={handleShare}
          visible={showStartOverlay}
        />

        <GameOverlay
          type="gameOver"
          score={gameState.score}
          wave={gameState.wave}
          onStart={startGame}
          onRestart={startGame}
          onShare={handleShare}
          visible={showGameOverOverlay}
        />

        <Toast
          message={toast.message}
          visible={toast.visible}
          onHide={hideToast}
        />
      </div>

      <footer className="text-center text-sm text-muted-foreground max-w-2xl">
        <p className="mb-3">
          Built for fun by you. Inspired by Camp Network's mission: protect, prove, monetize IP.
        </p>
        <a 
          href="https://linktr.ee/camp_network" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          ⛺ Visit Camp Network on Linktree
        </a>
      </footer>
    </div>
  );
};

export default Index;
