import pool from '../config/database.js';

const VendorModel = {
    async getAllActive() {
        const [rows] = await pool.execute(
            'SELECT id, business_name as name, cuisine_type as cuisine, delivery_fee, rating FROM vendors WHERE is_active = true ORDER BY rating DESC'
        );
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.execute(
            'SELECT id, business_name as name, cuisine_type as cuisine, delivery_fee, rating FROM vendors WHERE id = ? AND is_active = true',
            [id]
        );
        return rows[0];
    },

    // Get vendor by user ID
    async getByUserEmail(email) {
        const [rows] = await pool.execute(
            `SELECT v.id, v.business_name as name, v.cuisine_type as cuisine, v.delivery_fee, v.rating
             FROM vendors v
             JOIN users u ON u.id = v.user_id
             WHERE u.email = ? AND v.is_active = true`, 
            [email]
        );
        return rows[0];
    },

    async getMenu(vendorId) {
        const [rows] = await pool.execute(`
            SELECT m.*, c.name as category_name
            FROM menu_items m
            LEFT JOIN categories c ON m.category_id = c.id
            WHERE m.vendor_id = ? AND m.is_available = true
            ORDER BY c.name, m.name
        `, [vendorId]);
        return rows;
    },

    //  Add menu item
    async addMenuItem(vendorId, itemData) {
        const { name, description, price, category_id } = itemData;
        const [result] = await pool.execute(
            'INSERT INTO menu_items (vendor_id, name, description, price, category_id) VALUES (?, ?, ?, ?, ?)',
            [vendorId, name, description, price, category_id]
        );
        return result.insertId;
    },

    //  Update menu item
    async updateMenuItem(itemId, vendorId, itemData) {
        const { name, description, price, category_id } = itemData;
        await pool.execute(
            'UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ? AND vendor_id = ?',
            [name, description, price, category_id, itemId, vendorId]
        );
    },

    //  Delete menu item
    async deleteMenuItem(itemId, vendorId) {
        await pool.execute(
            'DELETE FROM menu_items WHERE id = ? AND vendor_id = ?',
            [itemId, vendorId]
        );
    }
};

export default VendorModel;
