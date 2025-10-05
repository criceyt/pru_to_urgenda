"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Settings</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link
              href="/home"
              className={`sidebar-link ${pathname === "/home" ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/provincias"
              className={`sidebar-link ${pathname === "/provincias" ? "active" : ""}`}
            >
              Health analysis
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
