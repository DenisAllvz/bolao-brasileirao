export async function fetchMatches() {
    const url = 'http://localhost:3000/jogos'; 

    try {
        const resposta = await fetch(url);
        const partidas = await resposta.json();
        
        if (!Array.isArray(partidas)) {
            console.error("O servidor não enviou uma lista válida:", partidas);
            return [];
        }
        
        const jogosFormatados = partidas.map(jogo => {
            return {
                homeTeam: jogo.homeTeam.name,
                awayTeam: jogo.awayTeam.name,
                homeLogo: jogo.homeTeam.logo || jogo.homeTeam.shield || jogo.homeTeam.crest || '',
                awayLogo: jogo.awayTeam.logo || jogo.awayTeam.shield || jogo.awayTeam.crest || '',
                matchId: jogo.id,
                date: jogo.date,
                status: jogo.status
            };
        });
        
        return jogosFormatados;

    } catch (erro) {
        console.error("Erro de comunicação com a API:", erro);
        return []; 
    }
}