const express = require('express');
const cors = require('cors');
// Importando a biblioteca Open Source do GitHub
const brasileirao = require('campeonato-brasileiro-api'); //[cite: 1]

const app = express();

// Permite que o Live Server (Frontend) converse com o Node.js (Backend)
app.use(cors()); 

// Criando a nossa própria URL pública (Endpoint)
app.get('/jogos', async (req, res) => {
    try {
        console.log("Alguém pediu os jogos! Buscando na biblioteca...");
        
        // Buscando a rodada atual da Série A ('a')[cite: 1]
        const dados = await brasileirao.getRounds('a'); //[cite: 1]
        
        // A biblioteca retorna as rodadas dentro de um array 'rounds'[cite: 1]
        // Vamos pegar os jogos ('matches') da primeira rodada que vier na lista[cite: 1]
        const partidas = dados.rounds[0].matches; //[cite: 1]
        
        // O servidor devolve as partidas no formato JSON para quem pediu
        res.json(partidas);

    } catch (erro) {
        console.error("Deu ruim no servidor:", erro);
        res.status(500).json({ erro: "Falha ao buscar os jogos" });
    }
});

// Ligando o servidor na porta 3000
app.listen(3000, () => {
    console.log("🚀 Servidor do Bolão rodando com sucesso em http://localhost:3000");
});