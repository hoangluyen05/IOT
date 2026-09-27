
import { NavLink } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Radio,
  History,
  UsersRound,
} from "lucide-react";

const menus = [
  {
    path: "/",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/sensors",
    name: "Sensors",
    icon: Radio,
  },
  {
    path: "/history",
    name: "History",
    icon: History,
  },
  {
    path: "/profile",
    name: "Profile",
    icon: UsersRound,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <GraduationCap size={32} strokeWidth={2.4} />
        <span>Smart Class</span>
      </div>

      <nav className="sidebar-menu">
        {menus.map(({ path, name, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={21} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
