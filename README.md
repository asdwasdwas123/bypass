# 🔥 WraithBypass - Sistema de Injeção Stealth

Sistema completo de injeção remota com interface web integrada.

## ✨ Características

- ✅ **Verificação de Notepad**: Só executa se o Notepad estiver aberto
- ✅ **Execução Stealth**: Sem logs no Event Viewer do Windows
- ✅ **Interface Integrada**: Botão de inject direto no site
- ✅ **Mesma Rede WiFi**: Celular e PC conectados juntos
- ✅ **Background Mode**: Roda invisível sem manter CMD aberto
- ✅ **Auto-Inicialização**: Inicia automaticamente com o Windows

## 🚀 Início Rápido

### 1️⃣ Instalação
```bash
npm install
```

### 2️⃣ Rodar em Background (Recomendado)
Dê duplo clique em: **`start-inject-background.bat`**

Ou adicione ao inicializar do Windows:
**`add-to-startup.bat`**

### 3️⃣ Usar o Site

**Opção A: Local**
```bash
npm run dev
# Acesse: http://192.168.1.3:5173
```

**Opção B: Vercel (Online)**
1. Faça deploy no Vercel
2. Acesse o site de qualquer lugar
3. Configure o IP do PC

### 4️⃣ No Celular
1. Conecte no mesmo WiFi do PC
2. Abra o site
3. Clique em ⚙️ e configure o IP do PC
4. Abra o Notepad no PC
5. Clique em "Injetar"

## 📚 Documentação

- **[GUIA_BACKGROUND.md](GUIA_BACKGROUND.md)** - Como rodar em background
- **[README_INJECT.md](README_INJECT.md)** - Documentação completa
- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Guia rápido de início

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia o site
npm run inject:stealth   # Inicia servidor de injeção
```

### Background (Windows)
- **`start-inject-background.bat`** - Inicia em background
- **`add-to-startup.bat`** - Adiciona ao inicializar
- **`remove-from-startup.bat`** - Remove do inicializar

### Serviço do Windows (Avançado)
- **`install-service.ps1`** - Instala como serviço
- **`uninstall-service.ps1`** - Remove o serviço

## 🎯 Fluxo de Uso

```
1. [PC] Servidor rodando em background (porta 8888)
2. [PC] Notepad aberto
3. [Celular] Acessa o site (Vercel ou local)
4. [Celular] Configura IP do PC
5. [Celular] Clica em "Injetar"
6. [PC] Verifica Notepad
7. [PC] Executa comando stealth
8. [Celular] Recebe confirmação
```

## 🌐 Deploy no Vercel

```bash
# Build
npm run build

# Deploy
vercel deploy --prod
```

Configure no site:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## 📋 Requisitos

### PC (Windows)
- Node.js instalado
- Servidor rodando (background ou CMD)
- Notepad aberto
- Conectado no WiFi

### Celular
- Mesmo WiFi do PC
- Navegador moderno
- IP do PC configurado

## 🔒 Segurança

⚠️ **AVISOS IMPORTANTES**

1. Este código executa comandos no sistema operacional
2. Use apenas em ambientes controlados
3. Não exponha o servidor à internet pública
4. O comando executado: `rundll32.exe "C:\vfcompat.dll", windowssupport`

## 🎨 Tecnologias

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + WebSocket
- **Execução**: PowerShell (stealth mode)

## 📞 Suporte

Leia a documentação completa em:
- [GUIA_BACKGROUND.md](GUIA_BACKGROUND.md)
- [README_INJECT.md](README_INJECT.md)

---

**⚠️ Use com responsabilidade. Este código é fornecido apenas para fins educacionais.**

**Desenvolvido por:** japa4m & Swag
