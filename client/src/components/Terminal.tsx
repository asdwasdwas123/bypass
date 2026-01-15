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
    } = {};

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
          resolve('Não detectado');
        }, 2000);
      });
      networkInfo.localIP = localIP;
    } catch {
      networkInfo.localIP = 'Não detectado';
    }

    return networkInfo;
  };

  const handleDesktop = async () => {
    setLogs([]);
    addLog("> Detectando rede conectada...", "info");
    
    // PRIORIDADE: Tentar detectar nome da rede no servidor primeiro
    try {
      const result = await wifiQuery.refetch();
      const wifiInfo = result.data;
      
      // Se encontrou nome da rede (SSID), mostrar com destaque
      if (wifiInfo?.ssid && 
          !wifiInfo.ssid.includes("Nenhuma") && 
          !wifiInfo.ssid.includes("Erro") && 
          !wifiInfo.ssid.includes("não possui") &&
          !wifiInfo.ssid.includes("Rede não detectada")) {
        
        addLog(`> Rede conectada: ${wifiInfo.ssid}`, "success");
        
        if (wifiInfo.connectionType) {
          addLog(`> Tipo: ${wifiInfo.connectionType}`, "info");
        }
        
        if (wifiInfo.state && wifiInfo.state !== "Erro" && wifiInfo.state !== "Desconhecido") {
          addLog(`> Estado: ${wifiInfo.state}`, "info");
        }
        
        if (wifiInfo.signal && wifiInfo.signal !== "N/A" && !wifiInfo.signal.includes("Ethernet")) {
          addLog(`> Sinal: ${wifiInfo.signal}`, "info");
        }
        
        // Se tem IP local, mostrar também
        try {
          const networkInfo = await detectNetworkInfo();
          if (networkInfo.localIP && networkInfo.localIP !== 'Não detectado') {
            addLog(`> IP Local: ${networkInfo.localIP}`, "info");
          }
        } catch {
          // Ignorar
        }
        
        return; // Sair se encontrou a rede
      }
      
      // Se não encontrou, mostrar informações alternativas
      if (wifiInfo?.error) {
        addLog(`> ${wifiInfo.error}`, "warning");
      }
    } catch (error) {
      addLog("> Erro ao conectar com o servidor...", "warning");
    }

    // Fallback: Mostrar informações de rede do navegador
    try {
      const networkInfo = await detectNetworkInfo();
      
      if (networkInfo.connectionType && networkInfo.connectionType !== 'unknown') {
        addLog(`> Tipo de conexão: ${networkInfo.connectionType}`, "info");
        if (networkInfo.effectiveType) {
          addLog(`> Velocidade efetiva: ${networkInfo.effectiveType}`, "info");
        }
      }
      
      if (networkInfo.localIP && networkInfo.localIP !== 'Não detectado') {
        addLog(`> IP Local: ${networkInfo.localIP}`, "info");
      }
      
      if (!networkInfo.connectionType || networkInfo.connectionType === 'unknown') {
        addLog("> Nome da rede não disponível via navegador", "warning");
        addLog("> (Limitação de segurança do navegador)", "info");
      }
    } catch (error) {
      addLog("> Não foi possível detectar informações de rede", "error");
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
