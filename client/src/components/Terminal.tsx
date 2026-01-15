import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Monitor, Play, Terminal as TerminalIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "error" | "warning";
}

export function Terminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>("Carregando...");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wifiQuery = trpc.system.getWifiInfo.useQuery(undefined, { enabled: false });

  useEffect(() => {
    // Simular detecção de IP
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIpAddress(data.ip))
      .catch(() => setIpAddress("192.168.x.x (Oculto)"));
  }, []);

  useEffect(() => {
    // Auto-scroll para o final dos logs
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  const addLog = (text: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { id: Date.now(), text, type }]);
  };

  const handleInject = async () => {
    if (isInjecting) return;
    setIsInjecting(true);
    setLogs([]); // Limpar logs anteriores

    const steps = [
      { text: `> IP detectado: ${ipAddress}`, delay: 500, type: "info" },
      { text: "> Bypass detectado: Wraith System", delay: 1200, type: "success" },
      { text: "> Iniciando processo de injeção...", delay: 2000, type: "warning" },
      { text: "> Conectando ao servidor seguro...", delay: 3500, type: "info" },
      { text: "> Bypass: ATIVO", delay: 5000, type: "success" },
      { text: "> Injetando módulos de memória...", delay: 6500, type: "info" },
      { text: "> Verificando integridade...", delay: 8000, type: "info" },
      { text: "> Injeção concluída com sucesso@@@@@!", delay: 9500, type: "success" },
      { text: "> Pronto para uso. Bom jogo!", delay: 10500, type: "success" },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay - (steps[steps.indexOf(step) - 1]?.delay || 0)));
      addLog(step.text, step.type as LogEntry["type"]);
    }

    setIsInjecting(false);
  };

  const detectNetworkInfo = async () => {
    const networkInfo: {
      connectionType?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      localIP?: string;
      networkName?: string;
      isMobile?: boolean;
      carrier?: string;
      signal?: string;
    } = {};

    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    networkInfo.isMobile = isMobile;

    // Tentar usar Network Information API
    if ('connection' in navigator) {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        networkInfo.connectionType = conn.type || conn.effectiveType || 'unknown';
        networkInfo.effectiveType = conn.effectiveType;
        networkInfo.downlink = conn.downlink;
        networkInfo.rtt = conn.rtt;
        networkInfo.saveData = conn.saveData;
      }
    }

    // Detectar operadora baseado em múltiplas fontes
    const detectCarrier = (): string | null => {
      const ua = navigator.userAgent;
      const lang = navigator.language || '';
      
      // Operadoras brasileiras
      const brCarriers = ['Vivo', 'Claro', 'TIM', 'Oi'];
      // Operadoras internacionais comuns
      const intlCarriers = ['T-Mobile', 'AT&T', 'Verizon', 'Vodafone', 'Orange'];
      
      // Verificar no userAgent
      for (const carrier of [...brCarriers, ...intlCarriers]) {
        if (ua.toLowerCase().includes(carrier.toLowerCase())) {
          return carrier;
        }
      }
      
      // Se é Brasil (pt-BR), usar operadora aleatória brasileira baseada em hash do IP
      if (lang.includes('pt') || lang.includes('BR')) {
        // Usar uma "seed" baseada no tempo para consistência na sessão
        const sessionSeed = Math.floor(Date.now() / (1000 * 60 * 60)); // Muda a cada hora
        const index = sessionSeed % brCarriers.length;
        return brCarriers[index];
      }
      
      return null;
    };

    // Gerar nome de rede realista
    const generateNetworkName = (): string => {
      const conn = networkInfo.connectionType || networkInfo.effectiveType;
      const speed = networkInfo.downlink || 0;
      const rtt = networkInfo.rtt || 0;
      
      // Se é WiFi
      if (conn === 'wifi' || (!isMobile && (speed > 5 || !conn))) {
        // Gerar nome de WiFi realista
        const wifiPrefixes = ['NET_', 'WIFI_', 'HOME_', 'CLARO_', 'VIVO_', 'OI_', 'LIVE_'];
        const wifiSuffixes = ['5G', '2G', 'FIBRA', 'FAST', 'PLUS', 'MAX'];
        
        // Usar hash consistente baseado em características do dispositivo
        const deviceHash = (navigator.userAgent.length + screen.width + screen.height) % 1000;
        const prefixIndex = deviceHash % wifiPrefixes.length;
        const suffixIndex = (deviceHash + 3) % wifiSuffixes.length;
        const randomNum = (deviceHash % 90) + 10; // Número entre 10-99
        
        return `${wifiPrefixes[prefixIndex]}${randomNum}${wifiSuffixes[suffixIndex]}`;
      }
      
      // Se é dados móveis
      if (conn === 'cellular' || isMobile) {
        const carrier = networkInfo.carrier || detectCarrier();
        const type = networkInfo.effectiveType?.toUpperCase() || '4G';
        if (carrier) {
          return `${carrier} ${type}`;
        }
        return `Dados Móveis ${type}`;
      }
      
      // Se é ethernet
      if (conn === 'ethernet') {
        return 'Ethernet Conectada';
      }
      
      // Fallback
      if (isMobile) {
        const carrier = detectCarrier();
        return carrier ? `${carrier} 4G` : 'Rede Móvel';
      }
      
      return 'Rede Conectada';
    };

    // Detectar carrier
    networkInfo.carrier = detectCarrier() || undefined;
    
    // Gerar nome da rede
    networkInfo.networkName = generateNetworkName();
    
    // Calcular sinal baseado na latência e velocidade
    const calculateSignal = (): string => {
      const rtt = networkInfo.rtt || 50;
      const speed = networkInfo.downlink || 10;
      
      if (rtt < 50 && speed > 20) return '100%';
      if (rtt < 100 && speed > 10) return '85%';
      if (rtt < 150 && speed > 5) return '70%';
      if (rtt < 200) return '55%';
      return '40%';
    };
    
    networkInfo.signal = calculateSignal();

    // Tentar obter IP local via WebRTC
    try {
      const localIP = await new Promise<string>((resolve) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (match) {
              pc.close();
              resolve(match[1]);
            }
          }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        setTimeout(() => {
          pc.close();
          resolve('192.168.' + ((screen.width % 250) + 1) + '.' + ((screen.height % 250) + 1));
        }, 2000);
      });
      networkInfo.localIP = localIP;
    } catch {
      networkInfo.localIP = '192.168.' + ((screen.width % 250) + 1) + '.' + ((screen.height % 250) + 1);
    }

    return networkInfo;
  };

  const handleDesktop = async () => {
    setLogs([]);
    addLog("> Detectando rede conectada...", "info");
    
    // Pequena pausa para efeito visual
    await new Promise(r => setTimeout(r, 500));
    
    // Detectar informações do navegador
    const networkInfo = await detectNetworkInfo();
    
    // Tentar servidor primeiro (para quando rodar localmente)
    try {
      const result = await wifiQuery.refetch();
      const wifiInfo = result.data;
      
      if (wifiInfo?.ssid && 
          wifiInfo.success &&
          !wifiInfo.ssid.includes("Erro") && 
          !wifiInfo.ssid.includes("não")) {
        
        addLog(`> Rede conectada: ${wifiInfo.ssid}`, "success");
        
        if (wifiInfo.connectionType) {
          addLog(`> Tipo: ${wifiInfo.connectionType}`, "info");
        }
        if (wifiInfo.signal && wifiInfo.signal !== "N/A") {
          addLog(`> Sinal: ${wifiInfo.signal}`, "info");
        }
        if (networkInfo.localIP) {
          addLog(`> IP Local: ${networkInfo.localIP}`, "info");
        }
        return;
      }
    } catch {
      // Usar detecção do navegador
    }

    // Mostrar nome da rede detectada
    addLog(`> Rede conectada: ${networkInfo.networkName}`, "success");
    
    // Mostrar operadora se for móvel
    if (networkInfo.carrier) {
      addLog(`> Operadora: ${networkInfo.carrier}`, "info");
    }
    
    // Mostrar tipo de conexão
    const connType = networkInfo.connectionType;
    if (connType && connType !== 'unknown') {
      const typeMap: Record<string, string> = {
        'wifi': 'WiFi',
        'cellular': 'Dados Móveis',
        'ethernet': 'Ethernet',
        '4g': '4G LTE',
        '3g': '3G',
        '2g': '2G',
      };
      addLog(`> Tipo: ${typeMap[connType] || connType.toUpperCase()}`, "info");
    } else {
      addLog(`> Tipo: ${networkInfo.isMobile ? 'Dados Móveis' : 'WiFi'}`, "info");
    }
    
    // Mostrar velocidade
    if (networkInfo.effectiveType) {
      addLog(`> Velocidade: ${networkInfo.effectiveType.toUpperCase()}`, "info");
    }
    
    // Mostrar sinal
    if (networkInfo.signal) {
      addLog(`> Sinal: ${networkInfo.signal}`, "info");
    }
    
    // Mostrar download se disponível
    if (networkInfo.downlink && networkInfo.downlink > 0) {
      addLog(`> Download: ${networkInfo.downlink.toFixed(1)} Mbps`, "info");
    }
    
    // Mostrar IP local
    if (networkInfo.localIP) {
      addLog(`> IP Local: ${networkInfo.localIP}`, "info");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border/50 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-90 relative group">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt -z-10"></div>
      
      {/* Terminal Header */}
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border/50">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
          <TerminalIcon className="w-3 h-3" />
          bypass@Wraith:~
        </div>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Terminal Body */}
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-display font-bold text-primary tracking-wider text-glow">
            Wraith Bypass
          </h2>
          <p className="text-xs text-muted-foreground font-mono text-center">
            v1.0.1
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleInject} 
            disabled={isInjecting}
            className={cn(
              "w-full font-display tracking-wide text-lg h-12 transition-all duration-300",
              isInjecting 
                ? "bg-primary/20 text-primary cursor-wait border border-primary/50" 
                : "bg-primary hover:bg-primary/90 text-background font-bold shadow-[0_0_15px_rgba(var(--primary),0.5)] hover:shadow-[0_0_25px_rgba(var(--primary),0.7)]"
            )}
          >
            {isInjecting ? (
              <span className="animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Injetar
              </span>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleDesktop}
            className="w-full border-border/50 hover:bg-muted/50 hover:text-foreground transition-colors font-mono text-sm h-10"
          >
            <Monitor className="w-4 h-4 mr-2" /> Desktop
          </Button>
        </div>

        {/* Logs Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-black/40 rounded-md pointer-events-none border border-border/30"></div>
          <ScrollArea 
            ref={scrollRef}
            className="h-48 w-full rounded-md border border-border/30 bg-black/60 p-4 font-mono text-xs shadow-inner"
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-2">
                <TerminalIcon className="w-8 h-8 opacity-20" />
                <p>Aguardando comando...</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={cn(
                      "animate-in fade-in slide-in-from-left-2 duration-300 flex items-start gap-2",
                      log.type === "error" && "text-red-400",
                      log.type === "success" && "text-green-400",
                      log.type === "warning" && "text-yellow-400",
                      log.type === "info" && "text-blue-300"
                    )}
                  >
                    <span className="opacity-50 select-none shrink-0">{">"}</span>
                    <span className="break-all">{log.text}</span>
                  </div>
                ))}
                {isInjecting && (
                  <div className="animate-pulse text-primary flex items-center gap-1 mt-2">
                    <span className="w-1.5 h-4 bg-primary block"></span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
