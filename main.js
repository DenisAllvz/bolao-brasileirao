// O Gerente "importa" as ferramentas dos outros arquivos
import { fetchMatches } from './api.js';
import { renderMatches } from './ui.js';

// Função principal de inicialização
async function startApp() {
    // 1. Pede para a API buscar os dados
    const games = await fetchMatches();
    
    // 2. Manda a UI desenhar esses dados na tela
    renderMatches(games);
}

// Inicia o aplicativo
startApp();