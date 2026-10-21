import { useMemo, useState } from "react";

import {
  Search,
  CalendarDays,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  X,
  Database,
  Copy,
  Check,
} from "lucide-react";

import "../styles/iot-pages.css";

// ========================================
// 1. CẤU HÌNH CẢM BIẾN
// ========================================

const SENSOR_TYPES = {
  temperature: {
    label: "Temp",
    unit: "°C",
    className: "temperature",
  },
  humidity: {
    label: "Hum",
    unit: "%",
    className: "humidity",
  },
  light: {
    label: "Light",
    unit: "ADC",
    className: "light",
  },
};

// ========================================
// 2. XỬ LÝ THỜI GIAN
// ========================================

// Chuyển dữ liệu Backend thành timestamp
function toTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return NaN;
  }

  if (typeof value === "number") {
    return value;
  }

  return new Date(value).getTime();
}

// Định dạng: yyyy/MM/dd HH:mm:ss
function formatDateTime(value) {
  const timestamp = toTimestamp(value);

  if (!Number.isFinite(timestamp)) {
    return "--";
  }

  const date = new Date(timestamp);

  const pad = (number) =>
    String(number).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

// Đổi giá trị datetime-local thành định dạng hiển thị
function formatInputTime(value) {
  if (!value) return "";

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return formatDateTime(timestamp);
}

// ========================================
// 3. COMPONENT DATA SENSOR
// ========================================

export default function DataSensor({ records = [] }) {
  // Loại dữ liệu tìm kiếm
  const [type, setType] = useState("all");

  // Nội dung đang nhập
  const [searchInput, setSearchInput] = useState("");

  // Điều kiện thực sự áp dụng sau khi nhấn Search
  const [appliedType, setAppliedType] = useState("all");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Sắp xếp
  const [sortOrder, setSortOrder] = useState("desc");

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bộ chọn ngày giờ
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState("");

  // ID của dòng vừa sao chép
  const [copiedId, setCopiedId] = useState(null);

  // ========================================
  // 4. XỬ LÝ TÌM KIẾM
  // ========================================

  function resetSearch() {
    setAppliedType("all");
    setAppliedSearch("");
    setPage(1);
  }

  function handleTypeChange(event) {
    setType(event.target.value);
    setSearchInput("");
    setSelectedDateTime("");
    setPickerOpen(false);

    resetSearch();
  }

  function handleInputChange(event) {
    const value = event.target.value;

    setSearchInput(value);

    // Xóa hết từ khóa thì trả về toàn bộ dữ liệu
    if (!value.trim()) {
      resetSearch();
      setSelectedDateTime("");
    }
  }

  function handleSearch() {
    const keyword = searchInput.trim();

    if (!keyword) {
      resetSearch();
      setPickerOpen(false);
      return;
    }

    setAppliedType(type);
    setAppliedSearch(keyword);

    setPage(1);
    setPickerOpen(false);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  function handleClearAll() {
    setType("all");
    setSearchInput("");

    setAppliedType("all");
    setAppliedSearch("");

    setSortOrder("desc");
    setPage(1);

    setPickerOpen(false);
    setSelectedDateTime("");
  }

  // ========================================
  // 5. BỘ CHỌN NGÀY GIỜ
  // ========================================

  function handleConfirmDateTime() {
    const formatted = formatInputTime(selectedDateTime);

    if (!formatted) return;

    // Chỉ nhập thời gian vào ô Search
    // Người dùng nhấn Search để thực hiện lọc
    setSearchInput(formatted);

    setPickerOpen(false);
  }

  // ========================================
  // 6. COPY THỜI GIAN
  // ========================================

  async function handleCopyTime(timestamp, rowId) {
    const text = formatDateTime(timestamp);

    if (text === "--") return;

    try {
      await navigator.clipboard.writeText(text);

      // Đổi icon Copy thành Check
      setCopiedId(rowId);

      // Không cần alert, không làm gián đoạn thao tác
    } catch (error) {
      console.error("Không thể sao chép thời gian:", error);
    }
  }

  // ========================================
  // 7. CHUẨN HÓA DỮ LIỆU
  // ========================================

  const rows = useMemo(() => {
    const source = Array.isArray(records) ? records : [];

    return source
      .map((record, index) => {
        const recordType = String(
          record.type ?? ""
        ).toLowerCase();

        const sensorInfo = SENSOR_TYPES[recordType];

        const rawTime =
          record.timestamp ?? record.time;

        return {
          id:
            record.id ??
            record.datasensorId ??
            record.dataSensorId ??
            record.datasensor_id ??
            index,

          type: recordType,

          label: sensorInfo?.label ?? recordType,

          value: Number(record.value),

          unit: sensorInfo?.unit ?? "",

          className: sensorInfo?.className ?? "",

          timestamp: toTimestamp(rawTime),
        };
      })
      .filter(
        (item) =>
          Number.isFinite(item.timestamp) &&
          Number.isFinite(item.value)
      );
  }, [records]);

  // ========================================
  // 8. LỌC VÀ SẮP XẾP DỮ LIỆU
  // ========================================

  const filtered = useMemo(() => {
    const keyword = appliedSearch.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (!keyword) {
          return true;
        }

        const timeText = formatDateTime(
          row.timestamp
        ).toLowerCase();

        const valueText = String(
          row.value
        ).toLowerCase();

        const sensorType = row.type.toLowerCase();

        const sensorLabel = row.label.toLowerCase();

        const valueWithUnit =
          `${row.value} ${row.unit}`.toLowerCase();

        // Tìm kiếm tất cả trường
        if (appliedType === "all") {
          return (
            timeText.includes(keyword) ||
            sensorType.includes(keyword) ||
            sensorLabel.includes(keyword) ||
            valueText.includes(keyword) ||
            valueWithUnit.includes(keyword)
          );
        }

        // Tìm kiếm theo thời gian
        if (appliedType === "time") {
          return timeText.includes(keyword);
        }

        // Tìm theo loại cảm biến và giá trị
        return (
          sensorType === appliedType &&
          (
            valueText.includes(keyword) ||
            valueWithUnit.includes(keyword)
          )
        );
      })
      .sort((a, b) => {
        const timeDifference =
          a.timestamp - b.timestamp;

        const idDifference =
          Number(a.id) - Number(b.id);

        return sortOrder === "asc"
          ? timeDifference || idDifference
          : -timeDifference || -idDifference;
      });
  }, [rows, appliedType, appliedSearch, sortOrder]);

  // ========================================
  // 9. PHÂN TRANG
  // ========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(
    Math.max(page, 1),
    totalPages
  );

  const displayed = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (number) =>
      number === 1 ||
      number === totalPages ||
      Math.abs(number - currentPage) <= 1
  );

  const hasFilters =
    searchInput.trim() !== "" ||
    appliedSearch.trim() !== "" ||
    type !== "all" ||
    appliedType !== "all" ||
    sortOrder !== "desc";

  // ========================================
  // 10. GIAO DIỆN
  // ========================================

  return (
    <div className="iot-data-page">
      {/* TIÊU ĐỀ */}

      <div className="iot-page-heading">
        <div>
          <h1>Data Sensor</h1>
        </div>

        <div className="iot-record-count">
          <Database size={17} />
          {rows.length} records loaded
        </div>
      </div>

      {/* BỘ LỌC */}

      <div className="iot-filter-panel">
        <div className="iot-filter-grid">
          {/* SEARCH BY */}

          <div className="iot-filter-field iot-filter-type">
            <label htmlFor="sensor-filter-type">
              Search by
            </label>

            <select
              id="sensor-filter-type"
              value={type}
              onChange={handleTypeChange}
            >
              <option value="all">All</option>
              <option value="time">Time</option>
              <option value="temperature">
                Temperature
              </option>
              <option value="humidity">
                Humidity
              </option>
              <option value="light">
                Light
              </option>
            </select>
          </div>

          {/* SEARCH CONTENT */}

          <div className="iot-filter-field iot-filter-search">
            <label htmlFor="sensor-filter-keyword">
              Search content
            </label>

            <div className="iot-search-input">
              <Search size={18} />

              <input
                id="sensor-filter-keyword"
                type={
                  [
                    "temperature",
                    "humidity",
                    "light",
                  ].includes(type)
                    ? "number"
                    : "text"
                }
                step="any"
                placeholder={
                  type === "time"
                    ? "yyyy/MM/dd HH:mm:ss"
                    : type === "all"
                    ? "Enter search content..."
                    : "Enter measured value..."
                }
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleSearchKeyDown}
              />

              {type === "time" && (
                <button
                  type="button"
                  className="iot-calendar-trigger"
                  onClick={() =>
                    setPickerOpen((current) => !current)
                  }
                  title="Choose date and time"
                >
                  <CalendarClock size={19} />
                </button>
              )}
            </div>

            {/* POPUP CHỌN NGÀY GIỜ */}

            {type === "time" && pickerOpen && (
              <div className="iot-date-popup">
                <label>Select date and time</label>

                <input
                  type="datetime-local"
                  step="1"
                  value={selectedDateTime}
                  onChange={(event) =>
                    setSelectedDateTime(
                      event.target.value
                    )
                  }
                />

                <div className="iot-date-actions">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary"
                    onClick={handleConfirmDateTime}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SORT BY */}

          <div className="iot-filter-field iot-filter-sort">
            <label htmlFor="sensor-sort">
              Sort by
            </label>

            <select
              id="sensor-sort"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setPage(1);
              }}
            >
              <option value="desc">
                Newest First
              </option>

              <option value="asc">
                Oldest First
              </option>
            </select>
          </div>

          {/* SEARCH BUTTON */}

          <button
            type="button"
            className="iot-search-button"
            onClick={handleSearch}
            disabled={!searchInput.trim()}
          >
            <Search size={18} />
            Search
          </button>

          {/* CLEAR BUTTON */}

          <button
            type="button"
            className="iot-clear-button"
            onClick={handleClearAll}
            disabled={!hasFilters}
          >
            <X size={17} />
            Clear
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}

      <div className="iot-table-panel">
        <div className="iot-table-scroll">
          <table className="iot-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SENSOR TYPE</th>
                <th>VALUE</th>
                <th>TIME</th>
              </tr>
            </thead>

            <tbody>
              {displayed.map((item) => (
                <tr key={item.id}>
                  {/* ID */}

                  <td className="iot-id-cell">
                    #{item.id}
                  </td>

                  {/* SENSOR TYPE */}

                  <td>
                    <span
                      className={`iot-type-badge ${item.className}`}
                    >
                      <span className="iot-badge-dot" />
                      {item.label}
                    </span>
                  </td>

                  {/* VALUE */}

                  <td className="iot-value-cell">
                    {item.value.toLocaleString(
                      "vi-VN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}

                    <span>{item.unit}</span>
                  </td>

                  {/* TIME + COPY */}

                  <td>
                    <div
                      className="iot-time-cell"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <CalendarDays size={16} />

                      <span>
                        {formatDateTime(item.timestamp)}
                      </span>

                      <button
                        type="button"
                        title={
                          copiedId === item.id
                            ? "Copied!"
                            : "Copy time"
                        }
                        aria-label="Copy time"
                        onClick={() =>
                          handleCopyTime(
                            item.timestamp,
                            item.id
                          )
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          padding: 0,
                          border: "none",
                          borderRadius: "6px",
                          background: "transparent",
                          color:
                            copiedId === item.id
                              ? "#16a34a"
                              : "#64748b",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {copiedId === item.id ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="iot-empty-table"
                  >
                    No sensor data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}

        <div className="iot-table-footer">
          <div className="iot-table-result-text">
            Showing{" "}
            <strong>{displayed.length}</strong>
            {" "}of{" "}
            <strong>{filtered.length}</strong>
            {" "}results
          </div>

          <div className="iot-table-pagination">
            {/* ROWS PER PAGE */}

            <div className="iot-page-size">
              <span>Rows per page:</span>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(event.target.value)
                  );
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* PAGE BUTTONS */}

            <div className="iot-page-buttons">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() =>
                  setPage(currentPage - 1)
                }
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {pageNumbers.map((number) => (
                <button
                  type="button"
                  key={number}
                  className={
                    currentPage === number
                      ? "active"
                      : ""
                  }
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage(currentPage + 1)
                }
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}