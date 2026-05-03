import { NavLink } from "react-router-dom";

export default function Sidebar({ title = "SpeedyShip", items = [] }) {
  return (
    <aside className="bg-blue-700 text-white min-h-screen w-64 p-5">
      <h1 className="text-2xl font-bold mb-6">🚚 {title}</h1>
      <nav className="space-y-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded transition ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            <span className="mr-2">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
