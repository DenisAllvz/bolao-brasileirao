const API_KEY = 'e0c7229891msh3be0e93a7b40824p179a29jsne1d1e1dcf7c4'; 
const API_HOST = 'free-api-live-football-data.p.rapidapi.com';

export async function fetchMatches() {
    // COLE A URL DO CODE SNIPPET AQUI ABAIXO:
    const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-all-matches-by-league?leagueid=268'; 

    const opcoes = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
        }
    };

    try {
        console.log("Buscando jogos reais na API...");
        const resposta = await fetch(url, opcoes);
        const dados = await resposta.json();
        
        // Verifica se a API mandou jogos de verdade (se o tamanho da lista é maior que zero)
        if (dados.response && dados.response.matches && dados.response.matches.length > 0) {
            console.log("A API mandou jogos reais!", dados);
            // Aqui no futuro vamos adaptar os nomes das variáveis da API para as nossas
            return dados.response.matches; 
        } else {
            console.log("A API mandou 0 jogos. Carregando dados de teste do Bolão...");
            // PLANO B: Nossa lista de teste para continuarmos construindo o site!
            return [
                { homeTeam: "Flamengo", awayTeam: "Palmeiras", matchId: 101 },
                { homeTeam: "Vasco", awayTeam: "Botafogo", matchId: 102 },
                { homeTeam: "São Paulo", awayTeam: "Corinthians", matchId: 103 },
                { homeTeam: "Grêmio", awayTeam: "Internacional", matchId: 104 },
                { homeTeam: "Cruzeiro", awayTeam: "Atlético-MG", matchId: 105 }
            ];
        }

    } catch (erro) {
        console.error("Ops! Erro na conexão:", erro);
        return []; 
    }
}