import pool from "../config/db.js";

// Cache regions để tránh query nhiều lần
let regionsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Lấy danh sách regions (có cache)
export const getRegions = async () => {
  const now = Date.now();
  if (regionsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return regionsCache;
  }

  try {
    const [rows] = await pool.query("SELECT * FROM regions ORDER BY id ASC");
    regionsCache = rows;
    cacheTimestamp = now;
    return rows;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách regions:", err);
    return [];
  }
};

// Lấy region theo code
export const getRegionByCode = async (code) => {
  if (!code) return null;
  try {
    const [rows] = await pool.query("SELECT * FROM regions WHERE code = ?", [code]);
    return rows[0] || null;
  } catch (err) {
    console.error("Lỗi khi lấy region theo code:", err);
    return null;
  }
};

// Lấy region theo ID
export const getRegionById = async (id) => {
  if (!id) return null;
  try {
    const [rows] = await pool.query("SELECT * FROM regions WHERE id = ?", [id]);
    return rows[0] || null;
  } catch (err) {
    console.error("Lỗi khi lấy region theo id:", err);
    return null;
  }
};

// Lấy region_id từ địa chỉ (tự động phát hiện vùng)
export const getRegionIdFromAddress = async (address) => {
  if (!address) {
    const otherRegion = await getRegionByCode("OTHER");
    return otherRegion?.id || null;
  }

  const addrLower = address.toLowerCase();

  // Hồ Chí Minh & Vùng phụ cận
  if (
    addrLower.includes("hồ chí minh") ||
    addrLower.includes("hcm") ||
    addrLower.includes("sài gòn") ||
    addrLower.includes("bình dương") ||
    addrLower.includes("đồng nai") ||
    addrLower.includes("long an")
  ) {
    const region = await getRegionByCode("HCM");
    return region?.id || null;
  }

  // Đà Nẵng & Vùng phụ cận
  if (
    addrLower.includes("đà nẵng") ||
    addrLower.includes("da nang") ||
    addrLower.includes("quảng nam") ||
    addrLower.includes("huế")
  ) {
    const region = await getRegionByCode("DN");
    return region?.id || null;
  }

  // Hà Nội & Vùng phụ cận
  if (
    addrLower.includes("hà nội") ||
    addrLower.includes("ha noi") ||
    addrLower.includes("hưng yên") ||
    addrLower.includes("bắc ninh")
  ) {
    const region = await getRegionByCode("HN");
    return region?.id || null;
  }

  // Mặc định là OTHER
  const otherRegion = await getRegionByCode("OTHER");
  return otherRegion?.id || null;
};

// Lấy prefix từ region_id
export const getPrefixFromRegionId = async (regionId) => {
  if (!regionId) return "SP";
  const region = await getRegionById(regionId);
  return region?.prefix || "SP";
};

// Lấy code từ region_id
export const getCodeFromRegionId = async (regionId) => {
  if (!regionId) return "OTHER";
  const region = await getRegionById(regionId);
  return region?.code || "OTHER";
};

// Lấy tên đầy đủ từ region_id
export const getNameFromRegionId = async (regionId) => {
  if (!regionId) return "Vùng khác";
  const region = await getRegionById(regionId);
  return region?.name || "Vùng khác";
};

// Format region data cho response
export const formatRegionResponse = (region) => {
  if (!region) return null;
  return {
    id: region.id,
    code: region.code,
    name: region.name,
    prefix: region.prefix,
  };
};

// Xóa cache (gọi khi có thay đổi về region)
export const clearRegionsCache = () => {
  regionsCache = null;
  cacheTimestamp = 0;
};
