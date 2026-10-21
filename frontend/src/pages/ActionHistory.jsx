import { useEffect, useMemo, useRef, useState } from "react";

import {
  Search,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";

import { profile } from "../services/mockData";

import "../styles/global.css";

// ========================================
// 1. CẤU HÌNH BỘ CHỌN THỜI GIAN
// ========================================

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HOURS = Array.from(
  { length: 12 },
  (_, index) => index + 1
);

const MINUTES = Array.from(
  { length: 60 },
  (_, index) => index
);

const SECONDS = Array.from(
  { length: 60 },
  (_, index) => index
);

const PERIODS = ["AM", "PM"];

// ========================================
// 2. ĐỊNH DẠNG THỜI GIAN
// ========================================

function toTimestamp(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

// yyyy/MM/dd HH:mm:ss
function formatDateTime(value) {
  const timestamp = toTimestamp(value);

  if (!timestamp) return "--";

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

// ========================================
// 3. TẠO LỊCH THEO THÁNG
// ========================================

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];

  for (let index = 0; index < 42; index++) {
    const date = new Date(
      year,
      month,
      index - firstDay + 1
    );

    days.push({
      day: date.getDate(),
      year: date.getFullYear(),
      month: date.getMonth(),

      monthOffset:
        date.getFullYear() === year &&
        date.getMonth() === month
          ? 0
          : date < new Date(year, month, 1)
          ? -1
          : 1,
    });
  }

  return days;
}

// ========================================
// 4. COMPONENT CUỘN GIỜ, PHÚT, GIÂY
// ========================================

function ScrollColumn({
  values,
  value,
  onChange,
  formatValue = (item) =>
    String(item).padStart(2, "0"),
}) {
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const ITEM_HEIGHT = 38;

  useEffect(() => {
    const index = values.indexOf(value);

    if (containerRef.current && index >= 0) {
      containerRef.current.scrollTop =
        index * ITEM_HEIGHT;
    }
  }, [value, values]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleScroll() {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const container = containerRef.current;

      if (!container) return;

      const index = Math.max(
        0,
        Math.min(
          Math.round(
            container.scrollTop / ITEM_HEIGHT
          ),
          values.length - 1
        )
      );

      onChange(values[index]);

      container.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }, 100);
  }

  function handleSelect(item) {
    onChange(item);

    const index = values.indexOf(item);

    containerRef.current?.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "smooth",
    });
  }

  return (
    <div className="scroll-time-wrapper">
      <div
        ref={containerRef}
        className="scroll-time-column"
        onScroll={handleScroll}
      >
        <div className="scroll-time-spacer" />

        {values.map((item) => (
          <button
            key={item}
            type="button"
            className={`scroll-time-item ${
              item === value ? "selected" : ""
            }`}
            onClick={() => handleSelect(item)}
          >
            {formatValue(item)}
          </button>
        ))}

        <div className="scroll-time-spacer" />
      </div>

      <div className="scroll-time-selection" />
    </div>
  );
}

// ========================================
// 5. COMPONENT ACTION HISTORY
// ========================================

export default function ActionHistory({
  actions = [],
  currentUser,
}) {
  // =====================================
  // TÀI KHOẢN FRONTEND
  // =====================================

  const frontendUser = currentUser || profile;

  const loginName =
    frontendUser?.name ||
    frontendUser?.fullName ||
    profile?.name ||
    "Unknown User";

  const loginUsername =
    frontendUser?.username ||
    frontendUser?.account ||
    frontendUser?.studentId ||
    profile?.username ||
    profile?.studentId ||
    "--";

  // =====================================
  // BỘ LỌC
  // =====================================

  const [search, setSearch] = useState("");

  const [device, setDevice] = useState("all");

  const [action, setAction] = useState("all");

  const [status, setStatus] = useState("all");

  const [sortOrder, setSortOrder] = useState("desc");

  // =====================================
  // PHÂN TRANG
  // =====================================

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  // =====================================
  // DATETIME PICKER
  // =====================================

  const [pickerOpen, setPickerOpen] = useState(false);

  const [pickerDate, setPickerDate] = useState(
    () => new Date()
  );

  const pickerRef = useRef(null);

  // =====================================
  // COPY THỜI GIAN
  // =====================================

  const [copiedId, setCopiedId] = useState(null);

  async function handleCopyTime(timestamp, rowId) {
    const text = formatDateTime(timestamp);

    if (text === "--") return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(rowId);
    } catch (error) {
      console.error(
        "Không thể sao chép thời gian:",
        error
      );
    }
  }

  // =====================================
  // GIÁ TRỊ NGÀY GIỜ ĐANG CHỌN
  // =====================================

  const pickerYear = pickerDate.getFullYear();
  const pickerMonth = pickerDate.getMonth();
  const pickerDay = pickerDate.getDate();

  const pickerHour =
    pickerDate.getHours() % 12 || 12;

  const pickerMinute = pickerDate.getMinutes();
  const pickerSecond = pickerDate.getSeconds();

  const pickerPeriod =
    pickerDate.getHours() >= 12
      ? "PM"
      : "AM";

  // =====================================
  // ĐÓNG PICKER KHI CLICK BÊN NGOÀI
  // =====================================

  useEffect(() => {
    function handleOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setPickerOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  // =====================================
  // CẬP NHẬT NGÀY GIỜ
  // =====================================

  function updatePicker(parts) {
    setPickerDate((previous) => {
      const date = new Date(previous);

      if (parts.year !== undefined) {
        date.setFullYear(parts.year);
      }

      if (parts.month !== undefined) {
        date.setDate(1);
        date.setMonth(parts.month);
      }

      if (parts.day !== undefined) {
        date.setDate(parts.day);
      }

      if (parts.hour !== undefined) {
        date.setHours(parts.hour);
      }

      if (parts.minute !== undefined) {
        date.setMinutes(parts.minute);
      }

      if (parts.second !== undefined) {
        date.setSeconds(parts.second);
      }

      return date;
    });
  }

  function changeMonth(offset) {
    setPickerDate(
      new Date(
        pickerYear,
        pickerMonth + offset,
        1,
        pickerDate.getHours(),
        pickerMinute,
        pickerSecond
      )
    );
  }

  function selectDay(item) {
    const date = new Date(pickerDate);

    date.setFullYear(
      item.year,
      item.month,
      item.day
    );

    setPickerDate(date);
  }

  function changeHour12(hour12) {
    updatePicker({
      hour:
        (hour12 % 12) +
        (pickerPeriod === "PM" ? 12 : 0),
    });
  }

  function changePeriod(period) {
    updatePicker({
      hour:
        (pickerHour % 12) +
        (period === "PM" ? 12 : 0),
    });
  }

  function handleConfirmDateTime() {
    setSearch(formatDateTime(pickerDate));

    setPage(1);
    setPickerOpen(false);
  }

  function handleClearDate() {
    setSearch("");
    setPage(1);
    setPickerOpen(false);
  }

  // =====================================
  // XÓA TOÀN BỘ BỘ LỌC
  // =====================================

  function handleClearAll() {
    setSearch("");
    setDevice("all");
    setAction("all");
    setStatus("all");
    setSortOrder("desc");

    setPage(1);
    setPickerOpen(false);
  }

  // =====================================
  // CHUẨN HÓA HISTORY TỪ BACKEND
  // =====================================

  const rows = useMemo(() => {
    const source = Array.isArray(actions)
      ? actions
      : [];

    return source.map((item, index) => {
      const deviceId =
        item.deviceId ??
        item.device_id ??
        item.device?.deviceId ??
        item.device?.id;

      const rawStatus = String(
        item.status ?? ""
      ).toUpperCase();

      let displayStatus = "Loading";

      if (
        rawStatus === "SUCCESS" ||
        rawStatus === "SUCCESSFUL"
      ) {
        displayStatus = "Success";
      } else if (
        rawStatus === "FAILED" ||
        rawStatus === "ERROR"
      ) {
        displayStatus = "Error";
      }

      const actionValue = String(
        item.action ?? ""
      ).toUpperCase();

      return {
        id:
          item.id ??
          item.historyId ??
          item.history_id ??
          index,

        deviceId,

        deviceName:
          item.deviceName ||
          item.device?.name ||
          `LED ${deviceId ?? "?"}`,

        action: actionValue,

        status: displayStatus,

        timestamp: toTimestamp(
          item.timestamp ?? item.time
        ),

        userName:
          item.userName || loginName,

        username:
          item.username || loginUsername,
      };
    });
  }, [actions, loginName, loginUsername]);

  // =====================================
  // DANH SÁCH THIẾT BỊ
  // =====================================

  const deviceOptions = useMemo(() => {
    return [
      ...new Set(
        rows
          .map((item) => item.deviceName)
          .filter(Boolean)
      ),
    ].sort();
  }, [rows]);

  // =====================================
  // LỌC VÀ SẮP XẾP
  // =====================================

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows
      .filter((item) => {
        const timeText = formatDateTime(
          item.timestamp
        ).toLowerCase();

        const matchSearch =
          !keyword ||
          timeText.includes(keyword);

        const matchDevice =
          device === "all" ||
          item.deviceName === device;

        const matchAction =
          action === "all" ||
          item.action === action;

        const matchStatus =
          status === "all" ||
          item.status === status;

        return (
          matchSearch &&
          matchDevice &&
          matchAction &&
          matchStatus
        );
      })
      .sort((a, b) => {
        const timeDiff =
          a.timestamp - b.timestamp;

        const idDiff =
          Number(a.id) - Number(b.id);

        return sortOrder === "asc"
          ? timeDiff || idDiff
          : -timeDiff || -idDiff;
      });
  }, [
    rows,
    search,
    device,
    action,
    status,
    sortOrder,
  ]);

  // =====================================
  // PHÂN TRANG
  // =====================================

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const displayed = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (number) =>
      number === 1 ||
      number === totalPages ||
      Math.abs(number - currentPage) <= 1
  );

  // =====================================
  // GIAO DIỆN HISTORY
  // =====================================

  return (
    <div className="data-page history-page">
      <h1 className="page-title">
        History
      </h1>

      {/* =================================
          BỘ LỌC
      ================================= */}

      <div className="history-filter">
        {/* SEARCH THEO THỜI GIAN */}

        <div
          className="datetime-picker-wrapper"
          ref={pickerRef}
        >
          <div className="search-field time-search-field">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search by time..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <button
              type="button"
              className="datetime-picker-button"
              onClick={() =>
                setPickerOpen((current) => !current)
              }
              title="Select date and time"
            >
              <CalendarClock size={19} />
            </button>
          </div>

          {/* DATETIME PICKER */}

          {pickerOpen && (
            <div className="custom-datetime-picker">
              {/* LỊCH */}

              <div className="picker-calendar">
                <div className="picker-calendar-header">
                  <strong>
                    {MONTH_NAMES[pickerMonth]}{" "}
                    {pickerYear}
                  </strong>

                  <div>
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      title="Previous month"
                    >
                      <ChevronUp size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      title="Next month"
                    >
                      <ChevronDown size={19} />
                    </button>
                  </div>
                </div>

                <div className="picker-weekdays">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                <div className="picker-days">
                  {getCalendarDays(
                    pickerYear,
                    pickerMonth
                  ).map((item, index) => (
                    <button
                      type="button"
                      key={index}
                      className={[
                        "picker-day",

                        item.monthOffset !== 0
                          ? "other-month"
                          : "",

                        item.monthOffset === 0 &&
                        item.day === pickerDay
                          ? "selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectDay(item)}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHỌN GIỜ PHÚT GIÂY */}

              <div className="picker-time">
                {/* GIỜ */}

                <ScrollColumn
                  values={HOURS}
                  value={pickerHour}
                  onChange={changeHour12}
                />

                <span className="time-wheel-separator">
                  :
                </span>

                {/* PHÚT */}

                <ScrollColumn
                  values={MINUTES}
                  value={pickerMinute}
                  onChange={(minute) =>
                    updatePicker({ minute })
                  }
                />

                <span className="time-wheel-separator">
                  :
                </span>

                {/* GIÂY */}

                <ScrollColumn
                  values={SECONDS}
                  value={pickerSecond}
                  onChange={(second) =>
                    updatePicker({ second })
                  }
                />

                {/* AM / PM */}

                <ScrollColumn
                  values={PERIODS}
                  value={pickerPeriod}
                  onChange={changePeriod}
                  formatValue={(item) => item}
                />
              </div>

              {/* NÚT CHỌN NGÀY GIỜ */}

              <div className="picker-footer">
                <button
                  type="button"
                  className="picker-clear"
                  onClick={handleClearDate}
                >
                  Clear
                </button>

                <div className="picker-footer-right">
                  <button
                    type="button"
                    className="picker-today"
                    onClick={() =>
                      setPickerDate(new Date())
                    }
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    className="picker-ok"
                    onClick={handleConfirmDateTime}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LỌC THEO THIẾT BỊ */}

        <select
          value={device}
          onChange={(event) => {
            setDevice(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">
            All Devices
          </option>

          {deviceOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* LỌC THEO HÀNH ĐỘNG */}

        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">
            Action
          </option>

          <option value="ON">
            ON
          </option>

          <option value="OFF">
            OFF
          </option>
        </select>

        {/* LỌC THEO TRẠNG THÁI */}

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">
            All Status
          </option>

          <option value="Success">
            Success
          </option>

          <option value="Error">
            Error
          </option>

          <option value="Loading">
            Loading
          </option>
        </select>

        {/* SẮP XẾP */}

        <select
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

        {/* XÓA BỘ LỌC */}

        <button
          type="button"
          className="clear-filter-button"
          onClick={handleClearAll}
          disabled={
            search === "" &&
            device === "all" &&
            action === "all" &&
            status === "all" &&
            sortOrder === "desc"
          }
        >
          Clear All
        </button>
      </div>

      {/* =================================
          BẢNG LỊCH SỬ
      ================================= */}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table history-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DEVICE</th>
                <th>ACTION</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>

            <tbody>
              {displayed.map((item) => (
                <tr key={item.id}>
                  {/* ID */}

                  <td>
                    #{item.id}
                  </td>

                  {/* USER */}

                  <td>
                    <div className="history-user">
                      <strong>
                        {item.userName}
                      </strong>

                      <span>
                        {item.username}
                      </span>
                    </div>
                  </td>

                  {/* DEVICE */}

                  <td>
                    <span className="type-badge temperature">
                      ● {item.deviceName}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td>
                    <span
                      className={`action-badge ${
                        item.action.toLowerCase()
                      }`}
                    >
                      {item.action}
                    </span>
                  </td>

                  {/* STATUS */}

                  <td>
                    <span
                      className={
                        item.status === "Success"
                          ? "status-normal"
                          : "status-warning"
                      }
                    >
                      ● {item.status}
                    </span>
                  </td>

                  {/* TIME + COPY */}

                  <td>
                    <div
                      className="time-cell"
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
                        onClick={() =>
                          handleCopyTime(
                            item.timestamp,
                            item.id
                          )
                        }
                        title={
                          copiedId === item.id
                            ? "Copied!"
                            : "Copy time"
                        }
                        aria-label="Copy time"
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

              {/* KHÔNG CÓ DỮ LIỆU */}

              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-state"
                  >
                    No action history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================
            PHÂN TRANG
        ================================= */}

        <div className="table-footer">
          <span>
            Showing {displayed.length} of{" "}
            {filtered.length} results
          </span>

          <div className="table-footer-right">
            {/* SỐ DÒNG MỖI TRANG */}

            <div className="page-size-control">
              <span>
                Rows per page:
              </span>

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

            {/* CÁC NÚT CHUYỂN TRANG */}

            <div className="pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage(currentPage - 1)
                }
              >
                <ChevronLeft size={18} />
              </button>

              {visiblePages.map((number) => (
                <button
                  type="button"
                  key={number}
                  className={
                    currentPage === number
                      ? "selected"
                      : ""
                  }
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage(currentPage + 1)
                }
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