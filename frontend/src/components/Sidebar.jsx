import {
  GraduationCap,
  LayoutDashboard,
  Radio,
  History,
  UsersRound,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { profile } from "../services/mockData";

export default function Sidebar() {
  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/sensors",
      label: "Sensors",
      icon: Radio,
    },
    {
      path: "/history",
      label: "History",
      icon: History,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: UsersRound,
    },
  ];

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <GraduationCap size={27} />
        <span>Smart Class</span>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Thông tin người dùng */}
      <div className="sidebar-user">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="sidebar-user-avatar"
        />

        <div className="sidebar-user-info">
          <strong>{profile.name}</strong>
          <span>{profile.studentId}</span>
        </div>
      </div>

    </aside>
  );
}