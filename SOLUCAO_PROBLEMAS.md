# 🔧 Solução de Problemas - "Servidor não encontrado"

## 🎯 Solução Rápida (FAÇA ISSO PRIMEIRO)

### Passo 1: Execute o script completo
1. Clique com **botão direito** em: `start-inject-with-firewall.bat`
2. Selecione: **"Executar como administrador"**
3. Aguarde aparecer o IP do PC

### Passo 2: Teste a conexão
1. No iPhone, abra o Safari
2. Acesse: `http://192.168.1.3:8888/status` (use seu IP)
3. Deve aparecer: `{"status":"online",...}`

### Passo 3: Se funcionar
✅ Volte para o site e clique em "Injetar"

---

## 🔍 Diagnóstico Completo

### 1️⃣ Verificar se o servidor está rodando

**Execute:** `test-connection.bat`

Deve mostrar:
```
✅ Servidor Node.js esta rodando
✅ Porta 8888 esta em uso
```

Se mostrar ❌:
- Execute: `start-inject-with-firewall.bat` como Administrador

---

### 2️⃣ Verificar Firewall

**Problema:** Firewall bloqueando a porta 8888

**Solução 1 - Automática:**
```cmd
# Execute como Administrador:
start-inject-with-firewall.bat
```

**Solução 2 - Manual:**
```cmd
# Abra CMD como Administrador e execute:
netsh advfirewall firewall add rule name="Wraith" dir=in action=allow protocol=TCP localport=8888
```

**Solução 3 - Desativar temporariamente:**
```cmd
# Desativar (apenas para teste):
netsh advfirewall set allprofiles state off

# Reativar depois:
netsh advfirewall set allprofiles state on
```

---

### 3️⃣ Verificar IP do PC

**Descobrir IP:**
```cmd
ipconfig
```

Procure por: **"Endereço IPv4"** na seção **"Adaptador de Rede sem Fio Wi-Fi"**

Exemplo: `192.168.1.3`

**⚠️ IMPORTANTE:** Use o IP da rede WiFi, não do cabo Ethernet!

---

### 4️⃣ Verificar mesma rede WiFi

**No PC:**
- Abra: Configurações → Rede e Internet → WiFi
- Veja o nome da rede conectada

**No iPhone:**
- Abra: Ajustes → Wi-Fi
- Confirme que está na **mesma rede** do PC

---

### 5️⃣ Testar conexão manualmente

**No Safari do iPhone, acesse:**
```
http://SEU_IP:8888/status
```

**Exemplo:**
```
http://192.168.1.3:8888/status
```

**Resultado esperado:**
```json
{
  "status": "online",
  "server": "Wraith Inject Server",
  "version": "2.0.0",
  "platform": "win32",
  "timestamp": "..."
}
```

**Se aparecer isso, está funcionando!** ✅

---

### 6️⃣ Usar página de teste

1. Abra o arquivo: `test-page.html` no navegador do iPhone
2. Digite o IP do PC
3. Clique em "Testar Conexão"
4. Se aparecer ✅, está funcionando!

---

## 🛠️ Problemas Específicos

### ❌ "Servidor não encontrado"

**Causas:**
1. Servidor não está rodando
2. Firewall bloqueando
3. IP errado
4. Redes WiFi diferentes

**Soluções:**
1. Execute: `start-inject-with-firewall.bat` como Admin
2. Configure Firewall (veja seção 2)
3. Confirme o IP com `ipconfig`
4. Conecte ambos na mesma rede WiFi

---

### ❌ "Timeout: PC não respondeu"

**Causas:**
1. Servidor muito lento
2. Rede WiFi fraca
3. Firewall bloqueando

**Soluções:**
1. Aproxime o celular do roteador
2. Desative Firewall temporariamente para testar
3. Reinicie o roteador WiFi

---

### ❌ "Notepad não está aberto"

**Causa:**
- O Bloco de Notas não está aberto no PC

**Solução:**
1. Abra o **Bloco de Notas** (Notepad) no PC
2. Deixe aberto
3. Tente injetar novamente

---

### ❌ "CORS error" ou "Blocked by CORS policy"

**Causa:**
- Navegador bloqueando requisição

**Solução:**
- Isso não deve acontecer, o servidor já tem CORS configurado
- Se acontecer, use o site hospedado no Vercel

---

## 📋 Checklist Completo

Antes de usar, verifique:

### No PC:
- [ ] Servidor rodando (`start-inject-with-firewall.bat`)
- [ ] Firewall configurado (porta 8888 liberada)
- [ ] IP anotado (ex: `192.168.1.3`)
- [ ] Conectado no WiFi
- [ ] Notepad aberto

### No iPhone:
- [ ] Conectado no mesmo WiFi do PC
- [ ] Site aberto (Vercel ou local)
- [ ] IP do PC configurado
- [ ] Teste de conexão passou (✅)

### Teste Final:
- [ ] Acesse: `http://IP_DO_PC:8888/status` no Safari
- [ ] Deve retornar: `{"status":"online",...}`
- [ ] Se sim, clique em "Injetar" no site

---

## 🎯 Comandos Úteis

### Ver processos Node.js rodando:
```cmd
tasklist | findstr node
```

### Ver portas em uso:
```cmd
netstat -an | findstr 8888
```

### Matar processo Node.js:
```cmd
taskkill /F /IM node.exe
```

### Ver regras do Firewall:
```cmd
netsh advfirewall firewall show rule name=all | findstr Wraith
```

### Testar conexão local:
```cmd
curl http://localhost:8888/status
```

---

## 💡 Dicas

1. **Use o script completo:** `start-inject-with-firewall.bat` como Administrador
2. **Teste sempre:** Acesse `/status` no Safari antes de injetar
3. **Mantenha aberto:** Deixe o Notepad sempre aberto
4. **Mesma rede:** Confirme que ambos estão no mesmo WiFi
5. **IP correto:** Use o IP da rede WiFi, não do cabo

---

## 📞 Ainda não funciona?

Se seguiu todos os passos e ainda não funciona:

1. **Reinicie o roteador WiFi**
2. **Reinicie o PC**
3. **Desative antivírus temporariamente**
4. **Tente outro navegador no iPhone** (Chrome, Firefox)
5. **Execute:** `test-connection.bat` e anote os resultados

---

## ✅ Teste de Sucesso

Você saberá que está funcionando quando:

1. ✅ `test-connection.bat` mostra tudo verde
2. ✅ Safari acessa `http://IP:8888/status` e mostra JSON
3. ✅ Site mostra "✅ Servidor detectado"
4. ✅ Botão "Injetar" executa com sucesso

**Se tudo isso funcionar, está perfeito!** 🎉
