import db from "../config/db.js";


// Lấy thống kê hệ thống
export const getAdminStats = async (req, res) => {
  try {

    const [[shipments]] = await db.query(
      "SELECT COUNT(*) AS total FROM shipments"
    );
    const [[drivers]] = await db.query("SELECT COUNT(*) AS total FROM drivers");
    const [[customers]] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'customer'"
    );
    // Doanh thu = đơn đã thanh toán thành công (payment completed) hoặc đã giao (delivered/completed)
    // Đây là đơn đã thu tiền thực sự: thanh toán thành công HOẶC giao hàng hoàn tất
    const [[revenue]] = await db.query(`
      SELECT COALESCE(SUM(s.shipping_fee), 0) AS total
      FROM shipments s
      WHERE
        s.id IN (SELECT shipment_id FROM payments WHERE status = 'completed')
        OR s.status IN ('delivered', 'completed')
    `);


    const [statusStats] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM shipments
      GROUP BY status
    `);


    const [monthlyRevenue] = await db.query(`
  SELECT
    DATE_FORMAT(created_at, '%b') AS month,
    SUM(shipping_fee) AS total
  FROM shipments
  WHERE
    (id IN (SELECT shipment_id FROM payments WHERE status = 'completed'))
    OR status IN ('delivered', 'completed')
  GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
  ORDER BY YEAR(created_at), MONTH(created_at)
`);

    // Tính doanh thu tháng trước để so sánh trend
    const [[prevRevenue]] = await db.query(`
      SELECT COALESCE(SUM(s.shipping_fee), 0) AS total
      FROM shipments s
      WHERE
        (s.id IN (SELECT shipment_id FROM payments WHERE status = 'completed')
         OR s.status IN ('delivered', 'completed'))
        AND s.created_at >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
        AND s.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    `);

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const [[currentRevenue]] = await db.query(`
      SELECT COALESCE(SUM(s.shipping_fee), 0) AS total
      FROM shipments s
      WHERE
        (s.id IN (SELECT shipment_id FROM payments WHERE status = 'completed')
         OR s.status IN ('delivered', 'completed'))
        AND s.created_at >= ?
    `, [currentMonthStart]);

    const revenueTrend = prevRevenue.total > 0
      ? Math.round((currentRevenue.total - prevRevenue.total) / prevRevenue.total * 100)
      : 0;

    // Số đơn hàng tính đến cuối tháng trước
    const [[prevShipments]] = await db.query(`
      SELECT COUNT(*) AS total FROM shipments
      WHERE created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    `);
    const shipmentTrend = prevShipments.total > 0
      ? Math.round((shipments.total - prevShipments.total) / prevShipments.total * 100)
      : 0;

    // Tổng tài xế & khách hàng tháng trước (tại thời điểm cuối tháng trước)
    const [[prevDrivers]] = await db.query(`
      SELECT COUNT(*) AS total FROM drivers
      WHERE created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    `);
    const driverTrend = prevDrivers.total > 0
      ? Math.round((drivers.total - prevDrivers.total) / prevDrivers.total * 100)
      : 0;

    const [[prevCustomers]] = await db.query(`
      SELECT COUNT(*) AS total FROM users
      WHERE role = 'customer' AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    `);
    const customerTrend = prevCustomers.total > 0
      ? Math.round((customers.total - prevCustomers.total) / prevCustomers.total * 100)
      : 0;


    const [topDrivers] = await db.query(`
      SELECT 
        d.id, 
        d.name, 
        COUNT(a.id) AS total_assignments,
        COUNT(CASE WHEN s.status IN ('delivered', 'completed') THEN 1 END) AS completed_deliveries,
        ROUND(COUNT(CASE WHEN s.status IN ('delivered', 'completed') THEN 1 END) * 100.0 / COUNT(a.id), 1) AS completion_rate
      FROM drivers d
      JOIN assignments a ON d.id = a.driver_id
      JOIN shipments s ON a.shipment_id = s.id
      GROUP BY d.id
      HAVING total_assignments > 0
      ORDER BY completion_rate DESC, completed_deliveries DESC
      LIMIT 5
    `);

    res.json({
      totalShipments: shipments.total,
      totalDrivers: drivers.total,
      totalCustomers: customers.total,
      totalRevenue: revenue.total || 0,
      shipmentStats: statusStats,
      monthlyRevenue,
      topDrivers,
      trends: {
        shipments: shipmentTrend,
        drivers: driverTrend,
        customers: customerTrend,
        revenue: revenueTrend,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy thống kê" });
  }
};
