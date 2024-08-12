import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDr27BIHswRcTvvE5lUpR-l4OMGwGFQQaw",
    authDomain: "meliodaslogin-bae06.firebaseapp.com",
    projectId: "meliodaslogin-bae06",
    storageBucket: "meliodaslogin-bae06.appspot.com",
    messagingSenderId: "292569281051",
    appId: "1:292569281051:web:473895afda6419bc747ebe",
    measurementId: "G-3N0G8EFNMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();
const db = getFirestore(app);

const forbiddenUsernames = ['aghamenon toberlock estudos', 'aghamenon toberlock estudo', 'aghamenon toberlock estud', 'aghamenon toberlock estu', 'aghamenon toberlock est', 'aghamenon toberlock es', 'aghamenon toberlock e', 'aghamenon toberlock', 'aghamenon toberloc', 'aghamenon toberlo', 'aghamenon toberl', 'aghamenon tober', 'aghamenon tobe', 'aghamenon tob', 'aghamenon to', 'aghamenon t', 'aghamenon', 'aghamenont', 'aghamenonto', 'aghamenontob', 'aghamenontobe', 'aghamenontober', 'aghamenontoberl', 'aghamenontoberlo', 'aghamenontoberloc', 'aghamenontoberlock', 'aghamenontoberlocke', 'aghamenontoberlockes', 'aghamenontoberlockest', 'aghamenontoberlockestu', 'aghamenontoberlockestud', 'aghamenontoberlockestudo', 'aghamenontoberlockestudos', 'aghamenon-toberlock-estudos', 'aghamenon-toberlockestudos', 'aghamenontoberlock-estudos', 'aghamenon_toberlockestudos', 'aghamenon_toberlock_estudos', 'aghamenontoberlock_estudos']; // Adicione outros nomes proibidos aqui, todos em minúsculas

// Função para exibir notificação
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Verifica se o nome de usuário está na lista de proibidos (insensível a maiúsculas e minúsculas)
function isUsernameForbidden(username) {
    const lowercaseUsername = username.toLowerCase();
    return forbiddenUsernames.includes(lowercaseUsername);
}

// Gerar Game Tag Única
async function generateUniqueGameTag(username) {
    let gameTag;
    let isUnique = false;
    while (!isUnique) {
        const randomTag = Math.floor(1000 + Math.random() * 9000); // Gerar número aleatório de 4 dígitos
        gameTag = `${username}#${randomTag}`;
        const querySnapshot = await getDoc(doc(db, "userTags", gameTag));
        if (!querySnapshot.exists()) {
            isUnique = true;
        }
    }
    return gameTag;
}

// Login com email e senha
document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Verificar se o usuário já existe no Firestore
            getDoc(doc(db, "users", user.uid)).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    showNotification(`Logado com sucesso! Bem-vindo, ${userData.username}.`);
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Ajuste o URL para a página principal conforme necessário
                    }, 3000);
                } else {
                    showNotification(`Este email (${email}) não está registrado. Faça o registro primeiro.`);
                }
            }).catch((error) => {
                console.error('Erro ao verificar dados do usuário:', error);
                showNotification('Ocorreu um erro ao verificar os dados do usuário.');
            });
        })
        .catch((error) => {
            console.error('Erro ao fazer login:', error);
            if (error.code === 'auth/user-not-found') {
                showNotification(`Este email (${email}) não está registrado. Faça o registro primeiro.`);
            } else if (error.code === 'auth/wrong-password') {
                showNotification('Senha incorreta. Tente novamente.');
            } else {
                showNotification('Ocorreu um erro ao fazer login. Tente novamente.');
            }
        });
});

// Login com Google
document.getElementById('google-login').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            // Verificar se o usuário já existe no Firestore
            getDoc(doc(db, "users", user.uid)).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    showNotification(`Logado com sucesso! Bem-vindo, ${userData.username}.`);
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Ajuste o URL para a página principal conforme necessário
                    }, 3000);
                } else {
                    // Se o usuário não existe, solicitar informações adicionais
                    const username = prompt('Digite um nome de usuário:');
                    if (username) {
                        if (isUsernameForbidden(username)) {
                            showNotification('Este nome de usuário não é permitido.');
                            return;
                        }
                        // Gerar Game Tag
                        generateUniqueGameTag(username).then((gameTag) => {
                            setDoc(doc(db, "users", user.uid), {
                                uid: user.uid,
                                email: user.email,
                                username: username,
                                gameTag: gameTag
                            }).then(() => {
                                showNotification(`Conta criada com sucesso! Bem-vindo, ${username}.`);
                                setTimeout(() => {
                                    window.location.href = 'index.html'; // Ajuste o URL para a página principal conforme necessário
                                }, 3000);
                            }).catch((error) => {
                                console.error('Erro ao salvar dados do usuário:', error);
                                showNotification('Ocorreu um erro ao salvar os dados do usuário.');
                            });
                        }).catch((error) => {
                            console.error('Erro ao gerar Game Tag:', error);
                            showNotification('Ocorreu um erro ao gerar o Game Tag.');
                        });
                    } else {
                        showNotification('Nome de usuário é obrigatório.');
                    }
                }
            }).catch((error) => {
                console.error('Erro ao verificar dados do usuário:', error);
                showNotification('Ocorreu um erro ao verificar os dados do usuário.');
            });
        })
        .catch((error) => {
            console.error('Erro ao fazer login com Google:', error);
            showNotification('Ocorreu um erro ao fazer login com Google. Tente novamente.');
        });
});

// Registrar com email e senha
document.getElementById('register-button').addEventListener('click', () => {
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;
    const username = document.getElementById('username-register').value;

    if (!username) {
        showNotification('Nome de usuário é obrigatório.');
        return;
    }

    if (isUsernameForbidden(username)) {
        showNotification('Este nome de usuário não é permitido.');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Gerar Game Tag
            generateUniqueGameTag(username).then((gameTag) => {
                setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    username: username,
                    gameTag: gameTag
                }).then(() => {
                    showNotification(`Conta criada com sucesso! Bem-vindo, ${username}.`);
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Ajuste o URL para a página principal conforme necessário
                    }, 3000);
                }).catch((error) => {
                    console.error('Erro ao salvar dados do usuário:', error);
                    showNotification('Ocorreu um erro ao salvar os dados do usuário.');
                });
            }).catch((error) => {
                console.error('Erro ao gerar Game Tag:', error);
                showNotification('Ocorreu um erro ao gerar o Game Tag.');
            });
        })
        .catch((error) => {
            console.error('Erro ao registrar:', error);
            if (error.code === 'auth/email-already-in-use') {
                showNotification(`Este email (${email}) já está em uso. Tente outro email.`);
            } else {
                showNotification('Ocorreu um erro ao registrar. Tente novamente.');
            }
        });
});

// Registrar com Google
document.getElementById('google-register').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            getDoc(doc(db, "users", user.uid)).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    showNotification(`Logado com sucesso! Bem-vindo, ${userData.username}.`);
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Ajuste o URL para a página principal conforme necessário
                    }, 3000);
                } else {
                    // Se o usuário não existe, solicitar informações adicionais
                    const username = prompt('Digite um nome de usuário:');
                    if (username) {
                        if (isUsernameForbidden(username)) {
                            showNotification('Este nome de usuário não é permitido.');
                            return;
                        }
                        generateUniqueGameTag(username).then((gameTag) => {
                            setDoc(doc(db, "users", user.uid), {
                                uid: user.uid,
                                email: user.email,
                                username: username,
                                gameTag: gameTag
                            }).then(() => {
                                showNotification(`Conta criada com sucesso! Bem-vindo, ${username}.`);
                                setTimeout(() => {
                                    window.location.href = 'index.html'; // Ajuste o URL para a página principal conforme necessário
                                }, 3000);
                            }).catch((error) => {
                                console.error('Erro ao salvar dados do usuário:', error);
                                showNotification('Ocorreu um erro ao salvar os dados do usuário.');
                            });
                        }).catch((error) => {
                            console.error('Erro ao gerar Game Tag:', error);
                            showNotification('Ocorreu um erro ao gerar o Game Tag.');
                        });
                    } else {
                        showNotification('Nome de usuário é obrigatório.');
                    }
                }
            }).catch((error) => {
                console.error('Erro ao verificar dados do usuário:', error);
                showNotification('Ocorreu um erro ao verificar os dados do usuário.');
            });
        })
        .catch((error) => {
            console.error('Erro ao registrar com Google:', error);
            showNotification('Ocorreu um erro ao registrar com Google. Tente novamente.');
        });
});
