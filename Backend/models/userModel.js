import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

let hasAddressColumnCache = null;

const hasAddressColumn = async () => {
    if (hasAddressColumnCache !== null) return hasAddressColumnCache;

    const [rows] = await pool.execute(
        `
        SELECT COUNT(*) AS cnt
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'address'
        `
    );

    hasAddressColumnCache = Number(rows[0]?.cnt || 0) > 0;
    return hasAddressColumnCache;
};

const UserModel = {
    async findByEmail(email){
        const sql = 'SELECT * FROM users WHERE email =?';
        const [rows] = await pool.execute(sql, [email]);
        return rows[0];
    },

    async findById(id) {
       const includeAddress = await hasAddressColumn();
       const sql = includeAddress
            ? 'SELECT id, username, email, role, address, created_at FROM users WHERE id = ?'
            : 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
       const [rows] = await pool.execute(sql, [id]);
       const user = rows[0];
       if (!user) return null;
       if (!includeAddress) user.address = null;
       return user;
    },

    async create(userData) {
        const { username, email, password, role = 'customer'} = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(sql, [username, email, hashedPassword, role]);

        return result.insertId;
    },

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    async updateProfile(id, profileData) {
        const { username, email, address = null } = profileData;
        const includeAddress = await hasAddressColumn();
        const sql = includeAddress
            ? 'UPDATE users SET username = ?, email = ?, address = ? WHERE id = ?'
            : 'UPDATE users SET username = ?, email = ? WHERE id = ?';
        const params = includeAddress
            ? [username, email, address, id]
            : [username, email, id];
        await pool.execute(sql, params);
        return await UserModel.findById(id);
    }
};

export default UserModel
