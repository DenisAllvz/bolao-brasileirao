import { fetchMatches } from './api.js';

const URL_SERVIDOR = 'https://bolao-brasileirao-3row.onrender.com';

let todosOsJogos = [];
let datasDisponiveis = [];
let indiceDataAtual = 0;
let usuarioLogado = ""; 

const telaLogin = document.getElementById('tela-login');
const telaBolao = document.getElementById('tela-bolao');
const btnEntrar = document.getElementById('btn-entrar');
const containerJogos = document.getElementById('lista-jogos');
const textoData = document.getElementById('data-atual');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');
const btnSalvar = document.getElementById('btn-salvar');

// Lógica de Login
btnEntrar.addEventListener('click', async () => {
    const usuarioDigitado = document.getElementById('login-usuario').value.toLowerCase().trim();
    const senhaDigitada = document.getElementById('login-senha').value.trim();

    if (!usuarioDigitado || !senhaDigitada) return alert("Preencha usuário e senha!");

    try {
        const resposta = await fetch(`${URL_SERVIDOR}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuarioDigitado, senha: senhaDigitada })
        });
        const resultado = await resposta.json();

        if (resultado.sucesso) {
            usuarioLogado = usuarioDigitado; 
            telaLogin.style.display = 'none'; 
            telaBolao.style.display = 'block'; 
            iniciarBolao(); 
        } else {
            alert(resultado.mensagem); 
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
});

// Lógica de montar a tela
async function iniciarBolao() {
    todosOsJogos = await fetchMatches();
    const apenasDatas = todosOsJogos.map(jogo => jogo.date); 
    datasDisponiveis = [...new Set(apenasDatas)].sort(); 
    
    if (datasDisponiveis.length > 0) {
        // --- Lógica da Data Atual (Ajustada para GMT-3) ---
        const dataAjustada = new Date(new Date().getTime() - 3 * 3600 * 1000);
        const dataDeHoje = dataAjustada.toISOString().split('T')[0]; // Ex: "2026-07-21"
        
        const indiceHoje = datasDisponiveis.indexOf(dataDeHoje);
        
        if (indiceHoje !== -1) {
            indiceDataAtual = indiceHoje; // Se tem jogo hoje, abre na data de hoje!
        } else {
            indiceDataAtual = 0; // Se não tem, vai para o 1º dia da rodada
        }
        // ---------------------------------------------------

        desenharTela();
    } else {
        textoData.innerText = "Nenhum jogo encontrado.";
    }
}

function desenharTela() {
    const dataFoco = datasDisponiveis[indiceDataAtual];
    const partes = dataFoco.split('-');
    textoData.innerText = `Jogos do dia ${partes[2]}/${partes[1]}/${partes[0]}`;
    
    const jogosDoDia = todosOsJogos.filter(jogo => jogo.date === dataFoco); 
    containerJogos.innerHTML = '';
    
    jogosDoDia.forEach(jogo => {
        const classeBloqueio = jogo.status === 'finished' ? 'jogo-encerrado' : ''; 
        const inputTrava = jogo.status === 'finished' ? 'disabled' : ''; 
        
        // Se a API não mandar a imagem, criamos uma estrutura vazia para não quebrar a tela
        const imgCasa = jogo.homeLogo ? `<img src="${jogo.homeLogo}" class="escudo">` : '';
        const imgFora = jogo.awayLogo ? `<img src="${jogo.awayLogo}" class="escudo">` : '';

        const cartaoHTML = `
            <div class="cartao-jogo ${classeBloqueio}">
                
                <!-- Bloco do Time da Casa -->
                <div class="time-box time-casa">
                    <span>${jogo.homeTeam}</span>
                    ${imgCasa}
                </div>
                
                <!-- Inputs de Placar -->
                <input type="number" id="home-${jogo.matchId}" placeholder="0" ${inputTrava}>
                <span class="versus">X</span>
                <input type="number" id="away-${jogo.matchId}" placeholder="0" ${inputTrava}>
                
                <!-- Bloco do Time Visitante -->
                <div class="time-box time-fora">
                    ${imgFora}
                    <span>${jogo.awayTeam}</span>
                </div>
                
            </div>
        `;
        containerJogos.innerHTML += cartaoHTML;
    });
    
    btnAnterior.disabled = (indiceDataAtual === 0);
    btnProximo.disabled = (indiceDataAtual === datasDisponiveis.length - 1);
}

// Lógica dos Botões
btnAnterior.addEventListener('click', () => {
    if (indiceDataAtual > 0) { indiceDataAtual--; desenharTela(); }
});

btnProximo.addEventListener('click', () => {
    if (indiceDataAtual < datasDisponiveis.length - 1) { indiceDataAtual++; desenharTela(); }
});

btnSalvar.addEventListener('click', async () => {
    const dataFoco = datasDisponiveis[indiceDataAtual];
    const jogosDoDia = todosOsJogos.filter(jogo => jogo.date === dataFoco);
    const meusPalpites = [];
    
    jogosDoDia.forEach(jogo => {
        if (jogo.status === 'finished') return; 
        const palpiteHome = document.getElementById(`home-${jogo.matchId}`).value;
        const palpiteAway = document.getElementById(`away-${jogo.matchId}`).value;
        
        if (palpiteHome !== "" && palpiteAway !== "") {
            meusPalpites.push({
                matchId: jogo.matchId, homeTeam: jogo.homeTeam, awayTeam: jogo.awayTeam,
                placarHome: parseInt(palpiteHome), placarAway: parseInt(palpiteAway)
            });
        }
    });

    if (meusPalpites.length === 0) return alert("Você não preencheu nenhum palpite válido!");

    try {
        const resposta = await fetch(`${URL_SERVIDOR}/salvar-palpite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuarioLogado, dataAposta: new Date().toISOString(), palpites: meusPalpites })
        });
        const resultado = await resposta.json();
        alert(resultado.mensagem); 
    } catch (erro) {
        alert("Ops! O servidor não conseguiu guardar seu palpite.");
    }
});