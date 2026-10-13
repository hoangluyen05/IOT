import { useState } from "react";

import SensorCard from "../components/SensorCard";
import SensorChart from "../components/SensorChart";
import DeviceControl from "../components/DeviceControl";

export default function Dashboard({
  sensor,
  history,
  devices,
  setDevices,
  onAction,
}) {
  // Trạng thái pending khi bật/tắt tất cả LED
  const [bulkPending, setBulkPending] = useState(false);

  // Kiểm tra tất cả LED đã bật hay chưa
  const allDevicesOn =
    devices.length > 0 &&
    devices.every((device) => device.status);

  // Bật tất cả các LED
  const handleTurnOnAll = async () => {
    // Không cho click nhiều lần khi đang xử lý
    if (bulkPending) return;

    // Bắt đầu pending
    setBulkPending(true);

    // Giả lập thời gian chờ thiết bị phản hồi
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    const timestamp = Date.now();

    // Lưu lịch sử cho các LED đang tắt
    devices.forEach((device) => {
      if (!device.status) {
        onAction({
          id: timestamp + device.id,
          deviceId: device.id,
          deviceName: device.name,
          action: "ON",
          status: "Success",
          timestamp: timestamp,
        });
      }
    });

    // Chuyển tất cả LED sang trạng thái bật
    setDevices((prevDevices) =>
      prevDevices.map((device) => ({
        ...device,
        status: true,
      }))
    );

    // Kết thúc pending
    setBulkPending(false);
  };

  // Tắt tất cả các LED
  const handleTurnOffAll = async () => {
    // Không cho click nhiều lần khi đang xử lý
    if (bulkPending) return;

    // Bắt đầu pending
    setBulkPending(true);

    // Giả lập thời gian chờ thiết bị phản hồi
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    const timestamp = Date.now();

    // Lưu lịch sử cho các LED đang bật
    devices.forEach((device) => {
      if (device.status) {
        onAction({
          id: timestamp + device.id,
          deviceId: device.id,
          deviceName: device.name,
          action: "OFF",
          status: "Success",
          timestamp: timestamp,
        });
      }
    });

    // Chuyển tất cả LED sang trạng thái tắt
    setDevices((prevDevices) =>
      prevDevices.map((device) => ({
        ...device,
        status: false,
      }))
    );

    // Kết thúc pending
    setBulkPending(false);
  };

  return (
    <div className="dashboard-page">
      <h1 className="page-title">
        Dashboard
      </h1>

      {/* =========================
          SENSOR CARDS
      ========================= */}
      <div className="sensor-grid">
        <SensorCard
          type="temperature"
          value={sensor.temperature}
        />

        <SensorCard
          type="humidity"
          value={sensor.humidity}
        />

        <SensorCard
          type="light"
          value={sensor.light}
        />
      </div>

      {/* =========================
          CHART + DEVICE CONTROL
      ========================= */}
      <div className="dashboard-bottom">

        {/* Biểu đồ cảm biến */}
        <SensorChart data={history} />

        {/* Điều khiển LED */}
        <div className="device-control-wrapper">

          {/* =========================
              TURN ALL ON / OFF
          ========================= */}
          <div className="all-device-actions">

            {allDevicesOn ? (
              // Tất cả LED đang bật
              // => hiển thị Turn All Off
              <button
                type="button"
                className={`all-device-button off ${
                  bulkPending ? "pending" : ""
                }`}
                onClick={handleTurnOffAll}
                disabled={bulkPending}
              >
                {bulkPending ? (
                  <>
                    <span className="button-spinner" />
                    Pending...
                  </>
                ) : (
                  "Turn All Off"
                )}
              </button>
            ) : (
              // Chưa bật hết LED
              // => hiển thị Turn All On
              <button
                type="button"
                className={`all-device-button on ${
                  bulkPending ? "pending" : ""
                }`}
                onClick={handleTurnOnAll}
                disabled={bulkPending}
              >
                {bulkPending ? (
                  <>
                    <span className="button-spinner" />
                    Pending...
                  </>
                ) : (
                  "Turn All On"
                )}
              </button>
            )}

          </div>

          {/* =========================
              ĐIỀU KHIỂN TỪNG LED
          ========================= */}
          <DeviceControl
            devices={devices}
            setDevices={setDevices}
            onAction={onAction}
          />

        </div>
      </div>
    </div>
  );
}