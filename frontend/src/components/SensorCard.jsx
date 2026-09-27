
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

      <div className="sensor-number">
        {value}
        <span>{config.unit}</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="sensor-footer">
        <span>
          Optimal: {config.optimalMin}-{config.optimalMax}
          {config.unit}
        </span>

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
