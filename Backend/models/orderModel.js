import pool from '../config/database.js';

const OrderModel = {
    async create(userId, cartData, deliveryAddress) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
            
            const [orderResult] = await connection.execute(`
                INSERT INTO orders 
                (user_id, vendor_id, order_number, subtotal, delivery_fee, total_amount, delivery_address, status, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
            `, [
                userId, 
                cartData.vendor_id, 
                orderNumber, 
                Number(cartData.subtotal), 
                Number(cartData.delivery_fee), 
                Number(cartData.total),
                deliveryAddress
            ]);
            
            const orderId = orderResult.insertId;
            
            for (const item of cartData.items) {
                await connection.execute(`
                    INSERT INTO order_items 
                    (order_id, menu_item_id, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    orderId,
                    item.menu_item_id,
                    Number(item.quantity),
                    Number(item.unit_price),
                    Number(item.unit_price) * Number(item.quantity)
                ]);
            }
            
            await connection.commit();
            return orderId;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async createImmediateOrder(userId, cartData, deliveryAddress) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
            
            const [orderResult] = await connection.execute(`
                INSERT INTO orders 
                (user_id, vendor_id, order_number, subtotal, delivery_fee, total_amount, delivery_address, status, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paid')
            `, [
                userId, 
                cartData.vendor_id, 
                orderNumber, 
                Number(cartData.subtotal), 
                25.00, 
                Number(cartData.total),
                deliveryAddress
            ]);
            
            const orderId = orderResult.insertId;
            
            for (const item of cartData.items) {
                await connection.execute(`
                    INSERT INTO order_items 
                    (order_id, menu_item_id, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    orderId,
                    item.menu_item_id || item.id,
                    Number(item.quantity),
                    Number(item.unit_price || item.price),
                    Number(item.unit_price || item.price) * Number(item.quantity)
                ]);
            }
            
            await connection.commit();
            return orderId;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async getUserOrders(userId) {
        const [orders] = await pool.execute(`
            SELECT o.*, v.business_name as vendor_name
            FROM orders o
            JOIN vendors v ON o.vendor_id = v.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [userId]);
        
        for (let order of orders) {
            const [items] = await pool.execute(`
                SELECT oi.*, m.name
                FROM order_items oi
                JOIN menu_items m ON oi.menu_item_id = m.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }
        
        return orders;
    },

    async getById(orderId, userId) {
        const [orders] = await pool.execute(`
            SELECT o.*, v.business_name as vendor_name
            FROM orders o
            JOIN vendors v ON o.vendor_id = v.id
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, userId]);
        
        if (orders.length === 0) return null;
        
        const order = orders[0];
        
        const [items] = await pool.execute(`
            SELECT oi.*, m.name
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = ?
        `, [orderId]);
        
        order.items = items;
        return order;
    },

    async updatePaymentStatus(orderId, paymentId, status = 'paid') {
        await pool.execute(
            'UPDATE orders SET payment_status = ?, payfast_payment_id = ? WHERE id = ?',
            [status, paymentId, orderId]
        );
    },

    async getVendorOrders(vendorId) {
        const [orders] = await pool.execute(`
            SELECT o.*, u.username as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.vendor_id = ?
            ORDER BY o.created_at DESC
        `, [vendorId]);
        
        for (let order of orders) {
            const [items] = await pool.execute(`
                SELECT oi.*, m.name
                FROM order_items oi
                JOIN menu_items m ON oi.menu_item_id = m.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }
        
        return orders;
    },

    async getVendorOrdersByStatus(vendorId, status) {
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE vendor_id = ? AND status = ?',
            [vendorId, status]
        );
        return orders;
    },

    async updateOrderStatus(orderId, vendorId, status) {
        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ? AND vendor_id = ?',
            [status, orderId, vendorId]
        );
    },

    async getVendorEarnings(vendorId, period = 'month') {
        let dateFilter = '';
        
        if (period === 'today') {
            dateFilter = 'AND DATE(created_at) = CURDATE()';
        } else if (period === 'week') {
            dateFilter = 'AND YEARWEEK(created_at) = YEARWEEK(CURDATE())';
        } else if (period === 'month') {
            dateFilter = 'AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
        }

        const [result] = await pool.execute(`
            SELECT COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE vendor_id = ? AND payment_status = 'paid' ${dateFilter}
        `, [vendorId]);

        return Number(result[0].total);
    },

    async getVendorOrdersByPeriod(vendorId, period) {
        let dateFilter = '';
        
        if (period === 'today') {
            dateFilter = 'AND DATE(created_at) = CURDATE()';
        } else if (period === 'week') {
            dateFilter = 'AND YEARWEEK(created_at) = YEARWEEK(CURDATE())';
        } else if (period === 'month') {
            dateFilter = 'AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
        }

        const [orders] = await pool.execute(`
            SELECT * FROM orders
            WHERE vendor_id = ? AND payment_status = 'paid' ${dateFilter}
            ORDER BY created_at DESC
        `, [vendorId]);

        return orders;
    },

    async getAvailableBalance(vendorId) {
        const [result] = await pool.execute(`
            SELECT COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE vendor_id = ? AND payment_status = 'paid' AND status = 'delivered'
        `, [vendorId]);

        return Number(result[0].total);
    }
};

export default OrderModel;