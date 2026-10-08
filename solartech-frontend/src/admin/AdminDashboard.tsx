import type { CSSProperties } from "react";
import AdminLayout from "./AdminLayout";





function Icon({
                  type,
              }: {
    type:
        | "orders"
        | "clients"
        | "products"
        | "sales"
        | "stock"
        | "systems";
}) {
    const common = {
        width: 22,
        height: 22,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    if (type === "orders") {
        return (
            <svg {...common}>
                <path d="M6 7h12l1 13H5L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
        );
    }

    if (type === "clients") {
        return (
            <svg {...common}>
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 20c.5-4 2.5-6 5.5-6s5 2 5.5 6" />
                <path d="M15 6.5a2.5 2.5 0 0 1 0 5" />
                <path d="M16 14c2.5.2 4 2 4.5 4.5" />
            </svg>
        );
    }

    if (type === "products") {
        return (
            <svg {...common}>
                <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                <path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" />
            </svg>
        );
    }

    if (type === "sales") {
        return (
            <svg {...common}>
                <path d="M4 19V9M10 19V5M16 19v-8M22 19V3" />
                <path d="m3 6 5-2 5 3 7-5" />
            </svg>
        );
    }

    if (type === "stock") {
        return (
            <svg {...common}>
                <path d="M4 8h16v12H4z" />
                <path d="M7 8V5h10v3M8 13h8" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
        </svg>
    );
}

function Trend({
                   points,
                   className = "",
               }: {
    points: string;
    className?: string;
}) {
    return (
        <svg
            className={`st-trend ${className}`}
            viewBox="0 0 120 42"
            preserveAspectRatio="none"
        >
            <path
                d={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function AdminDashboard() {
    const navigate = (page: string) => {
        const routes: Record<string, string> = {
            dashboard: "/admin",
            orders: "/admin/orders",
            customers: "/admin/customers",
            inventory: "/admin/inventory",
            products: "/admin/products",
            equipmentTypes: "/admin/equipment-types",
            packages: "/admin/packages",
        };

        const route = routes[page];
        if (route) {
            window.location.href = route;
        }
    };

    const today = new Date();
    const dateText = today.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const weekday = today.toLocaleDateString("ru-RU", {
        weekday: "long",
    });

    return (
        <AdminLayout
            activePage="dashboard"
            onNavigate={navigate}
        >
            <div className="st-dashboard">
                <style>{`
                    .st-dashboard {
                        --st-green: #4f9d3b;
                        --st-green-dark: #2e6f2d;
                        --st-green-soft: #eef8ea;
                        --st-text: #172019;
                        --st-muted: #7b857d;
                        --st-border: #e8ede7;
                        --st-card: #ffffff;
                        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
                        color: var(--st-text);
                        min-height: 100%;
                        padding: 8px 4px 36px;
                    }

                    .st-dashboard * {
                        box-sizing: border-box;
                    }

                    .st-hero {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        gap: 24px;
                        margin-bottom: 24px;
                    }

                    .st-eyebrow {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        color: var(--st-green);
                        font-size: 11px;
                        font-weight: 800;
                        letter-spacing: 1.7px;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                    }

                    .st-eyebrow-dot {
                        width: 7px;
                        height: 7px;
                        border-radius: 50%;
                        background: var(--st-green);
                        box-shadow: 0 0 0 5px #edf7e9;
                    }

                    .st-hero h1 {
                        margin: 0;
                        font-size: clamp(25px, 3vw, 34px);
                        line-height: 1.12;
                        letter-spacing: -1.1px;
                        font-weight: 800;
                    }

                    .st-hero p {
                        margin: 8px 0 0;
                        color: var(--st-muted);
                        font-size: 14px;
                    }

                    .st-date {
                        min-width: 190px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 13px 15px;
                        border: 1px solid var(--st-border);
                        background: #fff;
                        border-radius: 16px;
                        box-shadow: 0 7px 24px rgba(24, 52, 27, .05);
                    }

                    .st-date-icon {
                        width: 38px;
                        height: 38px;
                        border-radius: 11px;
                        display: grid;
                        place-items: center;
                        background: var(--st-green-soft);
                        color: var(--st-green-dark);
                    }

                    .st-date-icon svg {
                        width: 19px;
                        height: 19px;
                    }

                    .st-date strong {
                        display: block;
                        font-size: 13px;
                        line-height: 1.3;
                        text-transform: capitalize;
                    }

                    .st-date span {
                        display: block;
                        color: var(--st-muted);
                        font-size: 11px;
                        margin-top: 3px;
                        text-transform: capitalize;
                    }

                    .st-stats {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 14px;
                        margin-bottom: 18px;
                    }

                    .st-stat {
                        position: relative;
                        overflow: hidden;
                        min-height: 146px;
                        background: var(--st-card);
                        border: 1px solid var(--st-border);
                        border-radius: 19px;
                        padding: 19px;
                        box-shadow: 0 8px 26px rgba(22, 46, 25, .045);
                    }

                    .st-stat::after {
                        content: "";
                        position: absolute;
                        width: 110px;
                        height: 110px;
                        right: -52px;
                        top: -54px;
                        border-radius: 50%;
                        background: var(--st-soft);
                    }

                    .st-stat-top {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        position: relative;
                        z-index: 1;
                    }

                    .st-icon {
                        width: 42px;
                        height: 42px;
                        border-radius: 13px;
                        display: grid;
                        place-items: center;
                    }

                    .st-stat.green .st-icon {
                        color: #4c963d;
                        background: #e9f6e5;
                    }

                    .st-stat.blue .st-icon {
                        color: #4d81c5;
                        background: #eaf2fb;
                    }

                    .st-stat.orange .st-icon {
                        color: #c78337;
                        background: #fff3e4;
                    }

                    .st-stat.purple .st-icon {
                        color: #8a61b7;
                        background: #f2ebfa;
                    }

                    .st-stat-label {
                        color: var(--st-muted);
                        font-size: 12px;
                        font-weight: 600;
                    }

                    .st-stat-value {
                        margin-top: 5px;
                        font-size: 27px;
                        line-height: 1;
                        letter-spacing: -.8px;
                        font-weight: 800;
                    }

                    .st-stat-change {
                        margin-top: 9px;
                        font-size: 11px;
                        color: var(--st-muted);
                    }

                    .st-stat-change b {
                        color: var(--st-green);
                        font-weight: 800;
                    }

                    .st-stat-value {
                        color: var(--st-text);
                    }

                    .st-trend {
                        position: absolute;
                        width: 112px;
                        height: 42px;
                        right: 14px;
                        bottom: 14px;
                        opacity: .85;
                    }

                    .st-stat.green .st-trend { color: #4f9d3b; }
                    .st-stat.blue .st-trend { color: #4d81c5; }
                    .st-stat.orange .st-trend { color: #d18a3e; }
                    .st-stat.purple .st-trend { color: #8a61b7; }

                    .st-main-grid {
                        display: grid;
                        grid-template-columns: minmax(0, 1.28fr) minmax(340px, .72fr);
                        gap: 18px;
                        margin-bottom: 18px;
                    }

                    .st-card {
                        background: #fff;
                        border: 1px solid var(--st-border);
                        border-radius: 20px;
                        box-shadow: 0 8px 26px rgba(22, 46, 25, .045);
                    }

                    .st-card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 12px;
                        padding: 20px 21px 15px;
                    }

                    .st-card-header h2 {
                        margin: 0;
                        font-size: 17px;
                        letter-spacing: -.3px;
                    }

                    .st-card-header p {
                        margin: 4px 0 0;
                        color: var(--st-muted);
                        font-size: 11px;
                    }

                    .st-link {
                        border: 0;
                        background: transparent;
                        color: var(--st-green-dark);
                        font-size: 12px;
                        font-weight: 800;
                        cursor: pointer;
                        white-space: nowrap;
                    }

                    .st-link:hover {
                        text-decoration: underline;
                    }

                    .st-orders {
                        overflow: hidden;
                    }

                    .st-order-head,
                    .st-order {
                        display: grid;
                        grid-template-columns: 72px 1.15fr 1fr 105px 112px;
                        align-items: center;
                        gap: 12px;
                    }

                    .st-order-head {
                        padding: 10px 21px;
                        background: #fafcf9;
                        border-top: 1px solid #f0f3ef;
                        border-bottom: 1px solid #f0f3ef;
                        color: #9aa29b;
                        font-size: 9px;
                        font-weight: 800;
                        letter-spacing: 1px;
                    }

                    .st-order {
                        padding: 14px 21px;
                        border-bottom: 1px solid #f0f3ef;
                    }

                    .st-order:last-child {
                        border-bottom: 0;
                    }

                    .st-order-id strong,
                    .st-order-customer strong,
                    .st-order-system strong {
                        display: block;
                        font-size: 12px;
                    }

                    .st-order-id span,
                    .st-order-customer span,
                    .st-order-system span {
                        display: block;
                        color: var(--st-muted);
                        font-size: 10px;
                        margin-top: 4px;
                    }

                    .st-order-id strong {
                        color: var(--st-green-dark);
                    }

                    .st-status {
                        display: inline-flex;
                        justify-content: center;
                        align-items: center;
                        padding: 6px 9px;
                        border-radius: 999px;
                        font-size: 8px;
                        font-weight: 900;
                        letter-spacing: .35px;
                        white-space: nowrap;
                    }

                    .st-status.new {
                        color: #2f8a43;
                        background: #e9f7eb;
                    }

                    .st-status.confirmed {
                        color: #4773b4;
                        background: #edf3fc;
                    }

                    .st-status.progress {
                        color: #ad762f;
                        background: #fff4df;
                    }

                    .st-status.completed {
                        color: #727c74;
                        background: #f0f3f0;
                    }

                    .st-order-price {
                        text-align: right;
                        font-size: 12px;
                        font-weight: 800;
                        white-space: nowrap;
                    }

                    .st-empty {
                        min-height: 230px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        padding: 28px 20px;
                        color: var(--st-muted);
                    }

                    .st-empty-icon,
                    .st-empty-chart-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 14px;
                        display: grid;
                        place-items: center;
                        color: #7c8a7d;
                        background: #f3f6f2;
                        margin-bottom: 10px;
                    }

                    .st-empty strong,
                    .st-empty-chart strong {
                        color: #4f5b51;
                        font-size: 13px;
                    }

                    .st-empty span,
                    .st-empty-chart span {
                        max-width: 270px;
                        margin-top: 5px;
                        font-size: 10px;
                        line-height: 1.5;
                    }

                    .st-orders-footer {
                        padding: 13px 21px;
                        background: #fcfdfb;
                        border-top: 1px solid #f0f3ef;
                        text-align: center;
                    }

                    .st-orders-footer button {
                        border: 0;
                        background: transparent;
                        color: var(--st-green-dark);
                        font-size: 11px;
                        font-weight: 800;
                        cursor: pointer;
                    }

                    .st-sales {
                        padding-bottom: 15px;
                    }

                    .st-sales-meta {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        padding: 0 21px 8px;
                    }

                    .st-sales-total strong {
                        display: block;
                        font-size: 25px;
                        letter-spacing: -.8px;
                    }

                    .st-sales-total span {
                        display: block;
                        color: var(--st-muted);
                        font-size: 10px;
                        margin-top: 3px;
                    }

                    .st-period {
                        border: 1px solid var(--st-border);
                        background: #fff;
                        color: #68736b;
                        border-radius: 9px;
                        padding: 7px 10px;
                        font-size: 10px;
                        font-weight: 700;
                    }

                    .st-chart {
                        position: relative;
                        height: 220px;
                        margin: 2px 14px 0;
                        overflow: hidden;
                    }

                    .st-chart-grid {
                        position: absolute;
                        inset: 15px 8px 31px 8px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .st-chart-grid span {
                        border-top: 1px dashed #e9eee8;
                        width: 100%;
                    }

                    .st-chart svg {
                        position: absolute;
                        left: 6px;
                        right: 6px;
                        top: 10px;
                        width: calc(100% - 12px);
                        height: 170px;
                    }

                    .st-chart-days {
                        position: absolute;
                        left: 8px;
                        right: 8px;
                        bottom: 5px;
                        display: flex;
                        justify-content: space-between;
                        color: #a1a9a2;
                        font-size: 9px;
                        font-weight: 700;
                    }

                    .st-empty-chart {
                        height: 190px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        color: var(--st-muted);
                        border-top: 1px dashed #edf0ec;
                        margin: 8px 21px 0;
                    }

                    .st-bottom {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 18px;
                    }

                    .st-quick {
                        padding: 19px;
                    }

                    .st-quick h2 {
                        margin: 0 0 14px;
                        font-size: 17px;
                    }

                    .st-quick-grid {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 12px;
                    }

                    .st-quick-card {
                        border: 1px solid var(--st-border);
                        background: #fff;
                        border-radius: 15px;
                        min-height: 86px;
                        padding: 13px;
                        display: flex;
                        align-items: center;
                        gap: 11px;
                        text-align: left;
                        cursor: pointer;
                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
                    }

                    .st-quick-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 9px 22px rgba(28, 60, 30, .08);
                        border-color: #d8e6d4;
                    }

                    .st-quick-icon {
                        width: 40px;
                        height: 40px;
                        flex: 0 0 40px;
                        border-radius: 12px;
                        display: grid;
                        place-items: center;
                    }

                    .st-quick-card.green .st-quick-icon {
                        color: #4b963d;
                        background: #e9f6e5;
                    }

                    .st-quick-card.blue .st-quick-icon {
                        color: #4d81c5;
                        background: #eaf2fb;
                    }

                    .st-quick-card.orange .st-quick-icon {
                        color: #c78337;
                        background: #fff3e4;
                    }

                    .st-quick-card.purple .st-quick-icon {
                        color: #8a61b7;
                        background: #f2ebfa;
                    }

                    .st-quick-card div {
                        min-width: 0;
                    }

                    .st-quick-card strong {
                        display: block;
                        font-size: 11px;
                    }

                    .st-quick-card small {
                        display: block;
                        color: var(--st-muted);
                        font-size: 9px;
                        margin-top: 4px;
                    }

                    .st-quick-arrow {
                        margin-left: auto;
                        color: #a1aaa3;
                        font-size: 16px;
                    }

                    @media (max-width: 1050px) {
                        .st-stats {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }

                        .st-main-grid {
                            grid-template-columns: 1fr;
                        }

                        .st-quick-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                    }

                    @media (max-width: 700px) {
                        .st-dashboard {
                            padding: 2px 0 28px;
                        }

                        .st-hero {
                            align-items: flex-start;
                            flex-direction: column;
                            margin-bottom: 18px;
                        }

                        .st-date {
                            width: 100%;
                        }

                        .st-stats {
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                        }

                        .st-stat {
                            min-height: 125px;
                            padding: 14px;
                            border-radius: 15px;
                        }

                        .st-stat-value {
                            font-size: 21px;
                        }

                        .st-trend {
                            width: 82px;
                            bottom: 9px;
                            right: 9px;
                        }

                        .st-order-head {
                            display: none;
                        }

                        .st-order {
                            grid-template-columns: 54px 1fr auto;
                            gap: 9px;
                            padding: 13px 14px;
                        }

                        .st-order-system {
                            grid-column: 2 / 3;
                        }

                        .st-order .st-status {
                            grid-column: 3 / 4;
                            grid-row: 1;
                        }

                        .st-order-price {
                            grid-column: 2 / 4;
                            text-align: left;
                            margin-top: -2px;
                        }

                        .st-card-header {
                            padding: 17px 14px 13px;
                        }

                        .st-sales-meta {
                            padding: 0 14px 6px;
                        }

                        .st-chart {
                            height: 190px;
                        }

                        .st-quick {
                            padding: 15px;
                        }

                        .st-quick-grid {
                            grid-template-columns: 1fr 1fr;
                        }
                    }

                    @media (max-width: 430px) {
                        .st-stats {
                            grid-template-columns: 1fr;
                        }

                        .st-stat {
                            min-height: 116px;
                        }

                        .st-quick-grid {
                            grid-template-columns: 1fr;
                        }

                        .st-order-customer span {
                            font-size: 9px;
                        }
                    }
                `}</style>

                <div className="st-hero">
                    <div>
                        <div className="st-eyebrow">
                            <span className="st-eyebrow-dot" />
                            SOLARTECH ENERGY / ADMIN
                        </div>
                        <h1>Добро пожаловать, Admin 👋</h1>
                        <p>Краткий обзор бизнеса и текущих показателей.</p>
                    </div>

                    <div className="st-date">
                        <div className="st-date-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                <rect x="3" y="5" width="18" height="16" rx="2" />
                                <path d="M7 3v4M17 3v4M3 10h18" />
                            </svg>
                        </div>
                        <div>
                            <strong>{dateText}</strong>
                            <span>{weekday}</span>
                        </div>
                    </div>
                </div>

                <div className="st-stats">
                    <div className="st-stat green" style={{ "--st-soft": "#edf8e9" } as CSSProperties}>
                        <div className="st-stat-top">
                            <div>
                                <div className="st-stat-label">Заказы</div>
                                <div className="st-stat-value">0</div>
                                <div className="st-stat-change">Нет данных</div>
                            </div>
                            <div className="st-icon"><Icon type="orders" /></div>
                        </div>
                        <Trend points="M2 34 C17 31 18 19 33 23 C46 27 51 13 64 20 C77 27 84 34 96 24 C106 16 113 12 118 4" />
                    </div>

                    <div className="st-stat blue" style={{ "--st-soft": "#edf4fc" } as CSSProperties}>
                        <div className="st-stat-top">
                            <div>
                                <div className="st-stat-label">Клиенты</div>
                                <div className="st-stat-value">0</div>
                                <div className="st-stat-change">Нет данных</div>
                            </div>
                            <div className="st-icon"><Icon type="clients" /></div>
                        </div>
                        <Trend points="M2 34 C15 31 21 23 34 26 C47 29 53 13 66 21 C78 29 87 32 98 21 C108 12 113 15 118 5" />
                    </div>

                    <div className="st-stat orange" style={{ "--st-soft": "#fff5e8" } as CSSProperties}>
                        <div className="st-stat-top">
                            <div>
                                <div className="st-stat-label">Товары</div>
                                <div className="st-stat-value">0</div>
                                <div className="st-stat-change">Нет данных</div>
                            </div>
                            <div className="st-icon"><Icon type="products" /></div>
                        </div>
                        <Trend points="M2 35 C15 29 20 17 34 18 C48 19 54 28 67 31 C80 34 87 19 98 23 C108 27 114 13 118 7" />
                    </div>

                    <div className="st-stat purple" style={{ "--st-soft": "#f5eefb" } as CSSProperties}>
                        <div className="st-stat-top">
                            <div>
                                <div className="st-stat-label">Продажи</div>
                                <div className="st-stat-value">0</div>
                                <div className="st-stat-change">Нет данных</div>
                            </div>
                            <div className="st-icon"><Icon type="sales" /></div>
                        </div>
                        <Trend points="M2 35 C17 32 21 18 35 23 C48 28 54 31 67 23 C80 15 86 25 98 18 C109 12 114 10 118 3" />
                    </div>
                </div>

                <div className="st-main-grid">
                    <section className="st-card st-orders">
                        <div className="st-card-header">
                            <div>
                                <h2>Последние заказы</h2>
                                <p>Заявки клиентов и их текущий статус</p>
                            </div>
                            <button className="st-link" onClick={() => navigate("orders")}>
                                Все заказы →
                            </button>
                        </div>

                        <div className="st-order-head">
                            <span>ЗАКАЗ</span>
                            <span>КЛИЕНТ</span>
                            <span>СИСТЕМА</span>
                            <span>СТАТУС</span>
                            <span>СУММА</span>
                        </div>

                        <div className="st-empty">
                            <div className="st-empty-icon">
                                <Icon type="orders" />
                            </div>
                            <strong>Заказов пока нет</strong>
                            <span>Здесь появятся реальные заявки клиентов.</span>
                        </div>

                        <div className="st-orders-footer">
                            <button onClick={() => navigate("orders")}>
                                Открыть управление заказами →
                            </button>
                        </div>
                    </section>

                    <section className="st-card st-sales">
                        <div className="st-card-header">
                            <div>
                                <h2>Продажи</h2>
                                <p>Динамика за последнюю неделю</p>
                            </div>
                            <div className="st-period">Неделя⌄</div>
                        </div>

                        <div className="st-sales-meta">
                            <div className="st-sales-total">
                                <strong>0 TJS</strong>
                                <span>Продажи появятся после первых заказов</span>
                            </div>
                        </div>

                        <div className="st-chart">
                            <div className="st-chart-grid">
                                <span /><span /><span /><span /><span />
                            </div>

                            <div className="st-empty-chart">
                                <div className="st-empty-chart-icon">
                                    <Icon type="sales" />
                                </div>
                                <strong>Нет данных о продажах</strong>
                                <span>График появится автоматически после первых продаж.</span>
                            </div>

                            <div className="st-chart-days">
                                <span>Пн</span>
                                <span>Вт</span>
                                <span>Ср</span>
                                <span>Чт</span>
                                <span>Пт</span>
                                <span>Сб</span>
                                <span>Вс</span>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="st-card st-quick">
                    <h2>Быстрые действия</h2>

                    <div className="st-quick-grid">
                        <button className="st-quick-card green" onClick={() => navigate("orders")}>
                            <span className="st-quick-icon"><Icon type="orders" /></span>
                            <div>
                                <strong>Заказы</strong>
                                <small>Управление заявками</small>
                            </div>
                            <span className="st-quick-arrow">→</span>
                        </button>

                        <button className="st-quick-card blue" onClick={() => navigate("customers")}>
                            <span className="st-quick-icon"><Icon type="clients" /></span>
                            <div>
                                <strong>Клиенты</strong>
                                <small>Список клиентов</small>
                            </div>
                            <span className="st-quick-arrow">→</span>
                        </button>

                        <button className="st-quick-card orange" onClick={() => navigate("inventory")}>
                            <span className="st-quick-icon"><Icon type="stock" /></span>
                            <div>
                                <strong>Склад</strong>
                                <small>Остатки товаров</small>
                            </div>
                            <span className="st-quick-arrow">→</span>
                        </button>

                        <button className="st-quick-card purple" onClick={() => navigate("packages")}>
                            <span className="st-quick-icon"><Icon type="systems" /></span>
                            <div>
                                <strong>Системы SolarTech</strong>
                                <small>Пакеты и комплектации</small>
                            </div>
                            <span className="st-quick-arrow">→</span>
                        </button>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;
