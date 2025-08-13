import React from 'react';
import { Button } from './ui/button';
import campLogo from '@/assets/camp-logo.png';

interface GameOverlayProps {
  type: 'start' | 'gameOver';
  score?: number;
  wave?: number;
  onStart: () => void;
  onRestart: () => void;
  onShare: () => void;
  visible: boolean;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  type,
  score = 0,
  wave = 1,
  onStart,
  onRestart,
  onShare,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
      <div className="bg-card/90 border border-border backdrop-blur-lg rounded-3xl p-8 text-center max-w-2xl mx-4 shadow-2xl">
        <img 
          src={campLogo} 
          alt="Camp Network logo" 
          className="w-18 h-18 object-contain rounded-2xl bg-background border border-border mx-auto mb-4"
        />
        
        {type === 'start' ? (
          <>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Protect Your Ideas</h1>
            <p className="text-muted-foreground mb-6">
              You are the <strong className="text-primary">Camp Network Shield</strong>. AI bots are trying to steal art, music, code and research.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-primary/20 border border-primary/40 text-foreground px-3 py-2 rounded-full text-sm font-medium">
                Click / Tap bots to neutralize
              </div>
              <div className="bg-primary/20 border border-primary/40 text-foreground px-3 py-2 rounded-full text-sm font-medium">
                Save ideas to earn score
              </div>
              <div className="bg-primary/20 border border-primary/40 text-foreground px-3 py-2 rounded-full text-sm font-medium">
                Avoid losing all lives
              </div>
              <div className="bg-primary/20 border border-primary/40 text-foreground px-3 py-2 rounded-full text-sm font-medium">
                Use Overdrive when shield is full (press <kbd className="bg-muted px-1 rounded">O</kbd>)
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
              <Button onClick={onStart} variant="game" size="lg" className="text-lg px-8">
                ▶ Start Game
              </Button>
              <Button asChild variant="camp" size="lg">
                <a href="https://linktr.ee/camp_network" target="_blank" rel="noopener">
                  ⛺ Visit Camp Network
                </a>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Press <strong>Start</strong> or hit <kbd className="bg-muted px-1 rounded">Space</kbd> to begin.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {score > 1000 ? 'Well Played!' : 'All Ideas Stolen 💔'}
            </h1>
            <p className="text-muted-foreground mb-6">
              Your on-chain shield held the line.
            </p>
            <p className="text-xl font-bold text-primary mb-6">
              Score: {score.toLocaleString()} • Wave: {wave}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
              <Button onClick={onRestart} variant="game" size="lg">
                🔁 Play Again
              </Button>
              <Button onClick={onShare} variant="game" size="lg">
                📤 Share Score
              </Button>
              <Button asChild variant="camp" size="lg">
                <a href="https://linktr.ee/camp_network" target="_blank" rel="noopener">
                  ⛺ Camp Linktree
                </a>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Tip: Rapid taps build <strong>Combo</strong> for bonus points.
            </p>
          </>
        )}
      </div>
    </div>
  );
};