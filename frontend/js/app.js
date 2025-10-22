// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Navegação responsiva
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Carregar estatísticas do usuário
async function loadUserStats() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE}/users/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById('postsCount').textContent = stats.postsCount;
            document.getElementById('followersCount').textContent = stats.followersCount;
            document.getElementById('followingCount').textContent = stats.followingCount;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se está logado e carregar dados
    if (authToken && currentUser) {
        loadUserStats();
    }
});