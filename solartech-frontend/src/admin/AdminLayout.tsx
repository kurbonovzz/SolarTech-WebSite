import type { ReactNode } from "react";
import "./Admin.css";

type AdminLayoutProps = {
    children: ReactNode;
    activePage: string;
    onNavigate?: (page: string) => void;
};

const menu = [
    ["dashboard", "⌂", "Dashboard", "/admin"],
    ["orders", "▣", "Заказы", "/admin/orders"],
    ["customers", "♟", "Клиенты", "/admin/customers"],
    ["inventory", "▤", "Склад", "/admin/inventory"],
    ["products", "▦", "Товары", "/admin/products"],
    [
        "equipment-types",
        "◇",
        "Типы техники",
        "/admin/equipment-types",
    ],
    ["packages", "☼", "Системы", "/admin/packages"],
];

export default function AdminLayout({
                                        children,
                                        activePage,
                                    }: AdminLayoutProps) {
    const logout = () => {
        localStorage.removeItem(
            "solartech_admin_token",
        );

        window.location.href = "/admin/login";
    };

    const navigate = (path: string) => {
        window.location.href = path;
    };

    return (
        <div className="solar-admin">
            {/* ================= SIDEBAR ================= */}

            <aside className="solar-sidebar">
                <div className="solar-logo">
                    <span className="solar-logo-sun">
                        ☀
                    </span>

                    <div>
                        <div className="solar-logo-text">
                            Solar<span>Tech</span>
                        </div>

                        <div className="solar-logo-sub">
                            ADMIN PANEL
                        </div>
                    </div>
                </div>

                <nav className="solar-nav">
                    {menu.map(
                        ([id, icon, title, path]) => (
                            <button
                                key={id}
                                type="button"
                                className={`solar-nav-item ${
                                    activePage === id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    navigate(path)
                                }
                            >
                                <span className="solar-nav-icon">
                                    {icon}
                                </span>

                                <span>{title}</span>
                            </button>
                        ),
                    )}
                </nav>

                {/* ================= SIDEBAR BOTTOM ================= */}

                <div className="solar-sidebar-bottom">
                    <div className="solar-house">
                        <div className="solar-house-sun">
                            ☼
                        </div>

                        <div className="solar-house-panel">
                            ◢
                        </div>

                        <div className="solar-house-body">
                            <span />
                            <span />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="solar-logout"
                        onClick={logout}
                    >
                        ⇥
                        <span>Выйти</span>
                    </button>

                    <div className="solar-footer">
                        <strong>
                            SolarTech Energy
                        </strong>

                        <span>Admin v1.0</span>
                    </div>
                </div>
            </aside>

            {/* ================= MAIN ================= */}

            <section className="solar-main">
                <header className="solar-header">
                    <button
                        type="button"
                        className="solar-menu-button"
                    >
                        ☰
                    </button>

                    <div className="solar-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Поиск по системе..."
                        />
                    </div>

                    <div className="solar-header-right">
                        <button
                            type="button"
                            className="solar-notification"
                        >
                            ♧
                            <b>3</b>
                        </button>

                        <div className="solar-profile">
                            <div className="solar-avatar">
                                A
                            </div>

                            <div>
                                <strong>Admin</strong>

                                <span>
                                    Администратор
                                </span>
                            </div>

                            <span className="solar-chevron">
                                ⌄
                            </span>
                        </div>
                    </div>
                </header>

                {/* ================= CONTENT ================= */}

                <main className="solar-content">
                    {children}
                </main>
            </section>
        </div>
    );
}