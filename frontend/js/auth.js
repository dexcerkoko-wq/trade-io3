const API_BASE = 'https://trade-io3.onrender.com/api';

// Estado da aplicação
let currentUser = null;
let authToken = null;

// Elementos DOM
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const createPostSection = document.getElementById('createPost');
const userCard = document.getElementById('userCard');

// Funções de Modal
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    closeModal('loginModal');
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIAfterLogin();
            closeModal('loginModal');
            loadUserPosts();
        } else {
            alert(data.message || 'Erro no login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
});

// Registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    if (formData.get('password') !== formData.get('confirmPassword')) {
        alert('Senhas não coincidem');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Conta criada com sucesso! Faça login.');
            closeModal('registerModal');
            showLogin();
        } else {
            alert(data.message || 'Erro no cadastro');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
});

// Atualizar UI após login
function updateUIAfterLogin() {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    createPostSection.style.display = 'block';
    userCard.style.display = 'block';

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.avatar || 'https://via.placeholder.com/35';
    document.getElementById('currentUserAvatar').src = currentUser.avatar || 'https://via.placeholder.com/40';
    document.getElementById('cardName').textContent = currentUser.name;
    document.getElementById('cardAvatar').src = currentUser.avatar || 'https://via.placeholder.com/80';
    document.getElementById('cardBio').textContent = currentUser.bio || 'Bem-vindo ao Trade.io!';
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIAfterLogin();
        loadUserPosts();
    }
});

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
    createPostSection.style.display = 'none';
    userCard.style.display = 'none';
    
    document.getElementById('postsFeed').innerHTML = '';
}