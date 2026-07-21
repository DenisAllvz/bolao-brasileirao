export async function fetchMatches() {
    const url = 'http://localhost:3000/jogos'; 

    try {
        const resposta = await fetch(url);
        const partidas = await resposta.json();
        
        // COMANDO DE ESPIONAGEM: Pode apagar ou deixar aqui se quiser investigar depois
        // console.log("DADOS DO JOGO:", partidas[0]); 
        
        if (!Array.isArray(partidas)) {
            console.error("O servidor não enviou uma lista válida:", partidas);
            return [];
        }
        
        const jogosFormatados = partidas.map(jogo => {
            return {
                homeTeam: jogo.homeTeam.name,
                awayTeam: jogo.awayTeam.name,
                
                // MÁGICA ACONTECENDO AQUI: Agora usamos a palavra certa (badge)
                homeLogo: jogo.homeTeam.badge || '',
                awayLogo: jogo.awayTeam.badge || '',
                
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