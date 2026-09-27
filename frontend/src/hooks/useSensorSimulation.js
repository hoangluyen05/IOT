
import { useEffect, useState } from "react";
import { initialSensor } from "../services/mockData";

const INTERVAL = 2000;
const MAX_CHART_POINTS = 30;
const MAX_RECORDS = 300;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function generateSensor(previous) {
  return {
    temperature: Number(
      clamp(
        previous.temperature + random(-0.5, 0.5),
        20,
        40
      ).toFixed(1)
    ),

    humidity: Number(
      clamp(
        previous.humidity + random(-1.5, 1.5),
        30,
        90
      ).toFixed(1)
    ),

    light: Number(
      clamp(
        previous.light + random(-30, 30),
        0,
        1200
      ).toFixed(1)
    ),
  };
}

function createRecord(sensor, timestamp) {
  return {
    ...sensor,
    timestamp,
    time: new Date(timestamp).toLocaleTimeString("vi-VN"),
  };
}

export default function useSensorSimulation() {
  const [state, setState] = useState(() => {
    const first = createRecord(initialSensor, Date.now());

    return {
      sensor: initialSensor,
      history: [first],
      records: [first],
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setState((previous) => {
        const sensor = generateSensor(previous.sensor);

        const record = createRecord(sensor, Date.now());

        return {
          sensor,

          history: [
            ...previous.history,
            record,
          ].slice(-MAX_CHART_POINTS),

          records: [
            record,
            ...previous.records,
          ].slice(0, MAX_RECORDS),
        };
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return state;
}
