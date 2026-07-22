const URL_SERVIDOR = 'https://bolao-brasileirao-3row.onrender.com';
//const URL_SERVIDOR = 'http://localhost:3000';

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

// Lógica de Criar Conta
const btnRegistrar = document.getElementById('btn-registrar');

if (btnRegistrar) {
    btnRegistrar.addEventListener('click', async () => {
        const novoUsuario = document.getElementById('reg-usuario').value.toLowerCase().trim();
        const novaSenha = document.getElementById('reg-senha').value.trim();

        if (!novoUsuario || !novaSenha) return alert("Preencha todos os campos!");

        try {
            const resposta = await fetch(`${URL_SERVIDOR}/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: novoUsuario, senha: novaSenha })
            });
            const resultado = await resposta.json();
            
            alert(resultado.mensagem);
            
            // Se deu certo, limpa os campos para o usuário poder logar
            if (resultado.sucesso) {
                document.getElementById('reg-usuario').value = '';
                document.getElementById('reg-senha').value = '';
                // O Bootstrap fecha o modal manual clicando fora ou no 'X', o usuário volta pro login.
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor.");
        }
    });
}