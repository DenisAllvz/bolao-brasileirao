import { fetchMatches } from './api.js';

// Variáveis para guardar o estado do nosso Bolão
let todosOsJogos = [];
let datasDisponiveis = [];
let indiceDataAtual = 0;

// Pegando os elementos do HTML
const containerJogos = document.getElementById('lista-jogos');
const textoData = document.getElementById('data-atual');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');

async function iniciarBolao() {
    // Puxa a lista completa do seu servidor Node.js
    todosOsJogos = await fetchMatches();
    
    // Extrai o campo 'date' de cada jogo e tira as datas duplicadas[cite: 1]
    const apenasDatas = todosOsJogos.map(jogo => jogo.date); 
    datasDisponiveis = [...new Set(apenasDatas)].sort(); 
    
    if (datasDisponiveis.length > 0) {
        indiceDataAtual = 0; // Começa exibindo o primeiro dia da rodada
        desenharTela();
    } else {
        textoData.innerText = "Nenhum jogo encontrado na rodada.";
    }
}

function desenharTela() {
    // Descobre qual data devemos mostrar agora
    const dataFoco = datasDisponiveis[indiceDataAtual];
    
    // Atualiza o título (Ex: Converte "2026-04-25" para "25/04/2026")
    const partes = dataFoco.split('-');
    textoData.innerText = `Jogos do dia ${partes[2]}/${partes[1]}/${partes[0]}`;
    
    // Filtra o banco de dados para pegar SÓ os jogos dessa data específica[cite: 1]
    const jogosDoDia = todosOsJogos.filter(jogo => jogo.date === dataFoco); 
    
    // Limpa a tela para os novos jogos entrarem
    containerJogos.innerHTML = '';
    
    // Desenha cada cartão do dia
    jogosDoDia.forEach(jogo => {
        // Se a biblioteca diz que o 'status' é 'finished', ativamos as travas[cite: 1]
        const classeBloqueio = jogo.status === 'finished' ? 'jogo-encerrado' : ''; 
        const inputTrava = jogo.status === 'finished' ? 'disabled' : ''; 
        
        const cartaoHTML = `
            <div class="cartao-jogo ${classeBloqueio}" style="display:flex; justify-content:space-between; margin-bottom:10px; padding:15px; border:1px solid #ccc;">
                <span>${jogo.homeTeam}</span>
                <input type="number" placeholder="0" style="width: 40px;" ${inputTrava}>
                <span>X</span>
                <input type="number" placeholder="0" style="width: 40px;" ${inputTrava}>
                <span>${jogo.awayTeam}</span>
            </div>
        `;
        
        containerJogos.innerHTML += cartaoHTML;
    });
    
    // Liga ou desliga as setas se chegamos no limite dos dias
    btnAnterior.disabled = (indiceDataAtual === 0);
    btnProximo.disabled = (indiceDataAtual === datasDisponiveis.length - 1);
}

// Configurando as setinhas (Event Listeners)
btnAnterior.addEventListener('click', () => {
    if (indiceDataAtual > 0) {
        indiceDataAtual--;
        desenharTela();
    }
});

btnProximo.addEventListener('click', () => {
    if (indiceDataAtual < datasDisponiveis.length - 1) {
        indiceDataAtual++;
        desenharTela();
    }
});

// Dá a partida no motor!
iniciarBolao();