# 🔥 WraithBypass - Sistema de Inject Integrado

Este projeto agora inclui dois sistemas de injeção remota:

## 📦 Arquivos Adicionados

### Servidor
- `server/inject-server.js` - Servidor HTTP/WebSocket/TCP tradicional
- `server/ghost-server.js` - Servidor UDP em modo fantasma (invisível)
- `server/ghost-config.json` - Configurações do modo fantasma

### Cliente
- `client/ghost-inject.html` - Interface web para celular (Ghost Mode)

### Instalação
- `setup.bat` - Script de instalação automática para Windows

## 🚀 Como Usar

### 1. Instalação das Dependências

```bash
npm install
# ou
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
SECRET_KEY=SUA_CHAVE_SECRETA_AQUI
```

### 3. Executar os Servidores

#### Servidor Inject Tradicional (HTTP/WebSocket/TCP)
```bash
npm run inject
# ou para desenvolvimento com auto-reload
npm run inject:dev
```

**Portas utilizadas:**
- HTTP/WebSocket: 3000 (ou PORT definido no .env)
- TCP: 12345

**Endpoints disponíveis:**
- `GET /status` - Verifica status do servidor
- `POST /inject` - Executa o comando (requer auth_key)
- `WebSocket ws://IP:3000` - Comunicação em tempo real
- `TCP IP:12345` - Socket TCP direto

#### Servidor Ghost (Modo Invisível)
```bash
npm run ghost
# ou para desenvolvimento
npm run ghost:dev
```

**Características:**
- Porta UDP: 53761
- Totalmente invisível (sem janelas)
- Verifica se o Notepad está aberto antes de executar
- Limpa rastros automaticamente
- Se disfarça como processo do Windows (svchost.exe)

### 4. Instalação no Windows (Opcional)

Execute o arquivo `setup.bat` como Administrador para instalar o servidor Ghost em modo oculto no sistema.

## 📱 Usando no Celular

### Método 1: Ghost Inject (Recomendado)

1. Abra o arquivo `client/ghost-inject.html` no navegador do celular
2. Digite o IP do PC na rede local (ex: 192.168.1.100)
3. Certifique-se que o Notepad está aberto no PC
4. Clique em "INICIAR GHOST INJECT"

### Método 2: HTTP/WebSocket

Use qualquer cliente HTTP ou WebSocket para enviar comandos:

**Exemplo com cURL:**
```bash
curl -X POST http://IP_DO_PC:3000/inject \
  -H "Content-Type: application/json" \
  -d '{"auth_key": "SUA_CHAVE_SECRETA"}'
```

**Exemplo com WebSocket (JavaScript):**
```javascript
const ws = new WebSocket('ws://IP_DO_PC:3000');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'inject',
    auth_key: 'SUA_CHAVE_SECRETA'
  }));
};
```

## 🔒 Segurança

### ⚠️ AVISOS IMPORTANTES

1. **Este código executa comandos no sistema operacional remotamente**
2. **Altere a SECRET_KEY e SECRET_HASH antes de usar**
3. **Use apenas em ambientes controlados e com autorização**
4. **Não exponha esses servidores à internet pública**
5. **Este tipo de ferramenta pode ser detectada por antivírus**

### Configurações de Segurança Recomendadas

1. **Alterar SECRET_KEY** no arquivo `.env`
2. **Alterar SECRET_HASH** em:
   - `server/ghost-server.js` (linha 8)
   - `server/ghost-config.json` (linha 3)
   - `client/ghost-inject.html` (linha 378)
3. **Usar em rede local apenas** (não expor à internet)
4. **Configurar firewall** para bloquear acesso externo

## 🛠️ Modo Ghost - Configurações Avançadas

Edite o arquivo `server/ghost-config.json`:

```json
{
  "ghost_mode": true,           // Ativa modo invisível
  "port": 53761,                // Porta UDP
  "secret_hash": "ALTERE_AQUI", // Hash de autenticação
  "requires_notepad": true,     // Requer Notepad aberto
  "auto_clean": true,           // Limpa rastros automaticamente
  "hide_process": true,         // Oculta processo
  "max_connections": 1,         // Máximo de conexões simultâneas
  "timeout": 5000               // Timeout em ms
}
```

## 📊 Comparação dos Modos

| Característica | Inject Server | Ghost Server |
|----------------|---------------|--------------|
| Protocolo | HTTP/WS/TCP | UDP |
| Visibilidade | Janela CMD | Invisível |
| Autenticação | SECRET_KEY | SECRET_HASH |
| Porta padrão | 3000/12345 | 53761 |
| Logs | Sim | Não |
| Rastros | Sim | Auto-limpa |
| Requisito | Nenhum | Notepad aberto |
| Disfarce | Não | svchost.exe |

## 🔧 Troubleshooting

### Servidor não inicia
- Verifique se as portas 3000, 12345 ou 53761 não estão em uso
- Execute como Administrador no Windows
- Verifique se o Node.js está instalado

### Cliente não conecta
- Confirme que o servidor está rodando
- Verifique o IP do PC na rede local
- Desative temporariamente o firewall para testar
- Certifique-se que ambos estão na mesma rede

### Ghost Mode não executa
- Verifique se o Notepad está aberto
- Confirme que o SECRET_HASH é o mesmo no servidor e cliente
- Execute o servidor como Administrador

## 📝 Notas de Desenvolvimento

Este sistema foi integrado ao projeto WraithBypass existente. Os servidores de injeção são independentes do sistema principal e podem ser executados separadamente.

**Estrutura do projeto:**
```
WraithBypass cll/
├── server/
│   ├── inject-server.js      # Servidor HTTP/WS/TCP
│   ├── ghost-server.js        # Servidor Ghost UDP
│   └── ghost-config.json      # Config do Ghost
├── client/
│   └── ghost-inject.html      # Interface web mobile
├── setup.bat                  # Instalador Windows
└── package.json               # Scripts npm adicionados
```

## 🎯 Comandos NPM Disponíveis

```bash
npm run dev          # Inicia o projeto principal
npm run inject       # Inicia servidor inject
npm run ghost        # Inicia servidor ghost
npm run inject:dev   # Inject com auto-reload
npm run ghost:dev    # Ghost com auto-reload
```

---

**⚠️ Use com responsabilidade. Este código é fornecido apenas para fins educacionais.**
