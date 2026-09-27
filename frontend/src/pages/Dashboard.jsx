
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
  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

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

      <div className="dashboard-bottom">
        <SensorChart data={history} />

        <DeviceControl
          devices={devices}
          setDevices={setDevices}
          onAction={onAction}
        />
      </div>
    </div>
  );
}
