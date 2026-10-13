import { useEffect, useRef, useState } from "react";

import {
  Search,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const SECONDS = Array.from({ length: 60 }, (_, index) => index);
const PERIODS = ["AM", "PM"];

// =========================================
// FORMAT DATE TIME
// =========================================
function formatDateTime(timestamp) {
  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

// =========================================
// GET CALENDAR DAYS
// =========================================
function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPreviousMonth - i,
      monthOffset: -1,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      monthOffset: 0,
    });
  }

  let nextDay = 1;

  while (days.length < 42) {
    days.push({
      day: nextDay,
      monthOffset: 1,
    });

    nextDay++;
  }

  return days;
}

// =========================================
// SCROLL TIME COLUMN
// =========================================
function ScrollColumn({
  values,
  value,
  onChange,
  formatValue = (item) => String(item).padStart(2, "0"),
}) {
  const containerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  const ITEM_HEIGHT = 38;

  useEffect(() => {
    const index = values.indexOf(value);

    if (containerRef.current && index >= 0) {
      containerRef.current.scrollTop =
        index * ITEM_HEIGHT;
    }
  }, [value, values]);

  const handleScroll = () => {
    if (!containerRef.current) return;

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      const index = Math.round(
        containerRef.current.scrollTop /
          ITEM_HEIGHT
      );

      const safeIndex = Math.max(
        0,
        Math.min(index, values.length - 1)
      );

      onChange(values[safeIndex]);

      containerRef.current.scrollTo({
        top: safeIndex * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSelect = (item) => {
    const index = values.indexOf(item);

    onChange(item);

    containerRef.current?.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

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
            type="button"
            key={item}
            className={`scroll-time-item ${
              item === value ? "selected" : ""
            }`}
            onClick={() =>
              handleSelect(item)
            }
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

export default function ActionHistory({
  actions,
  currentUser,
}) {
  // =========================================
  // FILTER
  // =========================================
  const [search, setSearch] = useState("");

  const [device, setDevice] = useState("all");
  const [action, setAction] = useState("all");
  const [status, setStatus] = useState("all");

  // Mặc định mới nhất trước
  const [sortOrder, setSortOrder] = useState("desc");

  // =========================================
  // PAGINATION
  // =========================================
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // =========================================
  // DATE TIME PICKER
  // =========================================
  const [pickerOpen, setPickerOpen] = useState(false);

  const now = new Date();

  const [pickerYear, setPickerYear] = useState(
    now.getFullYear()
  );

  const [pickerMonth, setPickerMonth] = useState(
    now.getMonth()
  );

  const [pickerDay, setPickerDay] = useState(
    now.getDate()
  );

  const [pickerHour, setPickerHour] = useState(
    now.getHours() % 12 || 12
  );

  const [pickerMinute, setPickerMinute] = useState(
    now.getMinutes()
  );

  const [pickerSecond, setPickerSecond] = useState(
    now.getSeconds()
  );

  const [pickerPeriod, setPickerPeriod] = useState(
    now.getHours() >= 12 ? "PM" : "AM"
  );

  const pickerRef = useRef(null);

  // =========================================
  // CLICK OUTSIDE PICKER
  // =========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setPickerOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const calendarDays = getCalendarDays(
    pickerYear,
    pickerMonth
  );

  // =========================================
  // PREVIOUS MONTH
  // =========================================
  const handlePreviousMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear((prev) => prev - 1);
    } else {
      setPickerMonth((prev) => prev - 1);
    }
  };

  // =========================================
  // NEXT MONTH
  // =========================================
  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear((prev) => prev + 1);
    } else {
      setPickerMonth((prev) => prev + 1);
    }
  };

  // =========================================
  // SELECT DAY
  // =========================================
  const handleSelectDay = (item) => {
    if (item.monthOffset === -1) {
      const date = new Date(
        pickerYear,
        pickerMonth - 1,
        item.day
      );

      setPickerYear(date.getFullYear());
      setPickerMonth(date.getMonth());
      setPickerDay(date.getDate());

      return;
    }

    if (item.monthOffset === 1) {
      const date = new Date(
        pickerYear,
        pickerMonth + 1,
        item.day
      );

      setPickerYear(date.getFullYear());
      setPickerMonth(date.getMonth());
      setPickerDay(date.getDate());

      return;
    }

    setPickerDay(item.day);
  };

  // =========================================
  // TODAY
  // =========================================
  const handleToday = () => {
    const today = new Date();

    setPickerYear(today.getFullYear());
    setPickerMonth(today.getMonth());
    setPickerDay(today.getDate());

    setPickerHour(today.getHours() % 12 || 12);
    setPickerMinute(today.getMinutes());
    setPickerSecond(today.getSeconds());

    setPickerPeriod(
      today.getHours() >= 12 ? "PM" : "AM"
    );
  };

  // =========================================
  // CLEAR DATE
  // =========================================
  const handleClearDate = () => {
    setSearch("");
    setPage(1);
    setPickerOpen(false);
  };

  // =========================================
  // CONFIRM DATE TIME
  // =========================================
  const handleConfirmDateTime = () => {
    let hour24 = pickerHour;

    if (
      pickerPeriod === "AM" &&
      pickerHour === 12
    ) {
      hour24 = 0;
    }

    if (
      pickerPeriod === "PM" &&
      pickerHour !== 12
    ) {
      hour24 = pickerHour + 12;
    }

    const selectedDate = new Date(
      pickerYear,
      pickerMonth,
      pickerDay,
      hour24,
      pickerMinute,
      pickerSecond
    );

    setSearch(
      formatDateTime(selectedDate.getTime())
    );

    setPage(1);

    // Chỉ bấm OK mới đóng + áp dụng
    setPickerOpen(false);
  };

  // =========================================
  // CLEAR ALL
  // =========================================
  const handleClearAll = () => {
    setSearch("");

    setDevice("all");
    setAction("all");
    setStatus("all");

    setSortOrder("desc");

    setPage(1);
    setPickerOpen(false);
  };

  // =========================================
  // FILTER + SORT
  // =========================================
  const filtered = actions
    .filter((item) => {
      const date = formatDateTime(
        item.timestamp
      );

      const matchSearch = date
        .toLowerCase()
        .includes(
          search.trim().toLowerCase()
        );

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
      if (sortOrder === "asc") {
        return a.timestamp - b.timestamp;
      }

      return b.timestamp - a.timestamp;
    });

  // =========================================
  // PAGINATION
  // =========================================
  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / pageSize
    )
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

  return (
    <div className="history-page data-page">

      <h1 className="page-title">
        History
      </h1>

      {/* =========================================
          FILTER
      ========================================= */}
      <div className="history-filter">

        {/* SEARCH TIME */}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <button
              type="button"
              className="datetime-picker-button"
              onClick={() =>
                setPickerOpen((prev) => !prev)
              }
              title="Select date and time"
            >
              <CalendarClock size={19} />
            </button>

          </div>

          {/* =========================================
              DATE TIME PICKER
          ========================================= */}
          {pickerOpen && (
            <div className="custom-datetime-picker">

              {/* CALENDAR */}
              <div className="picker-calendar">

                <div className="picker-calendar-header">

                  <strong>
                    {MONTH_NAMES[pickerMonth]}{" "}
                    {pickerYear}
                  </strong>

                  <div>
                    <button
                      type="button"
                      onClick={handlePreviousMonth}
                      title="Previous month"
                    >
                      <ChevronUp size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextMonth}
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

                  {calendarDays.map(
                    (item, index) => (
                      <button
                        type="button"
                        key={`${item.monthOffset}-${item.day}-${index}`}
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
                        onClick={() =>
                          handleSelectDay(item)
                        }
                      >
                        {item.day}
                      </button>
                    )
                  )}

                </div>
              </div>

              {/* =========================================
                  SCROLL TIME
              ========================================= */}
              <div className="picker-time">

                {/* HOUR */}
                <ScrollColumn
                  values={HOURS}
                  value={pickerHour}
                  onChange={setPickerHour}
                />

                <span className="time-wheel-separator">
                  :
                </span>

                {/* MINUTE */}
                <ScrollColumn
                  values={MINUTES}
                  value={pickerMinute}
                  onChange={setPickerMinute}
                />

                <span className="time-wheel-separator">
                  :
                </span>

                {/* SECOND */}
                <ScrollColumn
                  values={SECONDS}
                  value={pickerSecond}
                  onChange={setPickerSecond}
                />

                {/* AM / PM */}
                <ScrollColumn
                  values={PERIODS}
                  value={pickerPeriod}
                  onChange={setPickerPeriod}
                  formatValue={(item) => item}
                />

              </div>

              {/* =========================================
                  FOOTER
              ========================================= */}
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
                    onClick={handleToday}
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

        {/* DEVICE */}
        <select
          value={device}
          onChange={(e) => {
            setDevice(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">
            All Devices
          </option>

          <option value="LED 1">
            LED 1
          </option>

          <option value="LED 2">
            LED 2
          </option>

          <option value="LED 3">
            LED 3
          </option>
        </select>

        {/* ACTION */}
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
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

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
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

        {/* SORT */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          title="Sort by time"
        >
          <option value="desc">
            Newest First
          </option>

          <option value="asc">
            Oldest First
          </option>
        </select>

        {/* CLEAR ALL */}
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

      {/* =========================================
          TABLE
      ========================================= */}
      <div className="table-card">

        <div className="table-scroll">

          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>TIME</th>
                <th>DEVICE</th>
                <th>ACTION</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {displayed.map((item) => (
                <tr key={item.id}>

                  <td>
                    #{item.id}
                  </td>

                  {/* USER */}
                  <td>
                    <div className="history-user">

                      <strong>
                        {item.userName ||
                          currentUser?.name ||
                          "Hoàng Thị Luyến"}
                      </strong>

                      <span>
                        {item.username ||
                          currentUser?.username ||
                          "luyenht"}
                      </span>

                    </div>
                  </td>

                  {/* TIME */}
                  <td>
                    <span className="time-cell">

                      <CalendarDays size={16} />

                      {formatDateTime(
                        item.timestamp
                      )}

                    </span>
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
                      className={`action-badge ${item.action.toLowerCase()}`}
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

                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    No action history found
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

        {/* =========================================
            FOOTER
        ========================================= */}
        <div className="table-footer">

          <span>
            Showing {displayed.length} of{" "}
            {filtered.length} results
          </span>

          <div className="table-footer-right">

            {/* ROWS PER PAGE */}
            <div className="page-size-control">

              <span>
                Rows per page:
              </span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(
                    Number(e.target.value)
                  );

                  setPage(1);
                }}
              >
                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>
              </select>

            </div>

            {/* PAGINATION */}
            <div className="pagination">

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage(
                    currentPage - 1
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>

              {visiblePages.map(
                (number) => (
                  <button
                    key={number}
                    className={
                      currentPage === number
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setPage(number)
                    }
                  >
                    {number}
                  </button>
                )
              )}

              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage(
                    currentPage + 1
                  )
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