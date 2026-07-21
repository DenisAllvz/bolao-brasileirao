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

function calcularPontos(palpiteHome, palpiteAway, realHome, realAway) {
    const diffPalpite = palpiteHome - palpiteAway;
    const diffReal = realHome - realAway;
    
    const acertouPlacarExato = (palpiteHome === realHome && palpiteAway === realAway);
    
    // Identifica se acertou quem venceu ou se acertou o empate
    const acertouVencedorOuEmpate = (
        (palpiteHome > palpiteAway && realHome > realAway) ||
        (palpiteHome < palpiteAway && realHome < realAway) ||
        (palpiteHome === palpiteAway && realHome === realAway)
    );
    
    const acertouDiferenca = (diffPalpite === diffReal);

    // 1. Acertou o placar exato = 3 pontos
    if (acertouPlacarExato) return 3;
    
    // 2. Acertou a diferença de gols + vencedor/empate (mas errou o placar exato) = 2 pontos
    if (acertouDiferenca && acertouVencedorOuEmpate) return 2;
    
    // 3. Acertou só o vencedor/empate (sem acertar a diferença exata) = 1 ponto
    if (acertouVencedorOuEmpate) return 1;
    
    // Errou tudo = 0 pontos
    return 0;
}

app.post('/mudar-senha', async (req, res) => {
    const { usuario, senhaAtual, novaSenha } = req.body;
    try {
        const userRef = db.collection('usuarios').doc(usuario);
        const doc = await userRef.get();

        if (!doc.exists) return res.json({ sucesso: false, mensagem: "Usuário não encontrado." });

        if (doc.data().senha !== senhaAtual) {
            return res.json({ sucesso: false, mensagem: "Senha atual incorreta." });
        }

        await userRef.update({ senha: novaSenha });
        res.json({ sucesso: false, sucesso: true, mensagem: "Senha alterada com sucesso!" }); // Note: adjust property as needed
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar senha." });
    }
});

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