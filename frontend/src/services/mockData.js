// Dữ liệu cảm biến ban đầu
export const initialSensor = {
  temperature: 24,
  humidity: 60,
  light: 800,
};

// Cấu hình các cảm biến
export const sensorConfig = {
  temperature: {
    name: "Temperature",
    unit: "°C",
    optimalMin: 10,
    optimalMax: 40,
    max: 40,
  },

  humidity: {
    name: "Humidity",
    unit: "%",
    optimalMin: 30,
    optimalMax: 90,
    max: 100,
  },

  light: {
    name: "Light",
    unit: "lux",
    optimalMin: 500,
    optimalMax: 3000,
    max: 3000,
  },
};

// Danh sách thiết bị ban đầu
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

// Thông tin cá nhân
export const profile = {
  name: "Hoàng Thị Luyến",
  studentId: "B23DCCN521",
  major: "IoT",
  email: "hoangluyen23072005k@gmail.com",
  location: "Hanoi, Vietnam",
  university: "Posts and Telecommunications Institute of Technology",
  avatar: "avatar.jfif",
};

// Danh sách tài liệu và tài nguyên
export const resources = [
  {
    type: "PDF",
    title: "Project Documentation",
    description: "Smart Classroom IoT project documentation",
    url: "https://docs.google.com/document/d/1VUKSj1f0Vqt-nQVt-ow8VfzH_alAfCBrM7LRehQNc9g/edit?tab=t.0",
  },

  {
    type: "API",
    title: "API Documentation",
    description: "API documentation for Smart Classroom IoT",
    url: "https://docs.google.com/document/d/1VUKSj1f0Vqt-nQVt-ow8VfzH_alAfCBrM7LRehQNc9g/edit?tab=t.tpzyxv491fx0",
  },

  {
    type: "CODE",
    title: "Source Code",
    description: "Source code of Smart Classroom IoT project",
    url: "https://github.com/hoangluyen05/IOT",
  },

  {
    type: "DESIGN",
    title: "UI/UX Design",
    description: "Interface design for Smart Classroom IoT",
    url: "https://www.figma.com/design/i9QJa8Q6yaPjEO4okE6k0c/IOT?node-id=0-1&p=f&t=HGzKYD58hAf8SLvP-0",
  },
];