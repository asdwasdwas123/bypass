# 🔥 Wraith Inject - Protocol Handler

## ✅ Execução SEM servidor rodando!

Este método registra um **protocol handler** no Windows que permite executar comandos direto do navegador sem precisar de servidor local.

---

## 📦 Instalação (UMA VEZ)

### 1️⃣ Execute como Administrador:

**Clique com botão direito em:**
```
INSTALAR-PROTOCOL.bat
```

**Selecione:** "Executar como administrador"

### 2️⃣ Aguarde a mensagem:
```
✅ INSTALAÇÃO CONCLUÍDA!
```

**Pronto!** O protocol handler está instalado.

---

## 🚀 Como Usar

### No PC ou Celular:

1. Acesse o site: `bypass-6p9m.vercel.app`
2. Clique em **"Injetar"**
3. O comando executa automaticamente!

**NÃO PRECISA:**
- ❌ Rodar servidor
- ❌ Executar START-AQUI.bat
- ❌ Manter CMD aberto

---

## 🔧 Como Funciona

### Protocol Handler:

Quando o site chama:
```
wraith-inject://execute
```

O Windows executa automaticamente:
```cmd
rundll32.exe "C:\vfcompat.dll", windowssupport
```

### Fluxo:

```
[Site] → wraith-inject:// → [Windows Registry] → [Executa Comando]
```

---

## 🗑️ Desinstalar

Execute como Administrador:
```
DESINSTALAR-PROTOCOL.bat
```

---

## ⚠️ Importante

### Compatibilidade:

- ✅ **Chrome/Edge:** Funciona perfeitamente
- ✅ **Firefox:** Pede confirmação
- ⚠️ **Safari:** Pode não funcionar
- ✅ **Opera/Brave:** Funciona

### Segurança:

- O protocol handler fica registrado no Windows
- Qualquer site pode chamar `wraith-inject://`
- Desinstale quando não precisar mais

---

## 🎯 Vantagens

✅ **Sem servidor** - Não precisa rodar nada no PC
✅ **Automático** - Instala uma vez e pronto
✅ **Invisível** - Executa em background
✅ **Rápido** - Execução instantânea
✅ **Funciona de qualquer lugar** - Mesma rede WiFi não é necessária

---

## 📱 Teste

### Verificar se está instalado:

1. Abra o navegador
2. Digite na barra de endereço:
```
wraith-inject://test
```
3. Se abrir uma janela ou executar algo, está funcionando!

---

## 🔥 Resultado Final

Agora o site funciona **100% online** sem precisar de servidor local!

```
✅ Site no Vercel
✅ Protocol handler instalado no PC
✅ Clica em "Injetar" → Executa!
```

**É isso que você queria!** 🎉
