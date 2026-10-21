import { profile } from "./services/mockData";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataSensor from "./pages/DataSensor";
import ActionHistory from "./pages/ActionHistory";
import Profile from "./pages/Profile";

// GIỮ NGUYÊN XÁC THỰC Ở FRONTEND
import {
  isAuthenticated,
  logout,
} from "./services/authService";

// API dữ liệu IoT
import {
  getDataSensors,
  getDevices,
  getHistory,
} from "./services/api";

// Chuyển dữ liệu Backend cho Frontend
import {
  listOf,
  toSensorRecord,
  toDevice,
  toAction,
  chartPoints,
} from "./services/adapters";

import "./styles/global.css";

// =====================================
// BẢO VỆ TRANG ĐÃ ĐĂNG NHẬP
// =====================================

function ProtectedRoute({
  authenticated,
  children,
}) {
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// =====================================
// GIAO DIỆN CHÍNH
// =====================================

function MainLayout({
  authenticated,
  onLogout,
  sensor,
  history,
  records,
  devices,
  actions,
  refreshDevices,
  apiError,
}) {
  const navigate = useNavigate();

  function handleLogout() {
    // Đăng xuất bằng authService Frontend
    logout();

    onLogout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <ProtectedRoute authenticated={authenticated}>
      <div className="app-layout">
        <Sidebar />

        <div className="app-right">
          <header className="topbar">
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </header>

          <main className="main-content">
            {/* Thông báo lỗi kết nối Backend */}
            {apiError && (
              <div
                role="alert"
                style={{
                  padding: 10,
                  color: "#b91c1c",
                }}
              >
                Không tải được dữ liệu Backend:
                {" "}
                {apiError}
              </div>
            )}

            <Routes>
              {/* DASHBOARD */}
              <Route
                index
                element={
                  <Dashboard
                    sensor={sensor}
                    history={history}
                    devices={devices}
                    refreshDevices={refreshDevices}
                  />
                }
              />

              {/* DATA SENSOR */}
              <Route
                path="sensors"
                element={
                  <DataSensor
                    records={records}
                  />
                }
              />

              {/* HISTORY */}
              <Route
  path="history"
  element={
    <ActionHistory
      actions={actions}
      currentUser={profile}
    />
  }
/>

              {/* PROFILE - GIỮ FRONTEND */}
              <Route
                path="profile"
                element={<Profile />}
              />

              <Route
                path="*"
                element={
                  <Navigate to="/" replace />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// =====================================
// APP
// =====================================

export default function App() {
  // Đăng nhập hoàn toàn bằng Frontend
  const [authenticated, setAuthenticated] =
    useState(() => isAuthenticated());

  // Dữ liệu cảm biến mới nhất
  const [sensor, setSensor] = useState({
    temperature: null,
    humidity: null,
    light: null,
  });

  // Dữ liệu biểu đồ
  const [history, setHistory] = useState([]);

  // Dữ liệu bảng cảm biến
  const [records, setRecords] = useState([]);

  // Danh sách trạng thái LED
  const [devices, setDevices] = useState([]);

  // Lịch sử điều khiển LED
  const [actions, setActions] = useState([]);

  // Lỗi kết nối Backend
  const [apiError, setApiError] = useState("");

  // =====================================
  // TẢI LẠI TRẠNG THÁI LED
  // =====================================

  const refreshDevices = useCallback(async () => {
    const response = await getDevices();

    const result = listOf(response).map(toDevice);

    setDevices(result);

    return result;
  }, []);

  // =====================================
  // LẤY DỮ LIỆU TỪ BACKEND
  // =====================================

  useEffect(() => {
    // Chỉ lấy dữ liệu khi người dùng đã đăng nhập
    if (!authenticated) return;

    let active = true;
    let inFlight = false;

    async function loadBackendData() {
      // Tránh các yêu cầu tải dữ liệu chồng nhau
      if (inFlight) return;

      inFlight = true;

      try {
        const [
          sensorResponse,
          deviceResponse,
          historyResponse,
        ] = await Promise.all([
          // 500 bản ghi cảm biến gần nhất
          getDataSensors({
            page: 0,
            size: 500,
            sort: "desc",
          }),

          // Danh sách LED
          getDevices(),

          // Lịch sử thao tác
          getHistory(),
        ]);

        if (!active) return;

        // =================================
        // 1. DỮ LIỆU CẢM BIẾN
        // =================================

        const sensorRecords =
          listOf(sensorResponse)
            .map(toSensorRecord)
            .filter(
              (item) =>
                item.timestamp > 0 &&
                Number.isFinite(item.value)
            );

        setRecords(sensorRecords);

        // =================================
        // 2. BIỂU ĐỒ
        // =================================

        setHistory(chartPoints(sensorRecords));

        // =================================
        // 3. CẢM BIẾN MỚI NHẤT
        // =================================

        const latest = {
          temperature: null,
          humidity: null,
          light: null,
        };

        const seen = new Set();

        const sorted = [...sensorRecords].sort(
          (a, b) => b.timestamp - a.timestamp
        );

        for (const item of sorted) {
          if (
            Object.prototype.hasOwnProperty.call(
              latest,
              item.type
            ) &&
            !seen.has(item.type)
          ) {
            latest[item.type] = item.value;
            seen.add(item.type);
          }
        }

        setSensor(latest);

        // =================================
        // 4. THIẾT BỊ
        // =================================

        const deviceRecords =
          listOf(deviceResponse).map(toDevice);

        setDevices(deviceRecords);

        // =================================
        // 5. LỊCH SỬ ĐIỀU KHIỂN
        // =================================

        const actionRecords =
          listOf(historyResponse).map(
            (item) => toAction(item, deviceRecords)
          );

        setActions(actionRecords);

        setApiError("");
      } catch (error) {
        if (active) {
          setApiError(error.message);
        }
      } finally {
        inFlight = false;
      }
    }

    // Tải dữ liệu lần đầu
    loadBackendData();

    // Cập nhật sau mỗi 3 giây
    const timer = setInterval(
      loadBackendData,
      3000
    );

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [authenticated]);

  // =====================================
  // ĐĂNG NHẬP
  // =====================================

  function handleLogin() {
    // Login.jsx đã kiểm tra tài khoản
    setAuthenticated(true);
  }

  // =====================================
  // ĐĂNG XUẤT
  // =====================================

  function handleLogout() {
    setAuthenticated(false);

    // Xóa dữ liệu IoT trong bộ nhớ giao diện
    setDevices([]);
    setRecords([]);
    setHistory([]);
    setActions([]);

    setSensor({
      temperature: null,
      humidity: null,
      light: null,
    });

    setApiError("");
  }

  // =====================================
  // ROUTER
  // =====================================

  return (
    <BrowserRouter>
      <Routes>
        {/* TRANG LOGIN */}
        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* CÁC TRANG SAU ĐĂNG NHẬP */}
        <Route
          path="/*"
          element={
            <MainLayout
              authenticated={authenticated}
              onLogout={handleLogout}
              sensor={sensor}
              history={history}
              records={records}
              devices={devices}
              actions={actions}
              refreshDevices={refreshDevices}
              apiError={apiError}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
