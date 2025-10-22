const pool = require('./database');
const bcrypt = require('bcryptjs');

class User {
    // Criar usuário
    static async create(userData) {
        const { name, username, email, password } = userData;
        
        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.execute(
            'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
            [name, username, email, hashedPassword]
        );

        return {
            id: result.insertId,
            name,
            username,
            email,
            avatar: null,
            bio: null
        };
    }

    // Buscar por email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Buscar por email ou username
    static async findByEmailOrUsername(email, username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        return rows[0];
    }

    // Buscar por ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, username, email, avatar, bio, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Buscar estatísticas
    static async getStats(userId) {
        const [postsCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
            [userId]
        );

        const [followersCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM followers WHERE following_id = ?',
            [userId]
        );

        const [followingCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM followers WHERE follower_id = ?',
            [userId]
        );

        return {
            postsCount: postsCount[0].count,
            followersCount: followersCount[0].count,
            followingCount: followingCount[0].count
        };
    }

    // Atualizar perfil
    static async updateProfile(userId, profileData) {
        const { name, bio, avatar } = profileData;
        await pool.execute(
            'UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?',
            [name, bio, avatar, userId]
        );
    }
}

module.exports = { User };