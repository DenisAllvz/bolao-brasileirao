export async function fetchMatches() {
    const url = 'http://localhost:3000/jogos'; 

    try {
        const resposta = await fetch(url);
        const partidas = await resposta.json();
        
        const jogosFormatados = partidas.map(jogo => {
            return {
                homeTeam: jogo.homeTeam.name, //
                awayTeam: jogo.awayTeam.name, //[cite: 1]
                matchId: jogo.id,             //[cite: 1]
                date: jogo.date,              // NOVO: Pega a data ("YYYY-MM-DD")[cite: 1]
                status: jogo.status           // NOVO: "finished", "scheduled", etc.[cite: 1]
            };
        });
        
        return jogosFormatados;

    } catch (erro) {
        console.error("Erro:", erro);
        return []; 
    }
}