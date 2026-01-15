const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const net = require('net');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "SUA_CHAVE_SECRETA";

// Middleware
app.use(cors());
app.use(express.json());

// Executar comando no PC
function executeCommand(callback) {
    const command = 'rundll32.exe "C:\\vfcompat.dll", windowssupport';
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error.message}`);
            callback({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            callback({
                success: false,
                error: stderr,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        console.log(`Comando executado: ${stdout}`);
        callback({
            success: true,
            output: stdout,
            timestamp: new Date().toISOString()
        });
    });
}

// Rota de status
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        server: 'Inject Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rota principal de inject
app.post('/inject', (req, res) => {
    const { auth_key } = req.body;
    
    if (!auth_key || auth_key !== SECRET_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Não autorizado',
            timestamp: new Date().toISOString()
        });
    }
    
    executeCommand((result) => {
        res.json(result);
    });
});

// WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'inject' && data.auth_key === SECRET_KEY) {
                console.log('Recebido comando via WebSocket');
                
                executeCommand((result) => {
                    ws.send(JSON.stringify(result));
                });
            } else {
                ws.send(JSON.stringify({
                    success: false,
                    error: 'Não autorizado',
                    timestamp: new Date().toISOString()
                }));
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
        console.log('Cliente WebSocket desconectado');
    });
});

// Socket TCP simples para compatibilidade
function startTCPServer() {
    const tcpServer = net.createServer((socket) => {
        console.log('Cliente TCP conectado');
        
        socket.on('data', (data) => {
            const message = data.toString().trim();
            console.log(`TCP Recebido: ${message}`);
            
            if (message.includes('INJECT') && message.includes(SECRET_KEY)) {
                executeCommand((result) => {
                    socket.write(JSON.stringify(result));
                });
            } else {
                socket.write(JSON.stringify({
                    success: false,
                    error: 'Não autorizado',
                    timestamp: new Date().toISOString()
                }));
            }
        });
        
        socket.on('end', () => {
            console.log('Cliente TCP desconectado');
        });
    });
    
    tcpServer.listen(12345, () => {
        console.log('Servidor TCP rodando na porta 12345');
    });
}

// Iniciar servidores
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor Node.js rodando em: http://0.0.0.0:${PORT}`);
    console.log(`📡 Endpoints disponíveis:`);
    console.log(`   GET  /status`);
    console.log(`   POST /inject`);
    console.log(`🔌 WebSocket: ws://0.0.0.0:${PORT}`);
    console.log(`⚠️  Configure o IP do seu PC nas configurações do site`);
});

startTCPServer();

module.exports = { app, server };
