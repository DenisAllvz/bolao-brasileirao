// Exporta a função para que o main.js possa usá-la
export function renderMatches(matchesArray) {
    const container = document.getElementById("matches-container");
    container.innerHTML = ""; // Limpa a tela antes de desenhar

    matchesArray.forEach(match => {
        const matchHTML = `
            <div class="match-card">
                <span class="team-name">${match.homeTeam}</span>
                <input type="number" id="home-${match.matchId}" class="score-input" min="0" max="20">
                <span class="vs-text"> X </span>
                <input type="number" id="away-${match.matchId}" class="score-input" min="0" max="20">
                <span class="team-name">${match.awayTeam}</span>
            </div>
            <br><br>
        `;
        container.innerHTML += matchHTML;
    });
}