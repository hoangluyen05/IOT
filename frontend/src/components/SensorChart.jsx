import { useMemo, useState } from "react";
import "../styles/iot-pages.css";

// Thông tin các cảm biến
const METRICS = {
  temperature: {
    label: "Temp",
    unit: "°C",
    color: "#1550db",
    dash: "",
  },
  humidity: {
    label: "Hum",
    unit: "%",
    color: "#64748b",
    dash: "3 7",
  },
  light: {
    label: "Light",
    unit: "ADC",
    color: "#f12d65",
    dash: "6 6",
  },
};

const KEYS = ["temperature", "humidity", "light"];

const WIDTH = 850;
const HEIGHT = 310;

const PADDING = {
  left: 38,
  right: 12,
  top: 20,
  bottom: 38,
};

const INNER_WIDTH = WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

// Hiển thị giờ:phút:giây (HH:mm:ss)
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// Định dạng giá trị cảm biến
function formatNumber(value) {
  return Number(value).toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  });
}

// Tạo đường biểu đồ cong mượt bằng cubic Bézier
function smoothPath(points) {
  if (!points.length) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const previous = points[Math.max(0, i - 1)];
    const current = points[i];
    const next = points[i + 1];
    const after = points[Math.min(points.length - 1, i + 2)];

    const dx = next.x - current.x;

    const slope1 =
      next.x !== previous.x
        ? (next.y - previous.y) / (next.x - previous.x)
        : 0;

    const slope2 =
      after.x !== current.x
        ? (after.y - current.y) / (after.x - current.x)
        : 0;

    const c1x = current.x + dx / 3;
    const c2x = next.x - dx / 3;

    const yMin = Math.min(current.y, next.y);
    const yMax = Math.max(current.y, next.y);

    const c1y = Math.max(
      yMin,
      Math.min(yMax, current.y + (slope1 * dx) / 3)
    );

    const c2y = Math.max(
      yMin,
      Math.min(yMax, next.y - (slope2 * dx) / 3)
    );

    path +=
      ` C ${c1x} ${c1y}` +
      ` ${c2x} ${c2y}` +
      ` ${next.x} ${next.y}`;
  }

  return path;
}

// Chuẩn hóa từng đường dữ liệu cảm biến
function buildLine(data, key, startTime, endTime) {
  const values = data
    .filter(
      (item) =>
        item[key] !== null &&
        item[key] !== undefined &&
        Number.isFinite(Number(item[key]))
    )
    .map((item) => ({
      timestamp: item.timestamp,
      value: Number(item[key]),
    }));

  if (!values.length) return null;

  const numbers = values.map((item) => item.value);

  const minimum = Math.min(...numbers);
  const maximum = Math.max(...numbers);
  const difference = maximum - minimum;

  const margin =
    difference === 0
      ? Math.max(Math.abs(maximum) * 0.1, 1)
      : difference * 0.35;

  const minScale = minimum - margin;
  const maxScale = maximum + margin;

  const duration = endTime - startTime;

  const points = values.map((item) => {
    const ratioX =
      duration > 0
        ? (item.timestamp - startTime) / duration
        : 0.5;

    const ratioY =
      (item.value - minScale) / (maxScale - minScale);

    return {
      timestamp: item.timestamp,
      value: item.value,
      x: PADDING.left + ratioX * INNER_WIDTH,
      y: PADDING.top + (1 - ratioY) * INNER_HEIGHT,
    };
  });

  return {
    points,
    path: smoothPath(points),
  };
}

export default function SensorChart({ data = [] }) {
  // Mặc định hiển thị cả ba đường
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Điểm dữ liệu đang được hover
  const [hoverIndex, setHoverIndex] = useState(null);

  // Chuẩn hóa, sắp xếp và lấy 60 bản ghi cuối
  const records = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((item) => {
        const rawTime = item.timestamp ?? item.time;

        const timestamp =
          typeof rawTime === "number"
            ? rawTime
            : new Date(rawTime).getTime();

        const row = { timestamp };

        KEYS.forEach((key) => {
          const value = item[key];

          row[key] =
            value === null ||
            value === undefined ||
            value === ""
              ? null
              : Number(value);
        });

        return row;
      })
      .filter(
        (item) =>
          Number.isFinite(item.timestamp) &&
          KEYS.some(
            (key) =>
              item[key] !== null &&
              Number.isFinite(item[key])
          )
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-60);
  }, [data]);

  // Xây dựng dữ liệu biểu đồ
  const chart = useMemo(() => {
    if (!records.length) return null;

    const startTime = records[0].timestamp;
    const endTime = records[records.length - 1].timestamp;

    const lines = {};

    KEYS.forEach((key) => {
      lines[key] = buildLine(
        records,
        key,
        startTime,
        endTime
      );
    });

    return {
      startTime,
      endTime,
      lines,
    };
  }, [records]);

  // Những đường cảm biến đang được hiển thị
  const visibleKeys =
    selectedMetric === "all"
      ? KEYS
      : [selectedMetric];

  const hoveredRecord =
    hoverIndex !== null ? records[hoverIndex] : null;

  // Click một nhãn để chỉ hiển thị cảm biến đó
  // Click lại nhãn đang chọn để hiện tất cả
  function handleLegendClick(key) {
    setSelectedMetric((current) =>
      current === key ? "all" : key
    );
  }

  // Tìm bản ghi có thời gian gần vị trí chuột nhất
  function handleMouseMove(event) {
    if (!chart || records.length === 0) return;

    const bounds =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) / bounds.width) *
      WIDTH;

    const fraction = Math.max(
      0,
      Math.min(
        1,
        (x - PADDING.left) / INNER_WIDTH
      )
    );

    const time =
      chart.startTime +
      fraction * (chart.endTime - chart.startTime);

    let nearest = 0;
    let distance = Infinity;

    records.forEach((record, index) => {
      const currentDistance = Math.abs(
        record.timestamp - time
      );

      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = index;
      }
    });

    setHoverIndex(nearest);
  }

  // Vị trí vạch dọc khi hover
  const hoverX =
    hoveredRecord && chart
      ? PADDING.left +
        (chart.endTime === chart.startTime
          ? 0.5
          : (hoveredRecord.timestamp - chart.startTime) /
            (chart.endTime - chart.startTime)) *
          INNER_WIDTH
      : null;

  // Tạo 5 mốc trục X, hiển thị cả giây
  const timeTicks = chart
    ? Array.from({ length: 5 }, (_, index) => {
        const ratio = index / 4;

        return {
          x: PADDING.left + ratio * INNER_WIDTH,
          timestamp:
            chart.startTime +
            ratio * (chart.endTime - chart.startTime),
        };
      })
    : [];

  return (
    <div className="sc-chart-card">
      {/* TIÊU ĐỀ VÀ CHỌN CẢM BIẾN */}
      <div className="sc-chart-header">
        <h2>Sensor History</h2>

        <div className="sc-chart-legends">
          {KEYS.map((key) => {
            const metric = METRICS[key];

            const visible =
              selectedMetric === "all" ||
              selectedMetric === key;

            return (
              <button
                key={key}
                type="button"
                className={`sc-chart-legend ${key} ${
                  visible ? "active" : "inactive"
                }`}
                onClick={() => handleLegendClick(key)}
                title={
                  selectedMetric === key
                    ? "Show all sensors"
                    : `Show only ${metric.label}`
                }
              >
                <span
                  className="sc-legend-dot"
                  style={{
                    backgroundColor: metric.color,
                  }}
                />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {!chart ? (
        <div className="sc-chart-empty">
          No sensor history available
        </div>
      ) : (
        <div className="sc-chart-container">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="sc-chart-svg"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
            role="img"
            aria-label="Temperature, humidity and light history"
          >
            {/* LƯỚI NGANG VÀ TRỤC Y */}
            {[100, 75, 50, 25, 0].map((value, index) => {
              const y =
                PADDING.top +
                (index / 4) * INNER_HEIGHT;

              return (
                <g key={value}>
                  <line
                    x1={PADDING.left}
                    x2={WIDTH - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke="#e8edf5"
                    strokeWidth="1"
                  />

                  <text
                    x={PADDING.left - 12}
                    y={y + 4}
                    textAnchor="end"
                    fill="#475569"
                    fontSize="12"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* BA ĐƯỜNG BIỂU ĐỒ */}
            {visibleKeys.map((key) => {
              const line = chart.lines[key];

              if (!line) return null;

              const metric = METRICS[key];

              return (
                <path
                  key={key}
                  d={line.path}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth={
                    key === "temperature" ? 3.2 : 2.3
                  }
                  strokeDasharray={
                    metric.dash || undefined
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* VẠCH DỌC KHI HOVER */}
            {hoverX !== null && (
              <line
                x1={hoverX}
                x2={hoverX}
                y1={PADDING.top}
                y2={HEIGHT - PADDING.bottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 5"
                opacity="0.6"
              />
            )}

            {/* TRỤC X: GIỜ:PHÚT:GIÂY */}
            {timeTicks.map((tick, index) => (
              <text
                key={index}
                x={tick.x}
                y={HEIGHT - 12}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === 4
                    ? "end"
                    : "middle"
                }
                fontSize="12"
                fill="#475569"
              >
                {formatTime(tick.timestamp)}
              </text>
            ))}

            {/* VÙNG NHẬN HOVER */}
            <rect
              x={PADDING.left}
              y={PADDING.top}
              width={INNER_WIDTH}
              height={INNER_HEIGHT}
              fill="transparent"
            />
          </svg>

          {/* TOOLTIP HIỂN THỊ ĐỦ GIỜ:PHÚT:GIÂY */}
          {hoveredRecord && hoverX !== null && (
            <div
              className="sc-chart-tooltip"
              style={{
                left: `${Math.max(
                  13,
                  Math.min(87, (hoverX / WIDTH) * 100)
                )}%`,
              }}
            >
              <div className="sc-tooltip-time">
                {formatTime(hoveredRecord.timestamp)}
              </div>

              {visibleKeys.map((key) => {
                const value = hoveredRecord[key];

                if (
                  value === null ||
                  !Number.isFinite(value)
                ) {
                  return null;
                }

                const metric = METRICS[key];

                return (
                  <div
                    className="sc-tooltip-row"
                    key={key}
                  >
                    <span
                      style={{
                        color: metric.color,
                      }}
                    >
                      {metric.label}
                    </span>

                    <strong>
                      {formatNumber(value)} {metric.unit}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}