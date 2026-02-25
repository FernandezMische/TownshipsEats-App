import pool from '../config/database.js';

const DriverModel = {
  async getAvailableDeliveries() {
    const [rows] = await pool.execute(`
      SELECT
        o.id,
        o.order_number,
        o.delivery_address,
        o.delivery_fee,
        o.total_amount,
        o.created_at,
        v.business_name AS vendor_name
      FROM orders o
      JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN driver_deliveries dd ON dd.order_id = o.id
      WHERE o.status = 'ready'
        AND o.payment_status = 'paid'
        AND dd.id IS NULL
      ORDER BY o.created_at ASC
    `);

    return rows;
  },

  async getTodayStats(driverUserId) {
    const [rows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS deliveries_today,
        COALESCE(SUM(earnings_amount), 0) AS earnings_today
      FROM driver_deliveries
      WHERE driver_user_id = ?
        AND DATE(accepted_at) = CURDATE()
      `,
      [driverUserId]
    );

    return rows[0] || { deliveries_today: 0, earnings_today: 0 };
  },

  async acceptDelivery(orderId, driverUserId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [orders] = await connection.execute(
        `
        SELECT id, status, payment_status, delivery_fee
        FROM orders
        WHERE id = ?
        FOR UPDATE
        `,
        [orderId]
      );

      if (orders.length === 0) {
        await connection.rollback();
        return { success: false, code: 'NOT_FOUND', message: 'Order not found' };
      }

      const order = orders[0];
      if (order.status !== 'ready' || order.payment_status !== 'paid') {
        await connection.rollback();
        return { success: false, code: 'NOT_AVAILABLE', message: 'Order is not available for drivers' };
      }

      const [existing] = await connection.execute(
        'SELECT id FROM driver_deliveries WHERE order_id = ? LIMIT 1',
        [orderId]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { success: false, code: 'ALREADY_ASSIGNED', message: 'Order already assigned to a driver' };
      }

      const earningsAmount = Number(order.delivery_fee || 25);

      await connection.execute(
        `
        INSERT INTO driver_deliveries (order_id, driver_user_id, earnings_amount, status, accepted_at)
        VALUES (?, ?, ?, 'accepted', NOW())
        `,
        [orderId, driverUserId, earningsAmount]
      );

      await connection.execute(
        `UPDATE orders SET status = 'out_for_delivery' WHERE id = ?`,
        [orderId]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default DriverModel;
