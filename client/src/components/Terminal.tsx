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
      localIP?: string;
      networkName?: string;
      isMobile?: boolean;
      isp?: string;
      signal?: string;
      city?: string;
      publicIP?: string;
    } = {};

    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    networkInfo.isMobile = isMobile;

    // Tentar usar Network Information API
    if ('connection' in navigator) {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        // type é o tipo real (wifi, cellular, ethernet), effectiveType é a velocidade (4g, 3g, etc)
        networkInfo.connectionType = conn.type || (isMobile ? 'cellular' : 'wifi');
        networkInfo.effectiveType = conn.effectiveType;
        networkInfo.downlink = conn.downlink;
        networkInfo.rtt = conn.rtt;
      }
    }

    // Se não tem tipo de conexão, assumir baseado no dispositivo
    if (!networkInfo.connectionType || networkInfo.connectionType === 'unknown') {
      networkInfo.connectionType = isMobile ? 'cellular' : 'wifi';
    }

    // DETECTAR ISP/PROVEDOR REAL via API de IP
    try {
      const ipResponse = await fetch('https://ip-api.com/json/?fields=status,isp,org,as,query,city,regionName');
      const ipData = await ipResponse.json();
      
      if (ipData.status === 'success') {
        networkInfo.publicIP = ipData.query;
        networkInfo.city = ipData.city;
        
        // Extrair nome do ISP/Provedor
        let ispName = ipData.isp || ipData.org || '';
        
        // Limpar e formatar o nome do ISP
        // Remover termos técnicos comuns
        ispName = ispName
          .replace(/S\.?A\.?/gi, '')
          .replace(/LTDA/gi, '')
          .replace(/TELECOMUNICA[CÇ][OÕ]ES/gi, '')
          .replace(/TELECOM/gi, '')
          .replace(/SERVICOS DE INTERNET/gi, '')
          .replace(/INTERNET/gi, '')
          .replace(/BANDA LARGA/gi, '')
          .replace(/FIBRA/gi, 'Fibra')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Identificar provedores conhecidos
        const knownISPs: { [key: string]: string } = {
          'claro': 'Claro',
          'net': 'NET',
          'vivo': 'Vivo',
          'tim': 'TIM',
          'oi': 'Oi',
          'gvt': 'GVT',
          'live': 'Live TIM',
          'algar': 'Algar',
          'brisanet': 'Brisanet',
          'desktop': 'Desktop',
          'copel': 'Copel',
          'sercomtel': 'Sercomtel',
          'unifique': 'Unifique',
          'americanet': 'Americanet',
          'vero': 'Vero',
          'sumicity': 'Sumicity',
          'mob': 'Mob Telecom',
        };
        
        const lowerIsp = ispName.toLowerCase();
        for (const [key, name] of Object.entries(knownISPs)) {
          if (lowerIsp.includes(key)) {
            networkInfo.isp = name;
            break;
          }
        }
        
        // Se não encontrou provedor conhecido, usar o nome detectado
        if (!networkInfo.isp && ispName.length > 2) {
          // Capitalizar primeira letra de cada palavra
          networkInfo.isp = ispName.split(' ')
            .filter(w => w.length > 1)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
            .substring(0, 30); // Limitar tamanho
        }
      }
    } catch (e) {
      console.log('Erro ao detectar ISP:', e);
    }

    // Se não conseguiu detectar ISP, tentar API alternativa
    if (!networkInfo.isp) {
      try {
        const altResponse = await fetch('https://ipinfo.io/json');
        const altData = await altResponse.json();
        if (altData.org) {
          let orgName = altData.org.replace(/^AS\d+\s*/, '').trim();
          networkInfo.isp = orgName.substring(0, 30);
          networkInfo.publicIP = altData.ip;
          networkInfo.city = altData.city;
        }
      } catch {
        // Fallback silencioso
      }
    }

    // Gerar nome da rede baseado no ISP detectado
    if (networkInfo.isp) {
      if (isMobile && networkInfo.connectionType === 'cellular') {
        const speed = networkInfo.effectiveType?.toUpperCase() || '4G';
        networkInfo.networkName = `${networkInfo.isp} ${speed}`;
      } else {
        // WiFi ou cabo - usar nome do ISP + Fibra/WiFi
        const suffix = networkInfo.downlink && networkInfo.downlink > 50 ? ' Fibra' : '';
        networkInfo.networkName = `${networkInfo.isp}${suffix}`;
      }
    } else {
      // Fallback se não detectou ISP
      networkInfo.networkName = isMobile ? 'Dados Móveis' : 'WiFi Conectado';
    }
    
    // Calcular sinal baseado na latência e velocidade
    const rtt = networkInfo.rtt || 50;
    const speed = networkInfo.downlink || 10;
    
    if (rtt < 30 && speed > 50) networkInfo.signal = '100%';
    else if (rtt < 50 && speed > 20) networkInfo.signal = '90%';
    else if (rtt < 100 && speed > 10) networkInfo.signal = '80%';
    else if (rtt < 150 && speed > 5) networkInfo.signal = '70%';
    else if (rtt < 200) networkInfo.signal = '60%';
    else networkInfo.signal = '50%';

    // Tentar obter IP local via WebRTC
    try {
      const localIP = await new Promise<string>((resolve) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (match && !match[1].startsWith('0.')) {
              pc.close();
              resolve(match[1]);
            }
          }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        setTimeout(() => {
          pc.close();
          resolve('');
        }, 1500);
      });
      if (localIP) networkInfo.localIP = localIP;
    } catch {
      // Silencioso
    }

    return networkInfo;
  };

  const handleDesktop = async () => {
    setLogs([]);
    addLog("> Detectando rede conectada...", "info");
    
    // Detectar informações via API de IP (funciona em qualquer lugar)
    const networkInfo = await detectNetworkInfo();
    
    // Tentar servidor primeiro (para quando rodar localmente no Windows)
    let serverDetected = false;
    try {
      const result = await wifiQuery.refetch();
      const wifiInfo = result.data;
      
      if (wifiInfo?.ssid && 
          wifiInfo.success &&
          !wifiInfo.ssid.includes("Erro") && 
          !wifiInfo.ssid.includes("não") &&
          !wifiInfo.ssid.includes("null")) {
        
        serverDetected = true;
        addLog(`> Rede WiFi: ${wifiInfo.ssid}`, "success");
        
        // Mostrar provedor se detectou
        if (networkInfo.isp) {
          addLog(`> Provedor: ${networkInfo.isp}`, "info");
        }
        
        if (wifiInfo.connectionType) {
          addLog(`> Tipo: ${wifiInfo.connectionType}`, "info");
        }
        if (wifiInfo.signal && wifiInfo.signal !== "N/A") {
          addLog(`> Sinal: ${wifiInfo.signal}`, "info");
        }
      }
    } catch {
      // Servidor não disponível - usar detecção do navegador
    }

    // Se não detectou pelo servidor, usar API de IP
    if (!serverDetected) {
      // Mostrar provedor/rede detectada
      if (networkInfo.isp) {
        addLog(`> Provedor: ${networkInfo.isp}`, "success");
      }
      
      // Mostrar nome da rede
      if (networkInfo.networkName && networkInfo.networkName !== networkInfo.isp) {
        addLog(`> Rede: ${networkInfo.networkName}`, "success");
      }
    }
    
    // Mostrar tipo de conexão
    const connType = networkInfo.connectionType;
    const typeMap: Record<string, string> = {
      'wifi': 'WiFi',
      'cellular': 'Dados Móveis',
      'ethernet': 'Ethernet',
      'bluetooth': 'Bluetooth',
      'wimax': 'WiMAX',
      'other': 'Outro',
    };
    const displayType = typeMap[connType || ''] || (networkInfo.isMobile ? 'Dados Móveis' : 'WiFi');
    addLog(`> Tipo: ${displayType}`, "info");
    
    // Mostrar velocidade da conexão
    if (networkInfo.effectiveType) {
      const speedMap: Record<string, string> = {
        'slow-2g': '2G (Lento)',
        '2g': '2G',
        '3g': '3G',
        '4g': '4G LTE',
      };
      addLog(`> Velocidade: ${speedMap[networkInfo.effectiveType] || networkInfo.effectiveType.toUpperCase()}`, "info");
    }
    
    // Mostrar sinal
    if (networkInfo.signal) {
      addLog(`> Sinal: ${networkInfo.signal}`, "info");
    }
    
    // Mostrar download se disponível
    if (networkInfo.downlink && networkInfo.downlink > 0) {
      addLog(`> Download: ${networkInfo.downlink.toFixed(1)} Mbps`, "info");
    }
    
    // Mostrar cidade se detectou
    if (networkInfo.city) {
      addLog(`> Localização: ${networkInfo.city}`, "info");
    }
    
    // Mostrar IP local se conseguiu
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
