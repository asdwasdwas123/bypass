import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

const execAsync = promisify(exec);

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  getWifiInfo: publicProcedure.query(async () => {
    try {
      // MÉTODO 1: PowerShell Get-NetConnectionProfile (mais confiável, funciona mesmo sem WiFi ativo)
      try {
        const { stdout: psOutput } = await execAsync(
          'powershell -Command "Get-NetConnectionProfile | Select-Object Name, InterfaceAlias, IPv4Connectivity | Format-List"',
          {
            encoding: 'utf8',
            maxBuffer: 1024 * 1024,
            shell: true,
          }
        );

        if (psOutput && psOutput.trim().length > 0) {
          const nameMatch = psOutput.match(/Name\s*:\s*(.+)/i);
          const interfaceMatch = psOutput.match(/InterfaceAlias\s*:\s*(.+)/i);
          const connectivityMatch = psOutput.match(/IPv4Connectivity\s*:\s*(.+)/i);
          
          const networkName = nameMatch ? nameMatch[1].trim() : null;
          const interfaceAlias = interfaceMatch ? interfaceMatch[1].trim() : null;
          const connectivity = connectivityMatch ? connectivityMatch[1].trim() : null;
          
          if (networkName && networkName.length > 0) {
            // Verificar se é WiFi ou Ethernet
            const isWifi = interfaceAlias && (
              interfaceAlias.toLowerCase().includes("wi-fi") ||
              interfaceAlias.toLowerCase().includes("wireless") ||
              interfaceAlias.toLowerCase().includes("wlan") ||
              interfaceAlias.toLowerCase().includes("802.11")
            );
            
            return {
              success: true,
              ssid: networkName,
              state: connectivity || (isWifi ? "Conectado" : "Conectado via Ethernet"),
              signal: isWifi ? "N/A" : "N/A (Ethernet)",
              connectionType: isWifi ? "WiFi" : "Ethernet",
            };
          }
        }
      } catch (psError) {
        // Continuar para próximo método
      }

      // MÉTODO 2: netsh wlan show interfaces (para WiFi ativo)
      let stdout = "";
      let hasWifiInterface = false;
      
      try {
        const result = await execAsync("netsh wlan show interfaces", {
          encoding: 'utf8',
          maxBuffer: 1024 * 1024,
          shell: true,
        });
        stdout = result.stdout || "";
        
        // Verificar se há mensagem de "no wireless interface"
        if (stdout.toLowerCase().includes("no wireless interface") || 
            stdout.toLowerCase().includes("nenhuma interface sem fio")) {
          hasWifiInterface = false;
        } else if (stdout.trim().length > 0) {
          hasWifiInterface = true;
        }
      } catch (interfaceError) {
        // Se falhar, assumir que não há interface
        hasWifiInterface = false;
      }

      // Se não há interface WiFi, tentar detectar via adaptadores de rede e métodos alternativos
      if (!hasWifiInterface) {
        // Método 1: Tentar via PowerShell para encontrar adaptadores WiFi
        try {
          const { stdout: adapterOutput } = await execAsync(
            'powershell -Command "Get-NetAdapter | Where-Object {$_.InterfaceDescription -like \'*Wireless*\' -or $_.InterfaceDescription -like \'*Wi-Fi*\' -or $_.InterfaceDescription -like \'*WLAN*\' -or $_.Name -like \'*Wi-Fi*\' -or $_.Name -like \'*WLAN*\'} | Select-Object Name, Status, InterfaceDescription | Format-List"',
            {
              encoding: 'utf8',
              maxBuffer: 1024 * 1024,
              shell: true,
            }
          );

          if (adapterOutput && adapterOutput.trim().length > 0) {
            const nameMatch = adapterOutput.match(/Name\s*:\s*(.+)/i);
            const statusMatch = adapterOutput.match(/Status\s*:\s*(.+)/i);
            const adapterName = nameMatch ? nameMatch[1].trim() : "WiFi Adapter";
            const adapterStatus = statusMatch ? statusMatch[1].trim() : "Desconhecido";
            
            if (adapterStatus.toLowerCase().includes("up") || adapterStatus.toLowerCase().includes("enabled")) {
              // Adaptador está ativo - tentar obter informações de conexão
              try {
                // Tentar obter informações via netsh wlan show all
                const { stdout: allInfo } = await execAsync("netsh wlan show all", {
                  encoding: 'utf8',
                  shell: true,
                });
                
                // Procurar por SSID na saída completa
                const ssidMatch = allInfo.match(/SSID\s*:\s*(.+)/i);
                if (ssidMatch) {
                  return {
                    success: true,
                    ssid: ssidMatch[1].trim(),
                    state: adapterStatus,
                    signal: "N/A",
                    connectionType: "WiFi",
                  };
                }
              } catch {
                // Continuar com método alternativo
              }
              
              return {
                success: false,
                ssid: `${adapterName} (Interface ativa)`,
                state: adapterStatus,
                signal: "N/A",
                error: "Interface WiFi encontrada mas SSID não detectado",
              };
            } else {
              return {
                success: false,
                ssid: `${adapterName} (Desabilitado)`,
                state: adapterStatus,
                signal: "N/A",
                error: "Interface WiFi encontrada mas está desabilitada",
              };
            }
          }
        } catch (adapterError) {
          // Continuar para próximo método
        }

        // Método 2: Tentar listar todas as redes WiFi disponíveis (mesmo que não conectado)
        try {
          const { stdout: networksOutput } = await execAsync("netsh wlan show networks", {
            encoding: 'utf8',
            shell: true,
          });
          
          if (networksOutput && !networksOutput.toLowerCase().includes("no wireless interface")) {
            // Encontrou redes WiFi disponíveis
            const networkMatches = networksOutput.matchAll(/SSID\s+\d+\s*:\s*(.+)/gi);
            const networks = Array.from(networkMatches).map(m => m[1].trim());
            
            if (networks.length > 0) {
              return {
                success: false,
                ssid: networks[0] || "Rede WiFi disponível",
                state: "Redes disponíveis detectadas",
                signal: "N/A",
                error: `Encontradas ${networks.length} rede(s) WiFi disponível(is), mas não há conexão ativa`,
              };
            }
          }
        } catch {
          // Continuar
        }

        // Método 3: Tentar via ipconfig para identificar adaptador de rede ativo
        try {
          const { stdout: ipconfigOutput } = await execAsync("ipconfig /all", {
            encoding: 'utf8',
            shell: true,
          });
          
          // Procurar por adaptador WiFi na saída
          const wifiAdapterMatch = ipconfigOutput.match(/(?:Adaptador|Adapter).*?(?:Wi-Fi|Wireless|WLAN).*?(?:SSID|Nome da rede|Network name)\s*:\s*(.+)/is);
          if (wifiAdapterMatch) {
            return {
              success: true,
              ssid: wifiAdapterMatch[1].trim(),
              state: "Conectado",
              signal: "N/A",
              connectionType: "WiFi",
            };
          }
        } catch {
          // Continuar
        }

        // MÉTODO 3: Tentar via Registry do Windows (último recurso)
        try {
          const { stdout: regOutput } = await execAsync(
            'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections" /s',
            {
              encoding: 'utf8',
              shell: true,
            }
          );
          
          // Procurar por nomes de rede no registro (método complexo, mas pode funcionar)
          // Este método é menos confiável, então vamos tentar outros primeiro
        } catch {
          // Ignorar
        }

        // Se chegou aqui, realmente não conseguiu detectar
        return {
          success: false,
          ssid: "Rede não detectada",
          state: "Não disponível",
          signal: "N/A",
          error: "Não foi possível detectar o nome da rede conectada. O sistema pode não ter interface de rede ativa ou as informações não estão disponíveis.",
        };
      }

      // Se há interface WiFi, processar a saída
      // Melhorar parsing - procurar SSID diretamente na saída completa primeiro
      let ssid = null;
      let state = null;
      let signal = null;
      
      // Método 1: Procurar SSID diretamente na saída (mais confiável)
      const ssidMatches = stdout.matchAll(/SSID\s*:\s*([^\r\n]+)/gi);
      for (const match of ssidMatches) {
        const foundSsid = match[1].trim();
        // Ignorar valores vazios ou genéricos
        if (foundSsid && foundSsid.length > 0 && !foundSsid.toLowerCase().includes("not configured")) {
          ssid = foundSsid;
          break;
        }
      }
      
      // Método 2: Dividir por interfaces e procurar pela conectada
      const interfaces = stdout.split(/\n\s*\n/).filter(block => block.trim().length > 0);
      
      // Procurar pela interface conectada
      let connectedInterface = "";
      for (const iface of interfaces) {
        const stateMatch = iface.match(/State\s*:\s*(.+)/i);
        const foundState = stateMatch ? stateMatch[1].trim() : "";
        if (foundState && (foundState.toLowerCase().includes("connected") || foundState.toLowerCase().includes("conectado"))) {
          connectedInterface = iface;
          // Se encontrou interface conectada, extrair SSID dela
          const ifaceSsidMatch = iface.match(/SSID\s*:\s*([^\r\n]+)/i);
          if (ifaceSsidMatch) {
            const ifaceSsid = ifaceSsidMatch[1].trim();
            if (ifaceSsid && ifaceSsid.length > 0) {
              ssid = ifaceSsid;
            }
          }
          state = foundState;
          break;
        }
      }

      // Se não encontrou conectada, usar a primeira interface disponível
      if (!ssid && interfaces.length > 0) {
        const targetInterface = connectedInterface || interfaces[0];
        
        // Extrair o SSID (nome da rede WiFi) da saída
        const ssidMatch = targetInterface.match(/SSID\s*:\s*([^\r\n]+)/i);
        if (ssidMatch) {
          const foundSsid = ssidMatch[1].trim();
          if (foundSsid && foundSsid.length > 0) {
            ssid = foundSsid;
          }
        }
        
        // Extrair o estado da conexão
        if (!state) {
          const stateMatch = targetInterface.match(/State\s*:\s*(.+)/i);
          state = stateMatch ? stateMatch[1].trim() : null;
        }
      }
      
      // Se ainda não encontrou SSID, tentar na saída completa novamente com regex mais flexível
      if (!ssid) {
        const fallbackSsidMatch = stdout.match(/SSID[^\r\n]*:\s*([^\r\n]+)/i);
        if (fallbackSsidMatch) {
          const foundSsid = fallbackSsidMatch[1].trim();
          if (foundSsid && foundSsid.length > 0 && !foundSsid.toLowerCase().includes("not configured")) {
            ssid = foundSsid;
          }
        }
      }
      
      // Extrair o sinal (signal) - procurar em toda a saída
      if (!signal) {
        const signalMatches = stdout.matchAll(/Signal\s*:\s*([^\r\n]+)/gi);
        for (const match of signalMatches) {
          const foundSignal = match[1].trim();
          if (foundSignal && foundSignal.length > 0) {
            signal = foundSignal;
            break;
          }
        }
      }

      // Se não encontrou SSID mas há interface, pode estar desconectada
      if (!ssid || ssid === "") {
        if (state && (state.toLowerCase().includes("disconnected") || state.toLowerCase().includes("desconectado"))) {
          return {
            success: false,
            ssid: "WiFi desconectada",
            state: state,
            signal: signal || "N/A",
            error: "Interface WiFi encontrada mas não está conectada a nenhuma rede",
          };
        }
        
        // Tentar método alternativo: verificar perfis salvos e tentar identificar o conectado
        try {
          // Primeiro, tentar obter o perfil conectado diretamente
          try {
            const { stdout: currentProfile } = await execAsync("netsh wlan show interfaces", {
              encoding: 'utf8',
              shell: true,
            });
            
            // Procurar SSID na saída com regex mais agressivo
            const currentSsidMatch = currentProfile.match(/SSID\s*[^\r\n]*:\s*([^\r\n]+)/i);
            if (currentSsidMatch) {
              const currentSsid = currentSsidMatch[1].trim();
              if (currentSsid && currentSsid.length > 0 && !currentSsid.toLowerCase().includes("not configured")) {
                return {
                  success: true,
                  ssid: currentSsid,
                  state: state || "Conectado",
                  signal: signal || "N/A",
                };
              }
            }
          } catch {
            // Continuar
          }
          
          // Tentar via wmic (Windows Management Instrumentation)
          try {
            const { stdout: wmicOutput } = await execAsync(
              'wmic path win32_networkadapter where "NetConnectionStatus=2" get Name,NetConnectionID /format:list',
              { encoding: 'utf8', shell: true }
            );
            
            // Procurar por adaptador WiFi
            if (wmicOutput && (wmicOutput.toLowerCase().includes("wireless") || wmicOutput.toLowerCase().includes("wi-fi") || wmicOutput.toLowerCase().includes("wlan"))) {
              // Se encontrou adaptador WiFi ativo, tentar obter SSID via netsh wlan show all
              try {
                const { stdout: allInfo } = await execAsync("netsh wlan show all", {
                  encoding: 'utf8',
                  shell: true,
                });
                
                // Procurar SSID na saída completa com múltiplos padrões
                const ssidPatterns = [
                  /SSID\s*[^\r\n]*:\s*([^\r\n]+)/i,
                  /Nome\s+da\s+rede\s*:\s*([^\r\n]+)/i,
                  /Network\s+name\s*:\s*([^\r\n]+)/i,
                ];
                
                for (const pattern of ssidPatterns) {
                  const match = allInfo.match(pattern);
                  if (match) {
                    const foundSsid = match[1].trim();
                    if (foundSsid && foundSsid.length > 0 && !foundSsid.toLowerCase().includes("not configured")) {
                      return {
                        success: true,
                        ssid: foundSsid,
                        state: state || "Conectado",
                        signal: signal || "N/A",
                      };
                    }
                  }
                }
              } catch {
                // Continuar
              }
            }
          } catch {
            // Continuar
          }
          
          // Método final: verificar perfis salvos
          const { stdout: profileOutput } = await execAsync("netsh wlan show profiles", {
            encoding: 'utf8',
            shell: true,
          });
          
          // Pegar perfis
          const profileMatches = profileOutput.matchAll(/All User Profile\s*:\s*(.+)/gi);
          const profiles = Array.from(profileMatches).map(m => m[1].trim());
          
          if (profiles.length > 0) {
            // Tentar verificar qual perfil está conectado verificando cada um
            for (const profileName of profiles) {
              try {
                const { stdout: profileDetails } = await execAsync(
                  `netsh wlan show profile name="${profileName}" key=clear`,
                  { encoding: 'utf8', shell: true }
                );
                
                // Verificar se este perfil tem informações de conexão ativa
                if (profileDetails.includes("Key Content") || profileDetails.length > 100) {
                  // Verificar se há indicação de conexão ativa
                  if (profileDetails.toLowerCase().includes("connected") || profileDetails.toLowerCase().includes("conectado")) {
                    return {
                      success: true,
                      ssid: profileName,
                      state: state || "Conectado",
                      signal: signal || "N/A",
                    };
                  }
                }
              } catch {
                continue;
              }
            }
            
            // Se não encontrou perfil conectado, retornar o primeiro perfil salvo
            return {
              success: false,
              ssid: profiles[0] || "Perfil WiFi salvo",
              state: state || "Não conectado",
              signal: signal || "N/A",
              error: "Encontrado perfil WiFi salvo mas não há conexão ativa confirmada",
            };
          }
        } catch (altError) {
          // Ignorar erro do comando alternativo
        }

        return {
          success: false,
          ssid: "WiFi não conectada ou não detectada",
          state: state || "Desconhecido",
          signal: signal || "N/A",
          error: "SSID não encontrado na saída do comando",
        };
      }

      return {
        success: true,
        ssid,
        state: state || "Desconhecido",
        signal: signal || "N/A",
        connectionType: "WiFi",
      };
    } catch (error) {
      // Se o comando falhar, retornar erro com mais detalhes
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      return {
        success: false,
        ssid: "Erro ao detectar",
        state: "Erro",
        signal: "N/A",
        error: errorMessage,
      };
    }
  }),
});
