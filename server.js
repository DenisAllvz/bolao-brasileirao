const express = require('express');
const cors = require('cors');
const brasileirao = require('campeonato-brasileiro-api');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); 

app.get('/jogos', async (req, res) => {
    try {
        const dados = await brasileirao.getRounds('a');
        const partidas = dados.rounds[0].matches;
        res.json(partidas);
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao buscar os jogos" });
    }
});

app.post('/login', (req, res) => {
    const tentativa = req.body;
    fs.readFile('usuarios.json', 'utf8', (erro, dados) => {
        if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro interno." });
        
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

app.post('/salvar-palpite', (req, res) => {
    const palpiteRecebido = req.body;
    fs.readFile('palpites.json', 'utf8', (erro, dadosAntigos) => {
        let todosOsPalpites = [];
        if (!erro && dadosAntigos) {
            try { todosOsPalpites = JSON.parse(dadosAntigos); } catch (e) {}
        }
        todosOsPalpites.push(palpiteRecebido);
        fs.writeFile('palpites.json', JSON.stringify(todosOsPalpites, null, 2), (erroGravacao) => {
            if (erroGravacao) return res.status(500).json({ erro: "Erro ao salvar!" });
            res.json({ mensagem: "Palpites salvos com sucesso!" });
        });
    });
});

app.listen(3000, () => console.log("🚀 Servidor rodando em http://localhost:3000"));