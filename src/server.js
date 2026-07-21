const express = require('express');
const cors = require('cors');
const brasileirao = require('campeonato-brasileiro-api');
const fs = require('fs');
const path = require('path'); // NOVO: Importa o gerenciador de caminhos do Node

// Carrega as variáveis de ambiente
require('dotenv').config();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ... (sua trava de segurança do .env continua igual aqui) ...
let credenciais;
try {
    if (!process.env.FIREBASE_CREDENTIALS) {
        throw new Error("A variável FIREBASE_CREDENTIALS não foi encontrada no arquivo .env!");
    }
    credenciais = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (erro) {
    console.error("❌ ERRO NO .ENV:", erro.message);
    process.exit(1);
}

initializeApp({
    credential: cert(credenciais)
});
const db = getFirestore(); 

const app = express();
app.use(cors());
app.use(express.json()); 

// ==========================================
// MÁGICA AQUI: Diz ao servidor para usar a pasta 'public'
// ==========================================
app.use(express.static(path.join(__dirname, '../public')));

// ROTA 1: BUSCAR OS JOGOS DA API
app.get('/jogos', async (req, res) => {
    try {
        const dados = await brasileirao.getRounds('a');
        const partidas = dados.rounds[0].matches;
        res.json(partidas);
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao buscar os jogos" });
    }
});

// ROTA 2: VERIFICAR LOGIN (Note que agora aponta para ./usuarios.json dentro de src)
app.post('/login', (req, res) => {
    const tentativa = req.body;
    
    // MÁGICA AQUI: Usa __dirname para achar o usuarios.json dentro da pasta src
    const caminhoUsuarios = path.join(__dirname, 'usuarios.json');

    fs.readFile(caminhoUsuarios, 'utf8', (erro, dados) => {
        if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor." });

        try {
            const usuarios = JSON.parse(dados);
            const usuarioValido = usuarios.find(u => u.usuario === tentativa.usuario && u.senha === tentativa.senha);

            if (usuarioValido) {
                res.json({ sucesso: true, mensagem: "Bem-vindo!" });
            } else {
                res.status(401).json({ sucesso: false, mensagem: "Usuário ou senha incorretos." });
            }
        } catch (erroJson) {
            res.status(500).json({ sucesso: false, mensagem: "Erro no banco de usuários." });
        }
    });
});
// ROTA 3: SALVAR PALPITE NA NUVEM
app.post('/salvar-palpite', async (req, res) => {
    const palpiteRecebido = req.body;
    console.log("Enviando palpite para o Firebase: ", palpiteRecebido.usuario);

    try {
        await db.collection('palpites').add(palpiteRecebido);
        res.json({ mensagem: "Palpites salvos com sucesso na nuvem!" });
    } catch (erro) {
        console.error("Erro ao salvar no banco:", erro);
        res.status(500).json({ erro: "Erro ao trancar o cofre na nuvem!" });
    }
});

// Liga o motor do servidor
app.listen(3000, () => {
    console.log("🚀 Servidor rodando e conectado ao Firebase na porta 3000");
});