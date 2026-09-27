
import { useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const series = [
  {
    key: "temperature",
    label: "Temp",
    color: "#1048c5",
    className: "temp",
  },
  {
    key: "humidity",
    label: "Hum",
    color: "#64748b",
    className: "hum",
  },
  {
    key: "light",
    label: "Light",
    color: "#e11d48",
    className: "light",
  },
];

export default function SensorChart({ data }) {
  const [visible, setVisible] = useState({
    temperature: true,
    humidity: true,
    light: true,
  });

  function toggle(key) {
    setVisible((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  // Chuẩn hóa dữ liệu để ba đường dùng chung trục 0-100.
  const chartData = data.map((item) => ({
    ...item,
    temperatureChart: item.temperature,
    humidityChart: item.humidity,
    lightChart: item.light / 12,
  }));

  return (
    <section className="chart-card">
      <div className="chart-header">
        <h2>Sensor History</h2>

        <div className="chart-filters">
          {series.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className={`chart-pill ${item.className} ${
                !visible[item.key] ? "disabled" : ""
              }`}
            >
              ● {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              stroke="#e9eef9"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={35}
            />

            <Tooltip
              formatter={(value, name, props) => {
                const raw = props.payload;

                if (name === "Temp")
                  return [`${raw.temperature} °C`, name];

                if (name === "Hum")
                  return [`${raw.humidity} %`, name];

                return [`${raw.light} lux`, name];
              }}
              contentStyle={{
                border: "none",
                borderRadius: 16,
                background: "#f7f9ff",
                boxShadow: "0 8px 24px #15295a15",
              }}
            />

            {visible.temperature && (
              <Line
                type="monotone"
                dataKey="temperatureChart"
                name="Temp"
                stroke="#1048c5"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.humidity && (
              <Line
                type="monotone"
                dataKey="humidityChart"
                name="Hum"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="3 5"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {visible.light && (
              <Line
                type="monotone"
                dataKey="lightChart"
                name="Light"
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
