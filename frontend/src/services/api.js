
const API_BASE = "/api";

// ====================================
// HÀM GỌI API CHUNG
// ====================================
async function request(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `HTTP ${response.status}: ${message}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  return text ? JSON.parse(text) : null;
}

// ====================================
// TẠO QUERY STRING
// ====================================
function buildQuery(path, params = {}) {
  const filtered = Object.entries(params).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  const query = new URLSearchParams(filtered).toString();

  return query ? `${path}?${query}` : path;
}

// ====================================
// API CẢM BIẾN
// ====================================

// Lấy dữ liệu cảm biến mới nhất
export function getLatestSensors() {
  return request("/sensors/latest");
}

// Lấy danh sách dữ liệu cảm biến
export function getDataSensors(params = {}) {
  return request(
    buildQuery("/data-sensors", params)
  );
}

// ====================================
// API THIẾT BỊ LED
// ====================================

// Lấy trạng thái các LED
export function getDevices() {
  return request("/devices");
}

// Bật/tắt một LED
export function controlDevice(deviceId, status) {
  return request(`/devices/${deviceId}/commands`, {
    method: "POST",
    body: JSON.stringify({
      status,
      userId: "B23DCCN521",
    }),
  });
}

// Bật/tắt tất cả LED
export function controlAllDevices(status) {
  return request("/devices/commands/bulk", {
    method: "POST",
    body: JSON.stringify({
      status,
      userId: "B23DCCN521",
    }),
  });
}

// ====================================
// API LỊCH SỬ
// ====================================

export function getHistory(params = {}) {
  return request(
    buildQuery("/history", params)
  );
}

// ====================================
// API THÔNG TIN NGƯỜI DÙNG
// Không sử dụng để đăng nhập
// ====================================

export function getUser(userId = "B23DCCN521") {
  return request(
    `/users/${encodeURIComponent(userId)}`
  );
}
