// Chuẩn hóa danh sách trả về từ Backend
export const listOf = (response) =>
  Array.isArray(response)
    ? response
    : Array.isArray(response?.content)
    ? response.content
    : Array.isArray(response?.data)
    ? response.data
    : [];

// Chuyển thời gian thành timestamp
export const millis = (value) => {
  if (value == null) return 0;
  if (typeof value === "number") return value;

  const result = new Date(value).getTime();

  return Number.isNaN(result) ? 0 : result;
};

// Chuẩn hóa bản ghi cảm biến
export function toSensorRecord(row) {
  return {
    id: row.datasensorId ?? row.datasensor_id ?? row.id,
    timestamp: millis(row.time ?? row.timestamp),
    type: String(row.type || "").toLowerCase(),
    value: Number(row.value),
  };
}

// Chuẩn hóa thiết bị LED
export function toDevice(row) {
  return {
    id: row.deviceId ?? row.device_id ?? row.id,
    name: row.name,
    status: Boolean(row.status),
  };
}

// Chuẩn hóa lịch sử điều khiển
export function toAction(row, devices = [], user = null) {
  const deviceId =
    row.deviceId ??
    row.device_id ??
    row.device?.deviceId ??
    row.device?.id;

  const device = devices.find(
    (item) => String(item.id) === String(deviceId)
  );

  const status = String(row.status || "").toUpperCase();

  return {
    id: row.historyId ?? row.history_id ?? row.id,
    deviceId,
    deviceName: device?.name || `LED ${deviceId ?? "?"}`,
    userName: user?.name || "",
    username: user?.username || "",
    action: String(row.action || "").toUpperCase(),
    status:
      status === "SUCCESS"
        ? "Success"
        : status === "FAILED"
        ? "Error"
        : "Loading",
    timestamp: millis(row.time ?? row.timestamp),
  };
}

// Tạo dữ liệu biểu đồ từ các bản ghi riêng lẻ
export function chartPoints(records) {
  const buckets = new Map();

  [...records].reverse().forEach((record) => {
    const bucket =
      Math.floor(record.timestamp / 2000) * 2000;

    const point = buckets.get(bucket) || {
      timestamp: bucket,
      temperature: null,
      humidity: null,
      light: null,
    };

    if (record.type in point) {
      point[record.type] = record.value;
    }

    buckets.set(bucket, point);
  });

  return [...buckets.values()]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-60);
}