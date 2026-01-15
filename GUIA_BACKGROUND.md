# 🚀 Guia: Rodar Servidor em Background

Este guia mostra como rodar o servidor de injeção em background no Windows, sem precisar manter o CMD aberto.

## 🎯 3 Métodos Disponíveis

### Método 1: Background Simples (Recomendado para Iniciantes)
✅ Mais fácil  
✅ Não precisa ser Administrador  
❌ Precisa executar manualmente após reiniciar o PC

### Método 2: Inicialização Automática
✅ Inicia automaticamente com o Windows  
✅ Não precisa ser Administrador  
❌ Aparece brevemente ao iniciar

### Método 3: Serviço do Windows (Avançado)
✅ Totalmente invisível  
✅ Inicia automaticamente com o Windows  
✅ Reinicia automaticamente se cair  
❌ Requer permissões de Administrador

---

## 📋 Método 1: Background Simples

### Passo 1: Executar
1. Abra a pasta do projeto
2. Dê duplo clique em: **`start-inject-background.bat`**
3. Aguarde a mensagem de sucesso
4. **Pode fechar a janela!**

### Passo 2: Verificar
O servidor está rodando em background (invisível).

### Passo 3: Parar o Servidor
1. Abra o **Gerenciador de Tarefas** (Ctrl + Shift + Esc)
2. Procure por **"Node.js"** ou **"node.exe"**
3. Clique com botão direito → **Finalizar tarefa**

---

## 🔄 Método 2: Inicialização Automática

### Passo 1: Adicionar ao Inicializar
1. Dê duplo clique em: **`add-to-startup.bat`**
2. Aguarde a confirmação
3. Pronto! O servidor iniciará automaticamente com o Windows

### Passo 2: Testar
1. Reinicie o PC
2. O servidor iniciará automaticamente em background
3. Não precisa fazer nada!

### Passo 3: Remover do Inicializar (Opcional)
Se quiser desativar:
1. Dê duplo clique em: **`remove-from-startup.bat`**

---

## ⚙️ Método 3: Serviço do Windows (Avançado)

### Passo 1: Instalar o Serviço
1. Clique com botão direito em: **`install-service.ps1`**
2. Selecione: **"Executar com PowerShell"**
3. Se aparecer aviso de segurança, clique em **"Executar mesmo assim"**
4. Aguarde a instalação

### Passo 2: Verificar
O serviço foi instalado e está rodando! Você pode:
- Fechar todas as janelas
- Reiniciar o PC
- O servidor continuará rodando

### Passo 3: Gerenciar o Serviço

**Ver status:**
```powershell
Get-Service -Name WraithInjectServer
```

**Parar:**
```powershell
Stop-Service -Name WraithInjectServer
```

**Iniciar:**
```powershell
Start-Service -Name WraithInjectServer
```

**Desinstalar:**
1. Clique com botão direito em: **`uninstall-service.ps1`**
2. Selecione: **"Executar com PowerShell"**

---

## 🌐 Hospedando o Site no Vercel

### Passo 1: Preparar o Projeto
```bash
npm run build
```

### Passo 2: Deploy no Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório do projeto
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Clique em **"Deploy"**

### Passo 3: Usar o Site
1. **No PC**: Certifique-se que o servidor está rodando em background
2. **No celular**: Acesse o site do Vercel (ex: `https://seu-site.vercel.app`)
3. **Configure o IP**: Clique em ⚙️ e digite o IP do PC (ex: `192.168.1.3`)
4. **Clique em "Injetar"**

---

## 🔍 Como Funciona

```
┌─────────────────┐
│  Site (Vercel)  │ ← Hospedado online
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Celular      │ ← Acessa o site
└────────┬────────┘
         │
         │ WiFi (mesma rede)
         │
         ▼
┌─────────────────┐
│  PC (Windows)   │ ← Servidor rodando em background
│  IP: 192.168.x  │
│  Porta: 8888    │
└─────────────────┘
         │
         ▼
    Executa comando
```

---

## ✅ Checklist Final

### No PC:
- [ ] Servidor rodando em background (Método 1, 2 ou 3)
- [ ] Notepad aberto
- [ ] Conectado no WiFi
- [ ] IP do PC anotado (ex: `192.168.1.3`)

### No Celular:
- [ ] Conectado no mesmo WiFi do PC
- [ ] Site aberto (Vercel ou local)
- [ ] IP do PC configurado (⚙️)
- [ ] Clicar em "Injetar"

---

## ❓ FAQ

### O servidor está rodando?
Verifique no Gerenciador de Tarefas se há um processo **"node.exe"** ativo.

### Como descobrir o IP do PC?
```cmd
ipconfig
```
Procure por "Endereço IPv4" na seção WiFi.

### O site no Vercel não conecta ao PC
- Confirme que ambos estão na mesma rede WiFi
- Verifique se o IP está correto
- Teste acessar: `http://IP_DO_PC:8888/status` no navegador do celular

### Como parar o servidor?
- **Método 1**: Finalize o processo "node.exe" no Gerenciador de Tarefas
- **Método 2**: Remova do inicializar e reinicie o PC
- **Método 3**: Execute `Stop-Service -Name WraithInjectServer`

### Posso usar sem Notepad?
Não! O servidor verifica se o Notepad está aberto antes de executar o comando. É uma medida de segurança.

---

## 🎯 Recomendação

Para uso diário:
1. **Use o Método 2** (Inicialização Automática)
2. **Hospede o site no Vercel**
3. **Configure o IP uma vez** (fica salvo no navegador)
4. **Sempre abra o Notepad** antes de usar

Assim você só precisa:
1. Abrir o Notepad
2. Abrir o site no celular
3. Clicar em "Injetar"

**Simples e prático!** 🚀
