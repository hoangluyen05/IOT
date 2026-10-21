
import { useState } from "react";
import { Lightbulb, AlertCircle } from "lucide-react";

import { controlDevice } from "../services/api";

import "../styles/iot-pages.css";

export default function DeviceControl({
  devices = [],
  refreshDevices,
}) {
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState("");

  async function handleToggle(device) {
    if (pendingId !== null) return;

    const nextStatus = !device.status;

    setPendingId(device.id);
    setError("");

    try {
      // Gửi lệnh bật/tắt LED thực
      await controlDevice(device.id, nextStatus);

      // Kiểm tra trạng thái do Backend cập nhật
      let confirmed = false;

      for (let attempt = 0; attempt < 8; attempt++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 350)
        );

        const latest = await refreshDevices?.();

        const currentDevice = latest?.find(
          (item) =>
            String(item.id) === String(device.id)
        );

        if (currentDevice?.status === nextStatus) {
          confirmed = true;
          break;
        }
      }

      if (!confirmed) {
        setError(
          `Chưa xác nhận được trạng thái ${device.name}.`
        );
      }
    } catch (err) {
      setError(
        err.message || "Cannot control this device"
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="iot-device-list">
      {error && (
        <div className="iot-error-message" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {devices.length === 0 && (
        <div className="iot-device-empty">
          No devices found
        </div>
      )}

      {devices.map((device) => {
        const isPending = pendingId === device.id;

        return (
          <div
            key={device.id}
            className={
              `iot-device-card ${
                device.status ? "is-on" : ""
              }`
            }
          >
            <div className="iot-device-left">
              <div className="iot-device-icon">
                <Lightbulb size={22} />
              </div>

              <div className="iot-device-info">
                <strong>{device.name}</strong>

                <span>
                  <i
                    className={
                      device.status
                        ? "iot-status-dot active"
                        : "iot-status-dot"
                    }
                  />

                  {isPending
                    ? "Sending command..."
                    : device.status
                    ? "Device is on"
                    : "Device is off"}
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-label={
                `${device.status ? "Turn off" : "Turn on"} ` +
                device.name
              }
              aria-checked={Boolean(device.status)}
              className={
                `iot-led-switch ${
                  device.status ? "active" : ""
                }`
              }
              disabled={pendingId !== null}
              onClick={() => handleToggle(device)}
            >
              <span className="iot-switch-thumb" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
