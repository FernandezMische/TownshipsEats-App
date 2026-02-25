import pool from '../config/database.js';

const isMissingDriverDeliveriesTable = (error) =>
  error?.code === 'ER_NO_SUCH_TABLE' &&
  String(error?.sqlMessage || '').toLowerCase().includes('driver_deliveries');

const parseEnumValues = (columnType = '') => {
  const match = String(columnType).match(/^enum\((.*)\)$/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((value) => value.trim().replace(/^'/, '').replace(/'$/, ''));
};

const getDriverAssignedOrderStatus = async (connection) => {
  const [rows] = await connection.execute(
    `
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'status'
    LIMIT 1
    `
  );

  const enumValues = parseEnumValues(rows[0]?.COLUMN_TYPE);
  if (enumValues.includes('out_for_delivery')) return 'out_for_delivery';
  if (enumValues.includes('confirmed')) return 'confirmed';
  if (enumValues.includes('preparing')) return 'preparing';
  if (enumValues.includes('ready')) return 'ready';
  return null;
};

const DriverModel = {
  async getAvailableDeliveries() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          o.id,
          o.order_number,
          o.status,
          o.delivery_address,
          o.delivery_fee,
          o.total_amount,
          o.created_at,
          v.business_name AS vendor_name
        FROM orders o
        JOIN vendors v ON v.id = o.vendor_id
        LEFT JOIN driver_deliveries dd ON dd.order_id = o.id
        WHERE o.status IN ('preparing', 'ready')
          AND o.payment_status = 'paid'
          AND dd.id IS NULL
        ORDER BY o.created_at ASC
      `);

      return rows;
    } catch (error) {
      if (!isMissingDriverDeliveriesTable(error)) throw error;

      // Fallback: if driver_deliveries table doesn't exist yet, still return available orders.
      const [rows] = await pool.execute(`
        SELECT
          o.id,
          o.order_number,
          o.status,
          o.delivery_address,
          o.delivery_fee,
          o.total_amount,
          o.created_at,
          v.business_name AS vendor_name
        FROM orders o
        JOIN vendors v ON v.id = o.vendor_id
        WHERE o.status IN ('preparing', 'ready')
          AND o.payment_status = 'paid'
        ORDER BY o.created_at ASC
      `);

      return rows;
    }
  },

  async getTodayStats(driverUserId) {
    try {
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
    } catch (error) {
      if (!isMissingDriverDeliveriesTable(error)) throw error;
      return { deliveries_today: 0, earnings_today: 0 };
    }
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
      if (!['preparing', 'ready'].includes(order.status) || order.payment_status !== 'paid') {
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
      const assignedStatus = await getDriverAssignedOrderStatus(connection);
      if (!assignedStatus) {
        await connection.rollback();
        return {
          success: false,
          code: 'INVALID_STATUS_SCHEMA',
          message: 'No compatible status value found in orders.status enum'
        };
      }

      await connection.execute(
        `
        INSERT INTO driver_deliveries (order_id, driver_user_id, earnings_amount, status, accepted_at)
        VALUES (?, ?, ?, 'accepted', NOW())
        `,
        [orderId, driverUserId, earningsAmount]
      );

      await connection.execute(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [assignedStatus, orderId]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      if (isMissingDriverDeliveriesTable(error)) {
        return {
          success: false,
          code: 'MISSING_TABLE',
          message: 'driver_deliveries table is missing. Create it before accepting deliveries.'
        };
      }
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default DriverModel;
