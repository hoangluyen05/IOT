
import { useState } from "react";
import { Lightbulb } from "lucide-react";

export default function DeviceControl({
  devices,
  setDevices,
  onAction,
}) {
  const [pendingId, setPendingId] = useState(null);

  async function handleToggle(device) {
    if (pendingId !== null) return;

    setPendingId(device.id);

    // Giả lập thời gian ESP32 xử lý lệnh
    await new Promise((resolve) => setTimeout(resolve, 800));

    const nextStatus = !device.status;

    // Cập nhật trạng thái LED
    setDevices((previous) =>
      previous.map((item) =>
        item.id === device.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    // Ghi lịch sử điều khiển LED
    onAction({
      id: Date.now(),
      deviceId: device.id,
      deviceName: device.name,
      action: nextStatus ? "ON" : "OFF",
      status: "Success",
      timestamp: Date.now(),
    });

    setPendingId(null);
  }

  return (
    <section className="device-panel">
      <h2>Device Controls</h2>

      <div className="device-list">
        {devices.map((device) => {
          const pending = pendingId === device.id;

          return (
            <div className="device-row" key={device.id}>
              <div
                className={`device-icon ${
                  device.status ? "enabled" : ""
                }`}
              >
                <Lightbulb size={25} />
              </div>

              <div className="device-info">
                <strong>{device.name}</strong>

                <span>
                  Status:{" "}
                  {pending
                    ? "PENDING"
                    : device.status
                    ? "ON"
                    : "OFF"}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={device.status}
                aria-label={`Toggle ${device.name}`}
                className={`device-switch ${
                  device.status ? "on" : ""
                }`}
                disabled={pendingId !== null}
                onClick={() => handleToggle(device)}
              >
                <span />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
