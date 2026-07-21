export async function fetchMatches() {
    // Agora o seu site pede os dados direto para o seu próprio servidor Node.js!
    const url = 'http://localhost:3000/jogos'; 

    try {
        console.log("Frontend pedindo dados para o Backend local...");
        
        const resposta = await fetch(url);
        const partidas = await resposta.json();
        
        // Traduzindo a estrutura oficial da biblioteca para os nossos cartões HTML
        const jogosFormatados = partidas.map(jogo => {
            return {
                // A biblioteca entrega os nomes dentro de homeTeam.name e awayTeam.name[cite: 1]
                homeTeam: jogo.homeTeam.name, //[cite: 1]
                awayTeam: jogo.awayTeam.name, //[cite: 1]
                matchId: jogo.id              //[cite: 1]
            };
        });
        
        return jogosFormatados;

    } catch (erro) {
        console.error("Frontend não conseguiu falar com o Backend:", erro);
        return []; 
    }
}