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

  const status =
    value < config.optimalMin
      ? "Low"
      : value > config.optimalMax
      ? "High"
      : "Normal";

  return (
    <div className="sensor-card">
      <div className="sensor-card-top">
        <div>
          <h3>{config.name}</h3>
          <p>{subtitles[type]}</p>
        </div>

        <div className="sensor-icon">
          <Icon size={25} />
        </div>
      </div>
      {/* Hiển thị giá trị cảm biến */}
      <div className="sensor-number">
        {value}
        <span>{config.unit}</span>
      </div>
      {/* Hiển thị thanh tiến trình */}
      <div className="progress-track">
        <div
          className="progress-fill"
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
            status === "Normal"
              ? "status-normal"
              : "status-warning"
          }
        >
          ● {status}
        </span>
      </div>
    </div>
  );
}
