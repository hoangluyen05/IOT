
import { useState } from "react";

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

import useSensorSimulation from "./hooks/useSensorSimulation";

import { initialDevices } from "./services/mockData";

import {
  isAuthenticated,
  logout,
} from "./services/authService";

import "./styles/global.css";

// Component bảo vệ các trang cần đăng nhập
function ProtectedRoute({ authenticated, children }) {
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout chính của hệ thống
function MainLayout({
  authenticated,
  onLogout,
  sensor,
  history,
  records,
  devices,
  setDevices,
  actions,
  addAction,
}) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onLogout();

    navigate("/login", { replace: true });
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
              Đăng xuất
            </button>
          </header>

          <main className="main-content">
            <Routes>
              <Route
                index
                element={
                  <Dashboard
                    sensor={sensor}
                    history={history}
                    devices={devices}
                    setDevices={setDevices}
                    onAction={addAction}
                  />
                }
              />

              <Route
                path="sensors"
                element={<DataSensor records={records} />}
              />

              <Route
                path="history"
                element={<ActionHistory actions={actions} />}
              />

              <Route
                path="profile"
                element={<Profile />}
              />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Component App chính
export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => isAuthenticated()
  );

  const { sensor, history, records } = useSensorSimulation();

  const [devices, setDevices] = useState(initialDevices);

  const [actions, setActions] = useState([]);

  function addAction(action) {
    setActions((previous) => [action, ...previous]);
  }

  function handleLogin() {
    setAuthenticated(true);
  }

  function handleLogout() {
    setAuthenticated(false);

    // Đặt lại trạng thái thiết bị và lịch sử demo
    setDevices(initialDevices);
    setActions([]);
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Trang đăng nhập */}
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

        {/* Các trang cần đăng nhập */}
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
              setDevices={setDevices}
              actions={actions}
              addAction={addAction}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
