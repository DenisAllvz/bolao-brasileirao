const express = require('express');
const cors = require('cors');
const brasileirao = require('campeonato-brasileiro-api');
const path = require('path');
require('dotenv').config();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ==========================================
// 1. INICIALIZAÇÃO DO FIREBASE (BANCO DE DADOS)
// ==========================================
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

// ==========================================
// 2. INICIALIZAÇÃO DO EXPRESS (MOTOR DO SERVIDOR)
// ==========================================
const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../public'))); // Conecta a pasta public

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
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
    
    // 2. Acertou a diferença de gols + vencedor/empate = 2 pontos
    if (acertouDiferenca && acertouVencedorOuEmpate) return 2;
    
    // 3. Acertou só o vencedor/empate (sem acertar a diferença exata) = 1 ponto
    if (acertouVencedorOuEmpate) return 1;
    
    // Errou tudo = 0 pontos
    return 0;
}

// ==========================================
// 3. ROTAS DA APLICAÇÃO (Agora que o 'app' existe, elas funcionam!)
// ==========================================

// ROTA: BUSCAR OS JOGOS DA API
app.get('/jogos', async (req, res) => {
    try {
        const dados = await brasileirao.getRounds('a');
        const partidas = dados.rounds[0].matches;
        res.json(partidas);
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao buscar os jogos" });
    }
});

// ROTA: VERIFICAR LOGIN (Agora usando o Firebase!)
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    
    try {
        const userRef = db.collection('usuarios').doc(usuario);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado no sistema!" });
        }

        const dadosUsuario = doc.data();

        if (dadosUsuario.senha === senha) {
            res.json({ sucesso: true, mensagem: "Bem-vindo!" });
        } else {
            res.status(401).json({ sucesso: false, mensagem: "Senha incorreta." });
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ sucesso: false, mensagem: "Erro no banco de dados." });
    }
});

// ROTA: CRIAR NOVA CONTA
app.post('/registrar', async (req, res) => {
    const { usuario, senha } = req.body;
    
    try {
        const userRef = db.collection('usuarios').doc(usuario);
        const doc = await userRef.get();

        // Verifica se o usuário já existe para não deixar sobrescrever
        if (doc.exists) {
            return res.status(400).json({ sucesso: false, mensagem: "Esse usuário já existe! Escolha outro nome." });
        }

        // Salva o novo usuário com a senha no Firebase
        await userRef.set({ senha: senha });
        res.json({ sucesso: true, mensagem: "Conta criada com sucesso! Você já pode fazer login." });
        
    } catch (erro) {
        console.error("Erro ao registrar:", erro);
        res.status(500).json({ sucesso: false, mensagem: "Erro ao criar conta no banco de dados." });
    }
});

// ROTA: MUDAR SENHA (No Firebase)
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
        res.json({ sucesso: true, mensagem: "Senha alterada com sucesso!" }); 
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar senha." });
    }
});

// ROTA: SALVAR PALPITE NA NUVEM
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

// ==========================================
// 4. LIGAR O MOTOR DO SERVIDOR (Sempre no final)
// ==========================================
app.listen(3000, () => {
    console.log("🚀 Servidor rodando e conectado ao Firebase na porta 3000");
});