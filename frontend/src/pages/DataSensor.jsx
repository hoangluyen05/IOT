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

const sensorTypes = [
  { key: "temperature", label: "Temp", unit: "°C" },
  { key: "humidity", label: "Hum", unit: "%" },
  { key: "light", label: "Light", unit: "lux" },
];

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

// Định dạng thời gian hiển thị
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

// Tạo danh sách ngày cho lịch
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

// Cột cuộn chọn giờ, phút, giây
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
      containerRef.current.scrollTop = index * ITEM_HEIGHT;
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
        containerRef.current.scrollTop / ITEM_HEIGHT
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

export default function DataSensor({ records }) {
  // Trạng thái bộ lọc
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [type, setType] = useState("all");
  // Loại lọc thực tế sau khi bấm Search
  const [appliedType, setAppliedType] = useState("all");

  // Sắp xếp mặc định: mới nhất trước
  const [sortOrder, setSortOrder] = useState("desc");

  // Trạng thái phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Trạng thái bộ chọn ngày giờ
  const [pickerOpen, setPickerOpen] = useState(false);

  const now = new Date();

  const [pickerYear, setPickerYear] = useState(now.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(now.getMonth());
  const [pickerDay, setPickerDay] = useState(now.getDate());

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

  // Đóng lịch khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calendarDays = getCalendarDays(
    pickerYear,
    pickerMonth
  );

  // Mở hoặc đóng lịch
  const handleOpenPicker = () => {
    setPickerOpen((prev) => !prev);
  };

  // Chuyển về tháng trước
  const handlePreviousMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear((prev) => prev - 1);
    } else {
      setPickerMonth((prev) => prev - 1);
    }
  };

  // Chuyển sang tháng sau
  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear((prev) => prev + 1);
    } else {
      setPickerMonth((prev) => prev + 1);
    }
  };

  // Chọn ngày trên lịch
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

  // Chọn thời gian hiện tại
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

  // Xóa thời gian đã chọn
  const handleClearDate = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
    setPickerOpen(false);
  };

  // Xác nhận ngày giờ đã chọn
  const handleConfirmDateTime = () => {
    let hour24 = pickerHour;

    if (pickerPeriod === "AM" && pickerHour === 12) {
      hour24 = 0;
    }

    if (pickerPeriod === "PM" && pickerHour !== 12) {
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

    const selectedValue = formatDateTime(selectedDate.getTime());

    // Đưa thời gian vào ô nhập, chưa lọc dữ liệu
    setSearchInput(selectedValue);

    // Đóng lịch sau khi xác nhận
    setPickerOpen(false);
  };

  // Áp dụng bộ lọc khi bấm Search
  const handleSearch = () => {
    const keyword = searchInput.trim();

    // Không tìm kiếm khi ô nhập trống
    if (keyword === "") return;

    setAppliedType(type);
    setAppliedSearch(keyword);
    setPage(1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Xóa toàn bộ bộ lọc
  const handleClearAll = () => {
    setSearchInput("");
    setAppliedSearch("");
    setType("all");
    setAppliedType("all");
    setSortOrder("desc");

    setPage(1);
    setPickerOpen(false);
  };

  // Chuyển dữ liệu cảm biến thành các dòng bảng
  const rows = records.flatMap((record) =>
    sensorTypes.map((sensor, index) => ({
      id: record.timestamp * 10 + index,
      timestamp: record.timestamp,
      type: sensor.key,
      label: sensor.label,
      value: record[sensor.key],
      unit: sensor.unit,
    }))
  );

  // Lọc và sắp xếp dữ liệu
  const filtered = rows
    .filter((item) => {
      const date = formatDateTime(item.timestamp);

      const keyword = appliedSearch.trim().toLowerCase();

      // Chưa có từ khóa thì hiển thị tất cả
      if (keyword === "") {
        return true;
      }

      // All: tìm theo thời gian, loại và giá trị
      if (appliedType === "all") {
        return (
          date.toLowerCase().includes(keyword) ||
          item.label.toLowerCase().includes(keyword) ||
          item.type.toLowerCase().includes(keyword) ||
          `${item.value}`.toLowerCase().includes(keyword) ||
          `${item.value} ${item.unit}`.toLowerCase().includes(keyword)
        );
      }

      // Time: tìm theo cột thời gian
      if (appliedType === "time") {
        return date.toLowerCase().includes(keyword);
      }

      // Cảm biến: lọc đúng loại và giá trị
      return (
        item.type === appliedType &&
        (
          `${item.value}`.toLowerCase().includes(keyword) ||
          `${item.value} ${item.unit}`.toLowerCase().includes(keyword)
        )
      );
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.timestamp - b.timestamp;
      }

      return b.timestamp - a.timestamp;
    });

  // Trạng thái phân trang
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

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
    <div className="data-page">
      <h1 className="page-title">
        Data Sensor
      </h1>

      {/* Bộ lọc dữ liệu */}
      <div className="filter-card">

        {/* Chọn loại dữ liệu cần tìm */}
        <select
          value={type}
          onChange={(e) => {
            // Đổi loại tìm kiếm, chưa lọc dữ liệu
            setType(e.target.value);
            setSearchInput("");
            setPickerOpen(false);
          }}
        >
          <option value="all">All</option>
          <option value="time">Time</option>
          <option value="temperature">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="light">Light</option>
        </select>

        {/* Nhập nội dung tìm kiếm */}
        <div
          className="datetime-picker-wrapper data-sensor-search-wrapper"
          ref={pickerRef}
        >
          <div className="search-field time-search-field">
            <Search size={20} />

            <input
              type={
                type === "temperature" ||
                type === "humidity" ||
                type === "light"
                  ? "number"
                  : "text"
              }
              step="any"
              placeholder={
                type === "time"
                  ? "Enter time..."
                  : type === "temperature"
                  ? "Enter temperature value..."
                  : type === "humidity"
                  ? "Enter humidity value..."
                  : type === "light"
                  ? "Enter light value..."
                  : "Enter search content..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />

            {type === "time" && (
              <button
                type="button"
                className="datetime-picker-button"
                onClick={handleOpenPicker}
                title="Select date and time"
              >
                <CalendarClock size={19} />
              </button>
            )}
          </div>

          {type === "time" && pickerOpen && (
            <div className="custom-datetime-picker">
              <div className="picker-calendar">
                <div className="picker-calendar-header">
                  <strong>
                    {MONTH_NAMES[pickerMonth]} {pickerYear}
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
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span>
                  <span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                <div className="picker-days">
                  {calendarDays.map((item, index) => (
                    <button
                      type="button"
                      key={`${item.monthOffset}-${item.day}-${index}`}
                      className={[
                        "picker-day",
                        item.monthOffset !== 0 ? "other-month" : "",
                        item.monthOffset === 0 && item.day === pickerDay
                          ? "selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelectDay(item)}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="picker-time">
                <ScrollColumn
                  values={HOURS}
                  value={pickerHour}
                  onChange={setPickerHour}
                />
                <span className="time-wheel-separator">:</span>
                <ScrollColumn
                  values={MINUTES}
                  value={pickerMinute}
                  onChange={setPickerMinute}
                />
                <span className="time-wheel-separator">:</span>
                <ScrollColumn
                  values={SECONDS}
                  value={pickerSecond}
                  onChange={setPickerSecond}
                />
                <ScrollColumn
                  values={PERIODS}
                  value={pickerPeriod}
                  onChange={setPickerPeriod}
                  formatValue={(item) => item}
                />
              </div>

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

        {/* Nút thực hiện tìm kiếm */}
        <button
          type="button"
          className="sensor-search-button"
          onClick={handleSearch}
          disabled={searchInput.trim() === ""}
          title={
            searchInput.trim() === ""
              ? "Enter a value before searching"
              : "Search"
          }
        >
          <Search size={18} />
          Search
        </button>

        {/* Sắp xếp theo thời gian */}
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

        {/* Xóa bộ lọc */}
        <button
          type="button"
          className="clear-filter-button"
          onClick={handleClearAll}
          disabled={
            searchInput === "" &&
            appliedSearch === "" &&
            type === "all" &&
            sortOrder === "desc"
          }
        >
          Clear All
        </button>
      </div>

      {/* Bảng dữ liệu cảm biến */}
      <div className="table-card">

        <div className="table-scroll">
          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>TIME</th>
                <th>SENSOR TYPE</th>

                <th className="value-column">
                  VALUE
                </th>
              </tr>
            </thead>

            <tbody>
              {displayed.map((item) => (
                <tr key={item.id}>

                  <td>
                    #{item.id}
                  </td>

                  <td>
                    <span className="time-cell">
                      <CalendarDays size={16} />

                      {formatDateTime(
                        item.timestamp
                      )}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`type-badge ${item.type}`}
                    >
                      ● {item.label}
                    </span>
                  </td>

                  <td className="value-column">
                    {item.value} {item.unit}
                  </td>

                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-state"
                  >
                    No sensor data found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Phân trang */}
        <div className="table-footer">

          <span>
            Showing {displayed.length} of{" "}
            {filtered.length} results
          </span>

          <div className="table-footer-right">

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

            <div className="pagination">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setPage(currentPage - 1)
                }
              >
                <ChevronLeft size={18} />
              </button>

              {visiblePages.map((number) => (
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
              ))}

              <button
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