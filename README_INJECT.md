# 🔥 WraithBypass - Sistema de Injeção Stealth

Sistema de injeção remota integrado ao site WraithBypass. Execute comandos no PC a partir do celular na mesma rede WiFi.

## ✨ Características

- ✅ **Verificação de Notepad**: Só executa se o Notepad estiver aberto no PC
- ✅ **Execução Stealth**: Não deixa logs no Event Viewer do Windows
- ✅ **Interface Integrada**: Botão de inject direto no site
- ✅ **Mesma Rede WiFi**: Celular e PC devem estar conectados na mesma rede
- ✅ **Configuração Simples**: Configure o IP do PC uma vez e pronto

## 🚀 Como Usar

### 1️⃣ No PC (Windows)

#### Instalar Dependências
```bash
npm install
# ou
pnpm install
```

#### Iniciar o Servidor de Injeção
```bash
npm run inject:stealth
```

Você verá:
```
═══════════════════════════════════════════════
  🔥 WRAITH INJECT SERVER - STEALTH MODE
═══════════════════════════════════════════════
  ✅ Servidor rodando em: http://0.0.0.0:8888
  🔌 WebSocket: ws://0.0.0.0:8888
  📡 Endpoints:
     GET  /status - Status do servidor
     POST /inject - Executar injeção

  ⚠️  REQUISITOS:
     • Notepad deve estar aberto
     • Celular e PC na mesma rede WiFi
     • Configure o IP do PC no celular
═══════════════════════════════════════════════
```

#### Descobrir o IP do PC

**Windows:**
```cmd
ipconfig
```
Procure por "Endereço IPv4" na seção da sua rede WiFi (geralmente algo como `192.168.1.100`)

**Ou use PowerShell:**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}).IPAddress
```

### 2️⃣ No Celular

#### Abrir o Site
1. Inicie o site do WraithBypass:
   ```bash
   npm run dev
   ```

2. Acesse no celular: `http://IP_DO_PC:5173` (ou a porta que o Vite usar)

#### Configurar o IP
1. Clique no ícone de **engrenagem** (⚙️) no canto superior direito do terminal
2. Digite o **IP do PC** (ex: `192.168.1.100`)
3. O IP será salvo automaticamente

#### Executar a Injeção
1. **Abra o Notepad no PC** (requisito obrigatório)
2. No celular, clique no botão **"Injetar"**
3. Aguarde o processo:
   - ✅ Servidor detectado
   - ✅ Notepad detectado
   - ✅ Comando executado com sucesso

## 📋 Requisitos

### No PC
- ✅ Windows (testado no Windows 10/11)
- ✅ Node.js instalado
- ✅ Notepad aberto
- ✅ Servidor de injeção rodando (`npm run inject:stealth`)
- ✅ Conectado na mesma rede WiFi que o celular

### No Celular
- ✅ Navegador moderno (Chrome, Safari, Firefox)
- ✅ Conectado na mesma rede WiFi que o PC
- ✅ IP do PC configurado no site

## 🔧 Troubleshooting

### ❌ "Servidor não encontrado"
**Problema:** O celular não consegue conectar ao PC

**Soluções:**
1. Verifique se o servidor está rodando no PC (`npm run inject:stealth`)
2. Confirme que ambos estão na **mesma rede WiFi**
3. Verifique se o IP do PC está correto
4. Desative temporariamente o **Firewall do Windows**:
   ```powershell
   # Permitir porta 8888 no firewall
   netsh advfirewall firewall add rule name="Wraith Inject" dir=in action=allow protocol=TCP localport=8888
   ```

### ❌ "Notepad não está aberto"
**Problema:** O comando não executa

**Solução:**
- Abra o **Bloco de Notas** (Notepad) no PC antes de clicar em "Injetar"
- Verifique se o processo `notepad.exe` está rodando no Gerenciador de Tarefas

### ❌ "Timeout: PC não respondeu"
**Problema:** Conexão muito lenta ou PC não acessível

**Soluções:**
1. Verifique a conexão WiFi de ambos os dispositivos
2. Aproxime o celular do roteador
3. Reinicie o servidor no PC
4. Teste o servidor acessando `http://IP_DO_PC:8888/status` no navegador do celular

### ❌ Site não abre no celular
**Problema:** Não consegue acessar o site

**Soluções:**
1. Certifique-se que o servidor web está rodando (`npm run dev`)
2. Use o IP correto do PC (não use `localhost`)
3. Verifique a porta (geralmente 5173 ou 5174)
4. Tente acessar: `http://IP_DO_PC:5173`

## 🔒 Segurança

### ⚠️ AVISOS IMPORTANTES

1. **Este código executa comandos no sistema operacional**
2. **Use apenas em ambientes controlados**
3. **Não exponha o servidor à internet pública**
4. **O comando executado é**: `rundll32.exe "C:\vfcompat.dll", windowssupport`

### Execução Stealth

O servidor usa técnicas para minimizar rastros:

- ✅ Execução via PowerShell com bypass de logs
- ✅ Processo em background (sem janelas)
- ✅ Sem registro no Event Viewer (na maioria dos casos)
- ✅ Processo desvinculado do servidor

**Método de execução:**
```powershell
Start-Process -WindowStyle Hidden -FilePath 'rundll32.exe' 
  -ArgumentList 'C:\vfcompat.dll,windowssupport' 
  -NoNewWindow -PassThru
```

## 📁 Estrutura de Arquivos

```
WraithBypass cll/
├── server/
│   └── inject-stealth.js          # Servidor backend stealth
├── client/
│   └── src/
│       └── components/
│           └── Terminal.tsx        # Interface com botão inject
├── package.json                    # Scripts npm
└── README_INJECT.md               # Esta documentação
```

## 🎯 Fluxo de Funcionamento

```
1. [PC] Servidor rodando na porta 8888
2. [Celular] Usuário clica em "Injetar"
3. [Celular] Envia requisição HTTP para http://PC_IP:8888/inject
4. [PC] Servidor verifica se Notepad está aberto
5. [PC] Se sim, executa comando stealth
6. [PC] Retorna resultado para o celular
7. [Celular] Exibe logs no terminal
```

## 🛠️ Comandos NPM

```bash
# Desenvolvimento
npm run dev              # Inicia o site (Vite)
npm run inject:stealth   # Inicia servidor de injeção

# Produção
npm run build            # Build do site
npm start                # Inicia servidor em produção

# Outros
npm run inject           # Servidor inject original (HTTP/WS/TCP)
npm run ghost            # Servidor ghost (UDP)
```

## 📱 Testando a Conexão

### Teste 1: Verificar servidor
No navegador do celular, acesse:
```
http://IP_DO_PC:8888/status
```

Deve retornar:
```json
{
  "status": "online",
  "server": "Wraith Inject Server",
  "version": "2.0.0",
  "platform": "win32",
  "timestamp": "2026-01-15T..."
}
```

### Teste 2: Verificar site
No navegador do celular, acesse:
```
http://IP_DO_PC:5173
```

Deve abrir o site do WraithBypass.

## 💡 Dicas

1. **Salve o IP**: O IP do PC é salvo automaticamente no navegador
2. **Firewall**: Adicione exceção para a porta 8888
3. **Rede Estável**: Use WiFi 5GHz para melhor performance
4. **Notepad Sempre Aberto**: Mantenha o Notepad aberto enquanto usar
5. **Logs do Servidor**: Acompanhe os logs no terminal do PC

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal do PC
2. Teste a conexão com `/status`
3. Confirme que ambos estão na mesma rede WiFi
4. Desative temporariamente antivírus/firewall para testar

---

**⚠️ Use com responsabilidade. Este código é fornecido apenas para fins educacionais.**
