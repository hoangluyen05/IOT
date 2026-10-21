
import { useState } from "react";
import {
  Thermometer,
  Droplets,
  Sun,
  AlertCircle,
} from "lucide-react";

import SensorChart from "../components/SensorChart";
import DeviceControl from "../components/DeviceControl";
import { controlAllDevices } from "../services/api";

import "../styles/iot-pages.css";

// Cấu hình các thẻ cảm biến
const SENSOR_CONFIG = [
  {
    key: "temperature",
    title: "Temperature",
    description: "Classroom Ambient",
    unit: "°C",
    icon: Thermometer,
    color: "blue",
    decimals: 1,
  },
  {
    key: "humidity",
    title: "Humidity",
    description: "Air Moisture Level",
    unit: "%",
    icon: Droplets,
    color: "cyan",
    decimals: 0,
  },
  {
    key: "light",
    title: "Light",
    description: "Light Sensor Reading",
    unit: "ADC",
    icon: Sun,
    color: "amber",
    decimals: 0,
  },
];

function SensorInfoCard({ config, value }) {
  const Icon = config.icon;

  const valid =
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value));

  const displayValue = valid
    ? Number(value).toFixed(config.decimals)
    : "--";

  // Chỉ dùng thanh tiến trình minh họa tỉ lệ đo.
  // Không kết luận điều kiện ánh sáng là tốt/xấu
  // vì ADC chưa được hiệu chuẩn sang lux.
  const maximum =
    config.key === "temperature"
      ? 50
      : config.key === "humidity"
      ? 100
      : 4095;

  const percent = valid
    ? Math.max(
        0,
        Math.min(100, (Number(value) / maximum) * 100)
      )
    : 0;

  return (
    <article
      className={`iot-sensor-card iot-sensor-${config.color}`}
    >
      <div className="iot-sensor-top">
        <div>
          <h3>{config.title}</h3>
          <p>{config.description}</p>
        </div>

        <div className="iot-sensor-icon">
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>

      <div className="iot-sensor-value">
        <strong>{displayValue}</strong>
        <span>{config.unit}</span>
      </div>

      <div className="iot-sensor-progress">
        <div style={{ width: `${percent}%` }} />
      </div>

      <div className="iot-sensor-footer">
        <span>
          {config.key === "light"
            ? "Raw ADC reading"
            : "Live sensor reading"}
        </span>

        <span className="iot-live-indicator">
          <i />
          {valid ? "Updated" : "No data"}
        </span>
      </div>
    </article>
  );
}

export default function Dashboard({
  sensor = {},
  history = [],
  devices = [],
  refreshDevices,
}) {
  const [bulkPending, setBulkPending] = useState(false);
  const [error, setError] = useState("");

  const allDevicesOn =
    devices.length > 0 &&
    devices.every((item) => item.status === true);

  async function handleBulk(status) {
    if (bulkPending || devices.length === 0) return;

    setBulkPending(true);
    setError("");

    try {
      // Gửi lệnh điều khiển tới Backend
      await controlAllDevices(status);

      // Backend nhận ACK bất đồng bộ từ ESP32
      // App cũng đang tự làm mới dữ liệu định kỳ.
      if (refreshDevices) {
        await refreshDevices();
      }
    } catch (err) {
      setError(err.message || "Device command failed");
    } finally {
      setBulkPending(false);
    }
  }

  return (
    <div className="iot-dashboard">
      <div className="iot-page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Monitor classroom conditions and control devices
          </p>
        </div>

        <div className="iot-live-pill">
          <span />
          Live monitoring
        </div>
      </div>

      {/* SENSOR CARDS */}
      <section className="iot-sensor-grid">
        {SENSOR_CONFIG.map((config) => (
          <SensorInfoCard
            key={config.key}
            config={config}
            value={sensor[config.key]}
          />
        ))}
      </section>

      {error && (
        <div className="iot-error-message" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* CHART + DEVICE CONTROL */}
      <section className="iot-dashboard-content">
        <div className="iot-chart-panel">
          <SensorChart data={history} />
        </div>

        <div className="iot-devices-panel">
          <div className="iot-panel-heading">
            <div>
              <h2>Device Control</h2>
              <p>Manage classroom LEDs</p>
            </div>

            <span className="iot-count-badge">
              {devices.filter((item) => item.status).length}
              /{devices.length} ON
            </span>
          </div>

          <div className="iot-devices-content">
            <DeviceControl
              devices={devices}
              refreshDevices={refreshDevices}
            />
          </div>

          <div className="iot-bulk-footer">
            <div className="iot-bulk-info">
              <span>All devices</span>
              <small>
                {allDevicesOn
                  ? "All LEDs are turned on"
                  : "Control all LEDs at once"}
              </small>
            </div>

            <button
              type="button"
              className={
                allDevicesOn
                  ? "iot-bulk-button iot-bulk-off"
                  : "iot-bulk-button iot-bulk-on"
              }
              disabled={bulkPending || devices.length === 0}
              onClick={() => handleBulk(!allDevicesOn)}
            >
              {bulkPending
                ? "Sending..."
                : allDevicesOn
                ? "Turn All Off"
                : "Turn All On"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
