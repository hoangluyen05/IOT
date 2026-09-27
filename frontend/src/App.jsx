
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import DataSensor from "./pages/DataSensor";
import ActionHistory from "./pages/ActionHistory";
import Profile from "./pages/Profile";

import useSensorSimulation from "./hooks/useSensorSimulation";

import { initialDevices } from "./services/mockData";

import "./styles/global.css";

export default function App() {
  const { sensor, history, records } = useSensorSimulation();

  const [devices, setDevices] = useState(initialDevices);

  const [actions, setActions] = useState([]);

  function addAction(action) {
    setActions((previous) => [action, ...previous]);
  }

  function handleLogout() {
    // Chưa có Backend xác thực.
    // Sẽ triển khai khi xây dựng chức năng Login.
    window.alert("Chức năng đăng xuất sẽ được tích hợp sau.");
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="app-right">
          <header className="topbar">
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </header>

          <main className="main-content">
            <Routes>
              <Route
                path="/"
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
                path="/sensors"
                element={
                  <DataSensor records={records} />
                }
              />

              <Route
                path="/history"
                element={
                  <ActionHistory actions={actions} />
                }
              />

              <Route
                path="/profile"
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
    </BrowserRouter>
  );
}
