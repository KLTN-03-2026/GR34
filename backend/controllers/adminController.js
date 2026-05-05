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
    const [[revenue]] = await db.query(
      "SELECT SUM(amount) AS total FROM payments WHERE status = 'completed'"
    );


    const [statusStats] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM shipments
      GROUP BY status
    `);


    const [monthlyRevenue] = await db.query(`
  SELECT 
    DATE_FORMAT(MIN(created_at), '%b') AS month, 
    SUM(amount) AS total
  FROM payments
  WHERE status = 'completed'
  GROUP BY YEAR(created_at), MONTH(created_at)
  ORDER BY YEAR(created_at), MONTH(created_at)
`);


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
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy thống kê" });
  }
};
