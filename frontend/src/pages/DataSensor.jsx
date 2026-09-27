
import { useState } from "react";
import { Search, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

const sensorTypes = [
  { key: "temperature", label: "Temp", unit: "°C" },
  { key: "humidity", label: "Hum", unit: "%" },
  { key: "light", label: "Light", unit: "lux" },
];

export default function DataSensor({ records }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

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

  const filtered = rows.filter((item) => {
    const date = new Date(item.timestamp).toLocaleString("vi-VN");

    const matchSearch = date
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchType =
      type === "all" || item.type === type;

    return matchSearch && matchType;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const displayed = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function changeFilter(value, setter) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="data-page">
      <h1 className="page-title">Data Sensor</h1>

      <div className="filter-card">
        <div className="search-field">
          <Search size={20} />

          <input
            placeholder="Search time..."
            value={search}
            onChange={(e) =>
              changeFilter(e.target.value, setSearch)
            }
          />
        </div>

        <select
          value={type}
          onChange={(e) =>
            changeFilter(e.target.value, setType)
          }
        >
          <option value="all">All Sensor Types</option>
          <option value="temperature">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TIME</th>
                <th>SENSOR TYPE</th>
                <th>VALUE</th>
              </tr>
            </thead>

            <tbody>
              {displayed.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>

                  <td>
                    <span className="time-cell">
                      <CalendarDays size={16} />
                      {new Date(item.timestamp).toLocaleString("vi-VN")}
                    </span>
                  </td>

                  <td>
                    <span className={`type-badge ${item.type}`}>
                      ● {item.label}
                    </span>
                  </td>

                  <td className="value-cell">
                    {item.value} {item.unit}
                  </td>
                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No sensor data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {displayed.length} of {filtered.length}
          </span>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .filter(
                (number) =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - currentPage) <= 1
              )
              .map((number) => (
                <button
                  key={number}
                  className={
                    currentPage === number ? "selected" : ""
                  }
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
