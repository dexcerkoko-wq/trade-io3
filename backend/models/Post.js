const pool = require('./database');

class Post {
    // Criar post
    static async create(postData) {
        const { content, media, mediaType, userId } = postData;
        
        const [result] = await pool.execute(
            'INSERT INTO posts (content, media, media_type, user_id) VALUES (?, ?, ?, ?)',
            [content, media, mediaType, userId]
        );

        return {
            id: result.insertId,
            content,
            media,
            mediaType,
            userId
        };
    }

    // Buscar post por ID com dados do usuário
    static async findByIdWithUser(postId) {
        const [rows] = await pool.execute(`
            SELECT p.*, u.name, u.username, u.avatar 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `, [postId]);
        return rows[0];
    }

    // Buscar todos os posts com dados dos usuários
    static async findAllWithUsers() {
        const [rows] = await pool.execute(`
            SELECT 
                p.*, 
                u.name, 
                u.username, 
                u.avatar,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    // Curtir/descurtir post
    static async toggleLike(postId, userId) {
        // Verificar se já curtiu
        const [existing] = await pool.execute(
            'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existing.length > 0) {
            // Remover like
            await pool.execute(
                'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
        } else {
            // Adicionar like
            await pool.execute(
                'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                [postId, userId]
            );
        }
    }

    // Adicionar comentário
    static async addComment(postId, userId, content) {
        const [result] = await pool.execute(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [postId, userId, content]
        );

        return {
            id: result.insertId,
            postId,
            userId,
            content
        };
    }
}

module.exports = { Post };