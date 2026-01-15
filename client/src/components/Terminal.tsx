import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Shield, Play, Terminal as TerminalIcon, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { executeDirectCommand, tryBrowserExploits } from "@/lib/executor";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "error" | "warning";
}

export function Terminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>("Carregando...");
  const [pcIp, setPcIp] = useState<string>(() => {
    return localStorage.getItem('wraith_pc_ip') || "192.168.";
  });
  const [showConfig, setShowConfig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wifiQuery = trpc.system.getWifiInfo.useQuery(undefined, { enabled: false });

  useEffect(() => {
    // Detectar IP público
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
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  const savePcIp = (ip: string) => {
    setPcIp(ip);
    localStorage.setItem('wraith_pc_ip', ip);
  };

  const handleInject = async () => {
    if (isInjecting) return;

    setIsInjecting(true);
    setLogs([]);

    try {
      addLog("> Iniciando injeção direta...", "info");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Tentar execução direta (sem servidor)
      addLog("> Tentando métodos de execução direta...", "info");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const directResult = await executeDirectCommand();
      
      if (directResult.success) {
        addLog(`✅ Executado via: ${directResult.method}`, "success");
        addLog("> Comando enviado com sucesso!", "success");
        addLog("> rundll32.exe \"C:\\vfcompat.dll\", windowssupport", "info");
        setIsInjecting(false);
        return;
      }

      // Se falhou, tentar exploits do navegador
      addLog("> Método direto falhou, tentando exploits...", "warning");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const exploitResult = await tryBrowserExploits();
      
      if (exploitResult.success) {
        addLog(`✅ Executado via: ${exploitResult.method}`, "success");
        addLog("> Exploit bem-sucedido!", "success");
        setIsInjecting(false);
        return;
      }

      // Se tudo falhou, tentar servidor local
      addLog("> Tentando servidor local...", "info");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Validar IP
      if (!pcIp || pcIp.length < 7) {
        addLog("❌ Configure o IP do PC primeiro", "error");
        setShowConfig(true);
        setIsInjecting(false);
        return;
      }

      addLog(`> Conectando ao PC: ${pcIp}`, "info");
      await new Promise(resolve => setTimeout(resolve, 500));

      const serverUrl = `http://${pcIp}:8888`;
      
      try {
        const statusResponse = await fetch(`${serverUrl}/status`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });

        if (!statusResponse.ok) {
          throw new Error('Servidor offline');
        }

        addLog("✅ Servidor detectado", "success");
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        addLog("❌ Nenhum método funcionou", "error");
        addLog("", "info");
        addLog("⚠️ NAVEGADORES MODERNOS BLOQUEIAM", "warning");
        addLog("   execução direta de comandos!", "warning");
        addLog("", "info");
        addLog("💡 Soluções:", "info");
        addLog("1. Execute START-AQUI.bat no PC", "info");
        addLog("2. Ou instale a extensão do navegador", "info");
        addLog("3. Ou use um navegador desatualizado", "info");
        setIsInjecting(false);
        return;
      }

      addLog("> Verificando Notepad...", "info");
      await new Promise(resolve => setTimeout(resolve, 800));

      const injectResponse = await fetch(`${serverUrl}/inject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      const result = await injectResponse.json();

      if (result.success) {
        addLog("✅ Notepad detectado", "success");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        addLog("> Executando comando stealth...", "info");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog("✅ Comando executado com sucesso!", "success");
        addLog(`> Método: ${result.method || 'stealth'}`, "info");
        addLog("> Injeção concluída sem logs", "success");
        
      } else if (result.requiresNotepad) {
        addLog("❌ Notepad não está aberto", "error");
        addLog("> Abra o Notepad no PC e tente novamente", "warning");
        
      } else {
        addLog(`❌ Erro: ${result.error}`, "error");
      }

    } catch (error: any) {
      addLog("❌ Erro de conexão", "error");
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        addLog("> Timeout: PC não respondeu", "error");
      } else if (error.message?.includes('Failed to fetch')) {
        addLog("> Não foi possível conectar ao PC", "error");
      } else {
        addLog(`> ${error.message || 'Erro desconhecido'}`, "error");
      }
      
      addLog("> Verifique:", "info");
      addLog("  • PC e celular na mesma rede WiFi", "info");
      addLog("  • Servidor rodando no PC", "info");
      addLog("  • IP do PC está correto", "info");
      
    } finally {
      setIsInjecting(false);
    }
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
        networkInfo.connectionType = conn.type || (isMobile ? 'cellular' : 'wifi');
        networkInfo.effectiveType = conn.effectiveType;
        networkInfo.downlink = conn.downlink;
        networkInfo.rtt = conn.rtt;
      }
    }

    if (!networkInfo.connectionType || networkInfo.connectionType === 'unknown') {
      networkInfo.connectionType = isMobile ? 'cellular' : 'wifi';
    }

    // Detectar ISP/Provedor via API
    try {
      const ipResponse = await fetch('https://ip-api.com/json/?fields=status,isp,org,as,query,city,regionName');
      const ipData = await ipResponse.json();
      
      if (ipData.status === 'success') {
        networkInfo.publicIP = ipData.query;
        networkInfo.city = ipData.city;
        
        let ispName = ipData.isp || ipData.org || '';
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
        };
        
        const lowerIsp = ispName.toLowerCase();
        for (const [key, name] of Object.entries(knownISPs)) {
          if (lowerIsp.includes(key)) {
            networkInfo.isp = name;
            break;
          }
        }
        
        if (!networkInfo.isp && ispName.length > 2) {
          networkInfo.isp = ispName.split(' ')
            .filter(w => w.length > 1)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
            .substring(0, 30);
        }
      }
    } catch (e) {
      console.log('Erro ao detectar ISP:', e);
    }

    if (networkInfo.isp) {
      if (isMobile && networkInfo.connectionType === 'cellular') {
        const speed = networkInfo.effectiveType?.toUpperCase() || '4G';
        networkInfo.networkName = `${networkInfo.isp} ${speed}`;
      } else {
        const suffix = networkInfo.downlink && networkInfo.downlink > 50 ? ' Fibra' : '';
        networkInfo.networkName = `${networkInfo.isp}${suffix}`;
      }
    } else {
      networkInfo.networkName = isMobile ? 'Dados Móveis' : 'WiFi Conectado';
    }
    
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

  const handleAuthorization = () => {
    setLogs([]);
    
    // Detectar se é mobile ou desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome|Chromium|Edg/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Instruções para CELULAR
      addLog("> Configurando autorização no CELULAR...", "info");
      addLog("", "info");
      addLog("📱 INSTRUÇÕES PARA CELULAR:", "success");
      addLog("", "info");
      
      if (isChrome) {
        addLog("🌐 Chrome/Edge Mobile:", "warning");
        addLog("", "info");
        addLog("1️⃣ Toque nos 3 pontos (⋮) no canto", "info");
        addLog("2️⃣ Configurações", "info");
        addLog("3️⃣ Configurações do site", "info");
        addLog("4️⃣ Acesso à rede local", "warning");
        addLog("5️⃣ Mude para: PERMITIR", "success");
      } else if (isSafari) {
        addLog("🍎 Safari (iPhone):", "warning");
        addLog("", "info");
        addLog("1️⃣ Abra Ajustes do iPhone", "info");
        addLog("2️⃣ Role até Safari", "info");
        addLog("3️⃣ Avançado", "info");
        addLog("4️⃣ Dados de Sites", "info");
        addLog("5️⃣ Permita acesso à rede local", "success");
        addLog("", "info");
        addLog("OU:", "warning");
        addLog("1️⃣ No Safari, toque em 'aA' na barra", "info");
        addLog("2️⃣ Configurações do Site", "info");
        addLog("3️⃣ Permitir acesso à rede local", "success");
      } else {
        addLog("1️⃣ Abra as Configurações do navegador", "info");
        addLog("2️⃣ Privacidade e segurança", "info");
        addLog("3️⃣ Acesso à rede local", "warning");
        addLog("4️⃣ Mude para: PERMITIR", "success");
      }
      
      addLog("", "info");
      addLog("✅ Isso permite o celular acessar o PC", "success");
      addLog("   na mesma rede WiFi!", "success");
      
    } else {
      // Instruções para PC/DESKTOP
      addLog("> Configurando autorização no PC...", "info");
      addLog("", "info");
      addLog("🖥️ INSTRUÇÕES PARA PC:", "success");
      addLog("", "info");
      
      if (isChrome) {
        addLog("🌐 Chrome/Edge:", "warning");
        addLog("", "info");
        addLog("1️⃣ Clique no ícone de cadeado 🔒", "info");
        addLog("   (ao lado da URL)", "info");
        addLog("", "info");
        addLog("2️⃣ Configurações do site", "info");
        addLog("", "info");
        addLog("3️⃣ Procure: 'Acesso à rede local'", "warning");
        addLog("", "info");
        addLog("4️⃣ Mude para: PERMITIR", "success");
        addLog("", "info");
        addLog("OU:", "warning");
        addLog("1️⃣ chrome://settings/content/all", "info");
        addLog("2️⃣ Procure este site", "info");
        addLog("3️⃣ Acesso à rede local → Permitir", "success");
      } else {
        addLog("1️⃣ Abra as Configurações do navegador", "info");
        addLog("2️⃣ Privacidade e segurança", "info");
        addLog("3️⃣ Configurações do site", "info");
        addLog("4️⃣ Acesso à rede local", "warning");
        addLog("5️⃣ Mude para: PERMITIR", "success");
      }
      
      addLog("", "info");
      addLog("✅ Isso permite o navegador acessar", "success");
      addLog("   dispositivos na rede local!", "success");
    }
    
    addLog("", "info");
    addLog("🔄 Após ativar, volte e clique em Injetar", "info");
    addLog("", "info");
    addLog("⚠️ IMPORTANTE:", "warning");
    addLog("   PC e celular devem estar na", "warning");
    addLog("   MESMA rede WiFi!", "warning");
    
    // Tentar abrir configurações automaticamente
    setTimeout(() => {
      try {
        if (isChrome && !isMobile) {
          // Chrome Desktop - tentar abrir configurações
          window.open('chrome://settings/content/all', '_blank');
          addLog("", "info");
          addLog("✅ Abrindo configurações...", "success");
        } else if (isChrome && isMobile) {
          // Chrome Mobile - não pode abrir chrome://
          addLog("", "info");
          addLog("💡 Siga as instruções acima", "info");
        }
      } catch (e) {
        addLog("", "info");
        addLog("💡 Siga as instruções acima", "info");
      }
    }, 500);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border/50 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-90 relative group">
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
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-display font-bold text-primary tracking-wider text-glow">
            Wraith Bypass
          </h2>
          <p className="text-xs text-muted-foreground font-mono text-center">
            v2.0.0 - Stealth Mode
          </p>
        </div>

        {/* Configuração de IP */}
        {showConfig && (
          <div className="space-y-2 p-3 bg-muted/30 rounded-md border border-border/30">
            <label className="text-xs text-muted-foreground font-mono">
              IP do PC (mesma rede WiFi):
            </label>
            <Input 
              type="text"
              value={pcIp}
              onChange={(e) => savePcIp(e.target.value)}
              placeholder="192.168.1.100"
              className="font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground/70">
              Configure o IP local do PC na sua rede WiFi
            </p>
          </div>
        )}

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
            onClick={handleAuthorization}
            className="w-full border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors font-mono text-sm h-10 border-2"
          >
            <Shield className="w-4 h-4 mr-2" /> Autorização
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
