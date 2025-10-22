let currentMediaType = null;
let selectedMediaFile = null;

// Mostrar upload de mídia
function showMediaUpload(type) {
    currentMediaType = type;
    const mediaUpload = document.getElementById('mediaUpload');
    const mediaFileInput = document.getElementById('mediaFile');
    
    mediaUpload.style.display = 'block';
    mediaFileInput.accept = type === 'photo' ? 'image/*' : 'video/*';
    mediaFileInput.click();
}

// Cancelar upload
function cancelUpload() {
    document.getElementById('mediaUpload').style.display = 'none';
    document.getElementById('mediaFile').value = '';
    selectedMediaFile = null;
    currentMediaType = null;
}

// Preview da mídia
document.getElementById('mediaFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedMediaFile = file;
    const preview = document.getElementById('uploadPreview');
    preview.innerHTML = '';

    if (currentMediaType === 'photo') {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    } else {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        preview.appendChild(video);
    }
});

// Criar post
async function createPost() {
    if (!authToken) {
        alert('Faça login para postar');
        return;
    }

    const content = document.getElementById('postContent').value;
    if (!content && !selectedMediaFile) {
        alert('Digite algo ou adicione uma mídia');
        return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (selectedMediaFile) {
        formData.append('media', selectedMediaFile);
        formData.append('mediaType', currentMediaType);
    }

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('postContent').value = '';
            cancelUpload();
            loadUserPosts();
            alert('Post criado com sucesso!');
        } else {
            alert(data.message || 'Erro ao criar post');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão');
    }
}

// Carregar posts do usuário
async function loadUserPosts() {
    try {
        const response = await fetch(`${API_BASE}/posts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

// Exibir posts
function displayPosts(posts) {
    const postsFeed = document.getElementById('postsFeed');
    postsFeed.innerHTML = '';

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsFeed.appendChild(postElement);
    });
}

// Criar elemento de post
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.user.avatar || 'https://via.placeholder.com/40'}" alt="Avatar">
            <div class="post-user-info">
                <h4>${post.user.name}</h4>
                <span>@${post.user.username} • ${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        ${post.media ? `
            <div class="post-media">
                ${post.mediaType === 'photo' ? 
                    `<img src="${post.media}" alt="Post media">` : 
                    `<video src="${post.media}" controls></video>`
                }
            </div>
        ` : ''}
        <div class="post-actions">
            <div class="post-action" onclick="likePost(${post.id})">
                <i class="far fa-heart"></i>
                <span>${post.likesCount}</span>
            </div>
            <div class="post-action">
                <i class="far fa-comment"></i>
                <span>${post.commentsCount}</span>
            </div>
            <div class="post-action">
                <i class="far fa-share-square"></i>
                <span>Compartilhar</span>
            </div>
        </div>
    `;

    return postDiv;
}

// Curtir post
async function likePost(postId) {
    if (!authToken) {
        alert('Faça login para curtir posts');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadUserPosts(); // Recarregar posts para atualizar contagem
        }
    } catch (error) {
        console.error('Erro ao curtir post:', error);
    }
}