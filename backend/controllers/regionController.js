import pool from "../config/db.js";
import {
  getRegions,
  getRegionById,
  formatRegionResponse,
} from "../utils/regionHelper.js";

// Lấy danh sách tất cả regions
export const getAllRegions = async (req, res) => {
  try {
    const regions = await getRegions();
    res.json(regions.map(formatRegionResponse));
  } catch (err) {
    console.error("Lỗi khi lấy danh sách regions:", err);
    res.status(500).json({ error: "Không thể lấy danh sách vùng" });
  }
};

// Lấy thông tin region theo ID
export const getRegionByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const region = await getRegionById(id);
    if (!region) {
      return res.status(404).json({ error: "Không tìm thấy vùng" });
    }
    res.json(formatRegionResponse(region));
  } catch (err) {
    console.error("Lỗi khi lấy region:", err);
    res.status(500).json({ error: "Không thể lấy thông tin vùng" });
  }
};
