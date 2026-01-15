# 🚀 Início Rápido - WraithBypass Inject

## 📦 Instalação

```bash
npm install
```

## 🖥️ No PC (Windows)

### 1. Descobrir seu IP
```cmd
ipconfig
```
Anote o "Endereço IPv4" (ex: `192.168.1.100`)

### 2. Iniciar o servidor de injeção
```bash
npm run inject:stealth
```

### 3. Abrir o Notepad
- Abra o Bloco de Notas (Notepad)
- Mantenha aberto durante o uso

### 4. Iniciar o site (opcional, se quiser testar no PC)
```bash
npm run dev
```

## 📱 No Celular

### 1. Conectar na mesma rede WiFi do PC

### 2. Abrir o site
- Acesse: `http://IP_DO_PC:5173`
- Exemplo: `http://192.168.1.100:5173`

### 3. Configurar IP do PC
- Clique no ícone de engrenagem (⚙️)
- Digite o IP do PC
- Exemplo: `192.168.1.100`

### 4. Injetar
- Clique no botão **"Injetar"**
- Aguarde a confirmação

## ✅ Checklist

Antes de clicar em "Injetar":

- [ ] PC e celular na mesma rede WiFi
- [ ] Servidor rodando no PC (`npm run inject:stealth`)
- [ ] Notepad aberto no PC
- [ ] IP do PC configurado no celular
- [ ] Site aberto no celular

## ❌ Problemas?

### Servidor não encontrado
```bash
# No PC, verifique se o servidor está rodando
npm run inject:stealth

# Libere a porta no firewall
netsh advfirewall firewall add rule name="Wraith" dir=in action=allow protocol=TCP localport=8888
```

### Notepad não detectado
- Abra o Bloco de Notas (Notepad.exe)
- Verifique no Gerenciador de Tarefas se está rodando

### Site não abre
- Verifique se usou o IP correto (não use `localhost`)
- Tente: `http://IP_DO_PC:5173`

## 🎯 Comando Executado

```cmd
rundll32.exe "C:\vfcompat.dll", windowssupport
```

Executado de forma stealth (sem logs no Event Viewer).

## 📚 Documentação Completa

Leia `README_INJECT.md` para informações detalhadas.
