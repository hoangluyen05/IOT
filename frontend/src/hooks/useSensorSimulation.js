// Hook mô phỏng dữ liệu cảm biến mỗi 2 giây
import { useEffect, useState } from "react";
import { initialSensor } from "../services/mockData";

const INTERVAL = 2000;
const MAX_CHART_POINTS = 30;
const MAX_RECORDS = 300;
// Hàm sinh số ngẫu nhiên trong khoảng [min, max)
function random(min, max) {
  return Math.random() * (max - min) + min;
}
// Hàm giới hạn giá trị trong khoảng [min, max] => Hàm này đảm bảo giá trị không vượt ra ngoài khoảng quy định.
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
// Hàm sinh dữ liệu cảm biến mới dựa trên dữ liệu trước đó
function generateSensor(previous) {
  return {
    temperature: Number(
      clamp(
        previous.temperature + random(-0.5, 0.5), // Giới hạn nhiệt độ trong khoảng 20-40 độ C
        20,
        40
      ).toFixed(1)
    ),

    humidity: Number(
      clamp(
        previous.humidity + random(-1.5, 1.5), // Giới hạn độ ẩm trong khoảng 30-90%
        30,
        90
      ).toFixed(1)
    ),

    light: Number(
      clamp(
        previous.light + random(-30, 30), // Giới hạn ánh sáng trong khoảng 0-1200
        0,
        1200
      ).toFixed(1)
    ),
  };
}

// Hàm tạo bản ghi lịch sử cảm biến
function createRecord(sensor, timestamp) {
  return {
    ...sensor,
    timestamp,
    time: new Date(timestamp).toLocaleTimeString("vi-VN"),
  };
}
// Hook chính mô phỏng dữ liệu cảm biến
export default function useSensorSimulation() {
  const [state, setState] = useState(() => {
    const first = createRecord(initialSensor, Date.now());
    // Khởi tạo trạng thái ban đầu
    return {
      sensor: initialSensor,
      history: [first],
      records: [first],
    };
  });
// vòng lặp 2s
  useEffect(() => {
    const timer = setInterval(() => { // lặp lại một lần mỗi 2 giây
      setState((previous) => {
        const sensor = generateSensor(previous.sensor); // Sinh dữ liệu cảm biến mới

        const record = createRecord(sensor, Date.now()); // Tạo bản ghi lịch sử cảm biến

        return {
          sensor,

          history: [
            ...previous.history,
            record,
          ].slice(-MAX_CHART_POINTS), // Giới hạn số điểm trong lịch sử cảm biến

          records: [
            record,
            ...previous.records,
          ].slice(0, MAX_RECORDS), // Giới hạn số bản ghi trong lịch sử cảm biến
        };
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return state;
}
