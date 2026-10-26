"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ProtectedLayout from "@/components/ProtectedLayout";
import SettingsSidebar from "./components/Sidebar";
import AccountNavbar from "./components/AccountNavbar";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  const isAccountPage = pathname === "/settings" || pathname === "/settings/";
  const showFloatingMenuButton = !isAccountPage;

  useEffect(() => {
    const handleMobileSidebarToggle = () => {
      setMobileSidebarOpen((prev) => !prev);
    };
    const handleMobileSidebarClose = () => {
      setMobileSidebarOpen(false);
    };

    window.addEventListener("settings:toggle-mobile-sidebar", handleMobileSidebarToggle);
    window.addEventListener("settings:close-mobile-sidebar", handleMobileSidebarClose);
    return () => {
      window.removeEventListener("settings:toggle-mobile-sidebar", handleMobileSidebarToggle);
      window.removeEventListener("settings:close-mobile-sidebar", handleMobileSidebarClose);
    };
  }, []);

  return (
    <ProtectedLayout>
      <div className="relative flex h-screen overflow-hidden bg-[var(--bg)] p-3 gap-3">
        {showFloatingMenuButton && (
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={mobileSidebarOpen ? "Close settings sidebar" : "Open settings sidebar"}
            className="sm:hidden fixed top-4 left-4 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] backdrop-blur-xl transition-colors hover:brightness-110"
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        <aside
          aria-label="Settings navigation"
          className={`
            hidden sm:flex shrink-0 h-full bg-transparent
            transition-all duration-300 ease-in-out
            ${desktopSidebarOpen ? "w-[272px]" : "w-[72px]"}
          `}
        >
          <SettingsSidebar
            isOpen={desktopSidebarOpen}
            showToggle={true}
            onToggle={() => setDesktopSidebarOpen((prev) => !prev)}
          />
        </aside>

        <aside
          aria-label="Settings mobile navigation"
          className={`
            fixed sm:hidden top-0 left-0 z-50 h-full w-64 p-2.5
            bg-transparent
            transform transition-transform duration-300 ease-in-out
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <SettingsSidebar isOpen={true} />
        </aside>

        {mobileSidebarOpen && (
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-40 sm:hidden bg-black/40 backdrop-blur-sm"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-xl">
          {/* Dashboard-style Fixed Navbar for Account Section */}
          {isAccountPage && (
            <header className="shrink-0 border-b border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-xl z-20">
              <AccountNavbar onToggleSidebar={toggleMobileSidebar} />
            </header>
          )}

          <main
            id="main-content"
            aria-label="Settings"
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide-lg flex flex-col"
          >
            <div className="w-full min-w-0 px-4 py-4 flex-1 min-h-0 flex flex-col h-full">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
