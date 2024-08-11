document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    loginButton.addEventListener('click', function() {
        loginModal.style.display = 'block';
    });

    closeLoginModal.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Adicione a lógica de autenticação aqui (Firebase Authentication, por exemplo)
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Exemplo de uso do Firebase Authentication
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Login bem-sucedido
                const user = userCredential.user;
                loginButton.style.display = 'none';
                logoutButton.style.display = 'block';
                loginModal.style.display = 'none';
                // Aqui você pode carregar as informações do usuário, como biografia, foto de perfil e ranking
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // Trate os erros aqui
                alert(errorMessage);
            });
    });

    logoutButton.addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            // Logout bem-sucedido
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
        }).catch((error) => {
            // Trate os erros aqui
            alert(error.message);
        });
    });
});
