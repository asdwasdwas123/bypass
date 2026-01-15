import express from 'express';
import cors from 'cors';
import { exec, spawn } from 'child_process';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.INJECT_PORT || 8888;

// Middleware CORS - Permitir TODAS as origens
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'N/A'}`);
    next();
});

// Verificar se Notepad está aberto (Windows)
async function checkNotepadOpen() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            console.log('[CHECK] Não é Windows, pulando verificação de Notepad');
            resolve(false);
            return;
        }

        exec('tasklist /FI "IMAGENAME eq notepad.exe" /FO CSV /NH', (error, stdout, stderr) => {
            if (error) {
                console.log('[CHECK] Erro ao verificar Notepad:', error.message);
                resolve(false);
                return;
            }

            const isOpen = stdout.toLowerCase().includes('notepad.exe');
            console.log('[CHECK] Notepad está aberto:', isOpen);
            resolve(isOpen);
        });
    });
}

// Executar comando REAL - SEM SIMULAÇÃO
async function executeRealCommand() {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve({
                success: false,
                error: 'Sistema operacional não suportado (apenas Windows)',
                timestamp: new Date().toISOString()
            });
            return;
        }

        console.log('[EXEC] Iniciando execução REAL do comando...');

        // Comando a ser executado
        const command = 'rundll32.exe "C:\\vfcompat.dll", windowssupport';
        
        console.log('[EXEC] Comando:', command);

        // Método 1: Execução direta via cmd.exe
        exec(command, {
            windowsHide: true,
            timeout: 5000
        }, (error, stdout, stderr) => {
            if (error) {
                console.log('[EXEC] Erro na execução:', error.message);
                
                // Tentar método alternativo
                console.log('[EXEC] Tentando método alternativo com PowerShell...');
                
                const psCommand = `Start-Process -FilePath "rundll32.exe" -ArgumentList "C:\\vfcompat.dll,windowssupport" -WindowStyle Hidden -NoNewWindow`;
                
                exec(`powershell.exe -Command "${psCommand}"`, {
                    windowsHide: true,
                    timeout: 5000
                }, (psError, psStdout, psStderr) => {
                    if (psError) {
                        console.log('[EXEC] Erro no método alternativo:', psError.message);
                        resolve({
                            success: false,
                            error: 'Falha ao executar comando',
                            details: psError.message,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.log('[EXEC] ✅ Comando executado com sucesso (PowerShell)');
                        resolve({
                            success: true,
                            message: 'Comando executado com sucesso',
                            method: 'powershell-fallback',
                            command: command,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            } else {
                console.log('[EXEC] ✅ Comando executado com sucesso (CMD)');
                console.log('[EXEC] stdout:', stdout);
                console.log('[EXEC] stderr:', stderr);
                
                resolve({
                    success: true,
                    message: 'Comando executado com sucesso',
                    method: 'cmd-direct',
                    command: command,
                    timestamp: new Date().toISOString()
                });
            }
        });
    });
}

// Rota de status
app.get('/status', (req, res) => {
    console.log('[STATUS] Requisição de status recebida');
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
        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('[INJECT] Nova requisição recebida');
        console.log('[INJECT] Origin:', req.headers.origin || 'N/A');
        console.log('[INJECT] User-Agent:', req.headers['user-agent'] || 'N/A');

        // Verificar se Notepad está aberto
        console.log('[INJECT] Verificando Notepad...');
        const notepadOpen = await checkNotepadOpen();
        
        if (!notepadOpen) {
            console.log('[INJECT] ❌ Notepad não está aberto - bloqueado');
            console.log('═══════════════════════════════════════════════');
            return res.status(403).json({
                success: false,
                error: 'Notepad não está aberto',
                requiresNotepad: true,
                timestamp: new Date().toISOString()
            });
        }

        console.log('[INJECT] ✅ Notepad detectado');
        console.log('[INJECT] Executando comando REAL...');

        // Executar comando REAL
        const result = await executeRealCommand();
        
        console.log('[INJECT] Resultado:', result);
        console.log('═══════════════════════════════════════════════');
        console.log('');
        
        res.json(result);

    } catch (error) {
        console.error('[INJECT] ❌ Erro:', error);
        console.log('═══════════════════════════════════════════════');
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
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    console.log('[WS] Cliente conectado:', req.socket.remoteAddress);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('[WS] Mensagem recebida:', data);
            
            if (data.type === 'inject') {
                console.log('[WS] Comando inject recebido via WebSocket');

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

                // Executar comando REAL
                const result = await executeRealCommand();
                ws.send(JSON.stringify(result));
            }
        } catch (error) {
            console.error('[WS] Erro:', error);
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
    console.log('  🔥 WRAITH INJECT SERVER - REAL EXECUTION MODE');
    console.log('═══════════════════════════════════════════════');
    console.log(`  ✅ Servidor rodando em: http://0.0.0.0:${PORT}`);
    console.log(`  🔌 WebSocket: ws://0.0.0.0:${PORT}`);
    console.log(`  📡 Endpoints:`);
    console.log(`     GET  /status - Status do servidor`);
    console.log(`     POST /inject - Executar injeção REAL`);
    console.log('');
    console.log('  ⚠️  REQUISITOS:');
    console.log('     • Notepad deve estar aberto');
    console.log('     • Celular e PC na mesma rede WiFi');
    console.log('     • Firewall configurado (porta 8888)');
    console.log('');
    console.log('  🎯 COMANDO QUE SERÁ EXECUTADO:');
    console.log('     rundll32.exe "C:\\vfcompat.dll", windowssupport');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('✅ Servidor pronto! Aguardando requisições...');
    console.log('');
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('[ERROR] Exceção não tratada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Promise rejeitada:', reason);
});

export { app, server };
