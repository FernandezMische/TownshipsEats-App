import DriverModel from '../models/driverModel.js';

const ensureDriver = (req, res) => {
  if (!req.user || req.user.role !== 'driver') {
    res.status(403).json({ success: false, error: 'Driver access required' });
    return false;
  }
  return true;
};

export const getDriverDashboard = async (req, res) => {
  try {
    if (!ensureDriver(req, res)) return;

    const [availableOrders, todayStats] = await Promise.all([
      DriverModel.getAvailableDeliveries(),
      DriverModel.getTodayStats(req.user.id)
    ]);

    const deliveries = availableOrders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number || `ORD-${order.id}`,
      status: order.status,
      pickupLocation: order.vendor_name,
      dropoffLocation: order.delivery_address,
      earning: Number(order.delivery_fee || 0),
      createdAt: order.created_at
    }));

    res.json({
      success: true,
      data: {
        availableDeliveries: deliveries,
        stats: {
          deliveriesToday: Number(todayStats.deliveries_today || 0),
          earningsToday: Number(todayStats.earnings_today || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching driver dashboard:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const acceptDelivery = async (req, res) => {
  try {
    if (!ensureDriver(req, res)) return;

    const { orderId } = req.params;
    const result = await DriverModel.acceptDelivery(orderId, req.user.id);

    if (!result.success) {
      const statusMap = {
        NOT_FOUND: 404,
        NOT_AVAILABLE: 409,
        ALREADY_ASSIGNED: 409,
        MISSING_TABLE: 500,
        INVALID_STATUS_SCHEMA: 500
      };
      const status = statusMap[result.code] || 409;
      return res.status(status).json({ success: false, error: result.message });
    }

    const stats = await DriverModel.getTodayStats(req.user.id);
    res.json({
      success: true,
      message: 'Delivery accepted successfully',
      data: {
        deliveriesToday: Number(stats.deliveries_today || 0),
        earningsToday: Number(stats.earnings_today || 0)
      }
    });
  } catch (error) {
    console.error('Error accepting delivery:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
