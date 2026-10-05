// thẻ nhiệt độ, độ ẩm, ánh sáng
import { Thermometer, Droplet, Sun } from "lucide-react";
import { sensorConfig } from "../services/mockData";

const icons = {
  temperature: Thermometer,
  humidity: Droplet,
  light: Sun,
};

const subtitles = {
  temperature: "Classroom Ambient",
  humidity: "Air Moisture Level",
  light: "Intensity",
};

// nhận dữ liệu
// type xác định cảm biến nào đang được hiển thị, còn value là giá trị đo.
export default function SensorCard({ type, value }) {
  const config = sensorConfig[type];
  const Icon = icons[type];

  const percentage = Math.min(
    100,
    Math.max(0, (value / config.max) * 100)
  );

  // Kiểm tra giá trị cảm biến có thấp hoặc cao hơn ngưỡng tối ưu hay không
  const isLow = value < config.optimalMin;
  const isHigh = value > config.optimalMax;
  const isWarning = isLow || isHigh;

  // Xác định trạng thái cảm biến
  const status = isLow
    ? "Low"
    : isHigh
    ? "High"
    : "Normal";

  return (
    <div
      className={`sensor-card ${
        isWarning ? "sensor-card-warning" : ""
      }`}
    >
      <div className="sensor-card-top">
        <div>
          <h3>{config.name}</h3>
          <p>{subtitles[type]}</p>
        </div>

        <div
          className={`sensor-icon ${
            isWarning ? "sensor-icon-warning" : ""
          }`}
        >
          <Icon size={25} />
        </div>
      </div>

      {/* Hiển thị giá trị cảm biến */}
      <div
        className={`sensor-number ${
          isWarning ? "sensor-number-warning" : ""
        }`}
      >
        {value}
        <span>{config.unit}</span>
      </div>

      {/* Hiển thị thanh tiến trình */}
      <div className="progress-track">
        <div
          className={`progress-fill ${
            isWarning ? "progress-warning" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Hiển thị trạng thái cảm biến */}
      <div className="sensor-footer">
        <span>
          Optimal: {config.optimalMin}-{config.optimalMax}
          {config.unit}
        </span>

        {/* Hiển thị trạng thái cảm biến */}
        <span
          className={
            isWarning
              ? "status-warning"
              : "status-normal"
          }
        >
          ● {status}
        </span>
      </div>
    </div>
  );
}