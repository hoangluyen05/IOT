
import { useState } from "react";
import { Search, CalendarDays } from "lucide-react";

const PAGE_SIZE = 10;

export default function ActionHistory({ actions }) {
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState("all");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = actions.filter((item) => {
    const date = new Date(item.timestamp).toLocaleString("vi-VN");

    return (
      date.toLowerCase().includes(search.toLowerCase()) &&
      (device === "all" || item.deviceName === device) &&
      (action === "all" || item.action === action)
    );
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

  return (
    <div className="history-page">
      <h1 className="page-title">History</h1>

      <div className="history-filter">
        <div className="search-field">
          <Search size={20} />

          <input
            placeholder="Search by time..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={device}
          onChange={(e) => {
            setDevice(e.target.value);
            setPage(1);
          }}
        >
          
<option value="all">All Devices</option>
<option value="LED 1">LED 1</option>
<option value="LED 2">LED 2</option>
<option value="LED 3">LED 3</option>

        </select>

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Action</option>
          <option value="ON">ON</option>
          <option value="OFF">OFF</option>
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TIME</th>
                <th>DEVICE</th>
                <th>ACTION</th>
                <th>STATUS</th>
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
                    <span
                      className={`type-badge ${
                        item.deviceName === "Lighting"
                          ? "light"
                          : item.deviceName === "Humidity"
                          ? "humidity"
                          : "temperature"
                      }`}
                    >
                      {item.deviceName}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`action-badge ${item.action.toLowerCase()}`}
                    >
                      {item.action}
                    </span>
                  </td>

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
                  <td colSpan="5" className="empty-state">
                    No action history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {displayed.length} of {filtered.length} results
          </span>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Prev
            </button>

            <button className="selected">{currentPage}</button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
