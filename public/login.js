const URL_SERVIDOR = 'https://bolao-brasileirao-3row.onrender.com';

const btnEntrar = document.getElementById('btn-entrar');

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
            // Salva o usuário logado na memória do navegador e redireciona para o bolão
            localStorage.setItem('usuarioLogado', usuarioDigitado);
            window.location.href = 'bolao.html';
        } else {
            alert(resultado.mensagem); 
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
});