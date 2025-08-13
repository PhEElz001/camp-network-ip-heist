import React from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import campLogo from '@/assets/camp-logo.png';

interface GameControlsProps {
  onStart: () => void;
  onPause: () => void;
  isRunning: boolean;
  isPaused: boolean;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onStart,
  onPause,
  isRunning,
  isPaused,
  soundEnabled,
  onSoundToggle
}) => {
  return (
    <header className="w-full max-w-6xl flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        <img 
          src={campLogo} 
          alt="Camp Network logo" 
          className="w-12 h-12 rounded-xl bg-background border border-border object-contain"
        />
        <div>
          <div className="text-lg font-bold text-foreground">
            Camp Network — <span className="text-primary">IP Heist</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Catch the AI thieves. Secure the ideas. ⛺🛡️
          </div>
        </div>
      </div>
      
      <div className="bg-card/70 border border-border backdrop-blur-sm rounded-2xl p-3 flex items-center gap-4">
        <Button 
          onClick={onStart} 
          variant="game" 
          disabled={isRunning}
          className="text-sm px-4"
        >
          ▶ Start
        </Button>
        <Button 
          onClick={onPause} 
          variant="game" 
          disabled={!isRunning}
          className="text-sm px-4"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </Button>
        <div className="flex items-center gap-2">
          <Switch 
            id="sound-toggle"
            checked={soundEnabled}
            onCheckedChange={onSoundToggle}
          />
          <Label htmlFor="sound-toggle" className="text-sm font-medium cursor-pointer">
            Sound
          </Label>
        </div>
      </div>
    </header>
  );
};