import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onLoadingComplete, minDuration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const loadingMessages = [
    "Inicializando sistema...",
    "Carregando módulos...",
    "Conectando ao servidor...",
    "Verificando integridade...",
    "Preparando interface...",
    "Sistema pronto."
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      // Update status text based on progress
      const messageIndex = Math.min(
        Math.floor((newProgress / 100) * loadingMessages.length),
        loadingMessages.length - 1
      );
      setStatusText(loadingMessages[messageIndex]);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onLoadingComplete, 500);
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,200,255,0.03)_2px,rgba(0,200,255,0.03)_4px)] animate-pulse"></div>
        
        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-primary/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with Glitch Effect */}
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          {/* Glitch layers */}
          <img
            src="/images/logo-icon.png"
            alt="Wraith"
            className="absolute inset-0 w-full h-full object-contain opacity-50 animate-glitch-1"
            style={{ filter: "hue-rotate(90deg)" }}
          />
          <img
            src="/images/logo-icon.png"
            alt="Wraith"
            className="absolute inset-0 w-full h-full object-contain opacity-50 animate-glitch-2"
            style={{ filter: "hue-rotate(-90deg)" }}
          />
          {/* Main logo */}
          <img
            src="/images/logo-icon.png"
            alt="Wraith"
            className="relative w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,200,255,0.8)] animate-pulse"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-[0.3em] text-foreground/90">
            WRAITH <span className="text-primary">BYPASS</span>
          </h1>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 md:w-80 space-y-3">
          {/* Progress Bar */}
          <div className="relative h-1 bg-border/30 rounded-full overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer"></div>
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Glow effect on progress */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full blur-md"></div>
            </div>
          </div>

          {/* Status Text */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground/80 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              {statusText}
              <span className="animate-blink">_</span>
            </span>
            <span className="text-primary/80">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Terminal-style footer */}
        <div className="mt-8 text-xs font-mono text-muted-foreground/40 text-center space-y-1">
          <p>v2.0.1 | Wraith Security Systems</p>
          <p className="text-primary/40">bypass@Wraith:~</p>
        </div>
      </div>
    </div>
  );
}
