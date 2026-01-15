import { Terminal } from "@/components/Terminal";
import { Youtube } from "lucide-react";

// Ícone personalizado do Discord
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    role="img" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor" 
    className={className}
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0276c1.9506-.6066 3.9401-1.5218 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative bg-background overflow-auto">
      {/* Background Elements & Custom Lightning Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Static Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        
        {/* Radial Gradient Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-primary/5 blur-[150px] rounded-full"></div>
        
        {/* Custom Lightning Particles */}
        <div className="lightning-particle particle-1"></div>
        <div className="lightning-particle particle-2"></div>
        <div className="lightning-particle particle-3"></div>
        <div className="lightning-particle particle-4"></div>
        <div className="lightning-particle particle-5"></div>
        <div className="lightning-particle particle-6"></div>
      </div>

      {/* Header / Nav - Compact */}
      <header className="relative z-50 w-full border-b border-border/20 bg-background/30 backdrop-blur-sm h-12 shrink-0">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/images/logo-icon.png" 
              alt="Wraith Logo" 
              className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]"
            />
            <span className="font-display font-bold text-sm tracking-widest text-foreground/90">
              WRAITH <span className="text-primary">BYPASS</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://discord.gg/xg5jgExNpB" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#5865F2] transition-colors duration-300 hover:scale-110"
            >
              <DiscordIcon className="w-4 h-4" />
            </a>
            <a 
              href="https://www.youtube.com/@swagxxxxxxxxxxx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#FF0000] transition-colors duration-300 hover:scale-110"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - Stacked Layout (Icon on top, Terminal below) */}
      <main className="flex-1 relative z-10 container flex items-center justify-center py-4 overflow-auto">
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[550px]">
          
          {/* Ghost Icon - Top */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 animate-float shrink-0">
            {/* Image Glow Behind */}
            <div className="absolute inset-0 bg-primary/30 blur-[40px] rounded-full animate-pulse"></div>
            <img 
              src="/images/logo-icon.png" 
              alt="Wraith Icon" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(0,200,255,0.6)]"
            />
          </div>

          {/* Terminal - Below */}
          <div className="w-full">
            <Terminal />
          </div>

        </div>
      </main>

      {/* Footer - Compact */}
      <footer className="relative z-50 border-t border-border/10 bg-background/20 backdrop-blur-sm py-2 shrink-0">
        <div className="container flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
          <div className="flex items-center gap-2">
            <span>&copy; 2026 Wraith System</span>
          </div>
          
          <div>
            Dev: <span className="text-primary/70">japa4m</span> & <span className="text-primary/70">Swag</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
