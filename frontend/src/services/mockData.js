
export const initialSensor = {
  temperature: 24,
  humidity: 60,
  light: 800,
};

export const sensorConfig = {
  temperature: {
    name: "Temperature",
    shortName: "Temp",
    unit: "°C",
    min: 20,
    max: 40,
    optimalMin: 22,
    optimalMax: 26,
    color: "#1048c5",
  },

  humidity: {
    name: "Humidity",
    shortName: "Hum",
    unit: "%",
    min: 30,
    max: 90,
    optimalMin: 40,
    optimalMax: 60,
    color: "#64748b",
  },

  light: {
    name: "Light",
    shortName: "Light",
    unit: "lux",
    min: 0,
    max: 1200,
    optimalMin: 500,
    optimalMax: 1000,
    color: "#e11d48",
  },
};


export const initialDevices = [
  {
    id: 1,
    name: "LED 1",
    status: false,
    icon: "led",
  },
  {
    id: 2,
    name: "LED 2",
    status: false,
    icon: "led",
  },
  {
    id: 3,
    name: "LED 3",
    status: false,
    icon: "led",
  },
];


export const profile = {
  name: "Hoàng Thị Luyến",
  studentId: "B23DCCN521",
  major: "IoT",
  email: "hoangluyen23072005k@gmail.com",
  location: "Hanoi, Vietnam",
  university: "Posts and Telecommunications Institute of Technology",
  avatar: "/avatar.jpg",
};

export const resources = [
  {
    title: "System Documentation",
    description: "Complete guide for Smart Classroom IoT system",
    type: "PDF",
    url: "https://docs.google.com/document/d/1VUKSj1f0Vqt-nQVt-ow8VfzH_alAfCBrM7LRehQNc9g/edit?tab=t.0",
  },
  {
    title: "API Reference",
    description: "REST API endpoints and integration guide",
    type: "API",
    url: "",
  },
  {
    title: "GitHub Repository",
    description: "Source code and project files",
    type: "CODE",
    url: "",
  },
  {
    title: "Figma Design",
    description: "UI/UX design files",
    type: "DESIGN",
    url: "https://www.figma.com/design/i9QJa8Q6yaPjEO4okE6k0c/IOT?node-id=1-5",
  },
];
