import React from 'react';

interface GameHUDProps {
  score: number;
  wave: number;
  lives: number;
  shield: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ score, wave, lives, shield }) => {
  return (
    <div className="absolute left-4 top-4 flex gap-3 flex-wrap" role="complementary" aria-live="polite">
      <div className="bg-card/80 border border-border backdrop-blur-sm px-3 py-2 rounded-xl font-bold text-foreground">
        Score: {score.toLocaleString()}
      </div>
      <div className="bg-card/80 border border-border backdrop-blur-sm px-3 py-2 rounded-xl font-bold text-foreground">
        Level: {wave}
      </div>
      <div className="bg-card/80 border border-border backdrop-blur-sm px-3 py-2 rounded-xl font-bold text-foreground">
        Ideas Safe: {lives}
      </div>
      <div className="bg-card/80 border border-border backdrop-blur-sm px-3 py-2 rounded-xl font-bold text-foreground">
        Shield: {Math.round(shield)}%
      </div>
    </div>
  );
};