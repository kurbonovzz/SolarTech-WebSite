import { useEffect, useState } from "react";

type Customer = {
    id: number;
    name: string;
    phone: string;
    created_at: string;
};

type Order = {
    id: number;
    customer_id: number;
    system_package_id: number;
    total_price: number;
    comment: string;
    status: string;
    created_at: string;
    updated_at: string;
};

type SystemPackage = {
    id: number;
    name: string;
    system_power_kw: number;
    description: string;
    total_price: number;
    is_active: boolean;
};

type PackageItem = {
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

type OrderDetailsResponse = {
    customer: Customer;
    order: Order;
    system_package: SystemPackage | null;
    package_items: PackageItem[];
};

type OrdersResponse = {
    orders: Order[];
};

const API_URL = (() => {
    const configured = (import.meta.env.VITE_API_URL || "").trim();

    if (configured) {
        try {
            const url = new URL(configured);

            if (
                (url.hostname === "localhost" ||
                    url.hostname === "127.0.0.1" ||
                    url.hostname === "::1") &&
                window.location.hostname !== "localhost" &&
                window.location.hostname !== "127.0.0.1" &&
                window.location.hostname !== "::1"
            ) {
                url.hostname = window.location.hostname;
            }

            const base = url.toString().replace(/\/$/, "");
            return base.endsWith("/api/v1")
                ? base
                : `${base}/api/v1`;
        } catch {
            // Используем адрес текущего устройства в локальной сети.
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);

    const [customers, setCustomers] = useState<
        Record<number, Customer>
    >({});

    const [packages, setPackages] = useState<
        Record<number, SystemPackage>
    >({});

    const [selectedOrder, setSelectedOrder] =
        useState<Order | null>(null);

    const [selectedDetails, setSelectedDetails] =
        useState<OrderDetailsResponse | null>(null);

    const [loading, setLoading] = useState(false);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const getToken = () => {
        return localStorage.getItem(
            "solartech_admin_token",
        );
    };

    const loadOrders = async () => {
        const token = getToken();

        if (!token) {
            window.location.href =
                "/admin/login";
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/orders`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );

                window.location.href =
                    "/admin/login";

                return;
            }

            const data: OrdersResponse | {
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(
                    "error" in data && data.error
                        ? data.error
                        : "Не удалось загрузить заказы.",
                );
            }

            const ordersData =
                data as OrdersResponse;

            const sortedOrders = [
                ...(ordersData.orders || []),
            ].sort((a, b) => a.id - b.id);

            setOrders(sortedOrders);

            await Promise.all([
                loadCustomers(
                    sortedOrders,
                    token,
                ),
                loadPackages(
                    sortedOrders,
                    token,
                ),
            ]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось загрузить заказы.",
            );
        } finally {
            setLoading(false);
        }
    };

    const loadCustomers = async (
        ordersList: Order[],
        token: string,
    ) => {
        const customerIDs = Array.from(
            new Set(
                ordersList.map(
                    (order) => order.customer_id,
                ),
            ),
        );

        const customerMap: Record<
            number,
            Customer
        > = {};

        await Promise.all(
            customerIDs.map(async (customerID) => {
                try {
                    const response = await fetch(
                        `${API_URL}/customers/${customerID}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    if (!response.ok) {
                        return;
                    }

                    const data = await response.json();

                    if (data.customer) {
                        customerMap[customerID] =
                            data.customer;
                    }
                } catch {
                    // Ничего не делаем.
                }
            }),
        );

        setCustomers(customerMap);
    };

    const loadPackages = async (
        ordersList: Order[],
        token: string,
    ) => {
        const packageIDs = Array.from(
            new Set(
                ordersList.map(
                    (order) =>
                        order.system_package_id,
                ),
            ),
        );

        const packageMap: Record<
            number,
            SystemPackage
        > = {};

        await Promise.all(
            packageIDs.map(async (packageID) => {
                try {
                    const response = await fetch(
                        `${API_URL}/system-packages/${packageID}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    if (!response.ok) {
                        return;
                    }

                    const data = await response.json();

                    if (data.system_package) {
                        packageMap[packageID] =
                            data.system_package;
                    }
                } catch {
                    // Ничего не делаем.
                }
            }),
        );

        setPackages(packageMap);
    };

    const openOrderDetails = async (
        order: Order,
    ) => {
        const token = getToken();

        if (!token) {
            window.location.href =
                "/admin/login";
            return;
        }

        setSelectedOrder(order);
        setSelectedDetails(null);
        setDetailsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/orders/${order.id}/details`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );

                window.location.href =
                    "/admin/login";

                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось получить детали заказа.",
                );
            }

            const details =
                data as OrderDetailsResponse;

            setSelectedDetails(details);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось получить детали заказа.",
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedOrder(null);
        setSelectedDetails(null);
    };

    const updateStatus = async (
        orderID: number,
        status: string,
    ) => {
        const token = getToken();

        if (!token) {
            window.location.href =
                "/admin/login";
            return;
        }

        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/orders/${orderID}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                    }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );

                window.location.href =
                    "/admin/login";

                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось изменить статус.",
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderID
                        ? {
                            ...order,
                            status,
                        }
                        : order,
                ),
            );

            setSelectedDetails(
                (current) =>
                    current
                        ? {
                            ...current,
                            order: {
                                ...current.order,
                                status,
                            },
                        }
                        : current,
            );

            setSuccess(
                `Статус заказа №${orderID} изменён на ${status}.`,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось изменить статус.",
            );
        }
    };

    const logout = () => {
        localStorage.removeItem(
            "solartech_admin_token",
        );

        window.location.href =
            "/admin/login";
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7f2",
                padding: "40px",
                boxSizing: "border-box",
                fontFamily:
                    "Arial, Helvetica, sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: "1250px",
                    margin: "0 auto",
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "32px",
                            }}
                        >
                            ☀️ SolarTech Admin
                        </h1>

                        <p
                            style={{
                                marginTop: "8px",
                                color: "#666",
                            }}
                        >
                            Управление заказами клиентов
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: "#222",
                            color: "#fff",
                        }}
                    >
                        Выйти
                    </button>
                </div>

                {/* MESSAGES */}

                {error && (
                    <div
                        style={{
                            background: "#ffe5e5",
                            color: "#c62828",
                            padding: "14px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            background: "#e7f7df",
                            color: "#3f7d20",
                            padding: "14px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        {success}
                    </div>
                )}

                {/* ORDERS */}

                <div
                    style={{
                        background: "#fff",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow:
                            "0 2px 10px rgba(0,0,0,0.06)",
                    }}
                >
                    <div
                        style={{
                            padding: "20px",
                            borderBottom:
                                "1px solid #eee",
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h2
                            style={{
                                margin: 0,
                            }}
                        >
                            Заказы ({orders.length})
                        </h2>

                        <button
                            onClick={loadOrders}
                            disabled={loading}
                            style={{
                                padding:
                                    "9px 16px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                background:
                                    "#6aa832",
                                color: "#fff",
                                fontWeight: 600,
                            }}
                        >
                            {loading
                                ? "Загрузка..."
                                : "Обновить"}
                        </button>
                    </div>

                    {orders.length === 0 ? (
                        <div
                            style={{
                                padding: "50px 20px",
                                textAlign:
                                    "center",
                                color: "#777",
                            }}
                        >
                            Заказов пока нет. Здесь появятся реальные заявки клиентов.
                        </div>
                    ) : (
                        <div
                            style={{
                                overflowX: "auto",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                }}
                            >
                                <thead>
                                <tr
                                    style={{
                                        background:
                                            "#f7f8f5",
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    <th
                                        style={cellStyle}
                                    >
                                        №
                                    </th>

                                    <th
                                        style={cellStyle}
                                    >
                                        Клиент
                                    </th>

                                    <th
                                        style={cellStyle}
                                    >
                                        Телефон
                                    </th>

                                    <th
                                        style={cellStyle}
                                    >
                                        Система
                                    </th>

                                    <th
                                        style={cellStyle}
                                    >
                                        Цена
                                    </th>

                                    <th
                                        style={cellStyle}
                                    >
                                        Статус
                                    </th>

                                    <th
                                        style={cellStyle}
                                    >
                                        Действие
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {orders.map(
                                    (
                                        order,
                                        index,
                                    ) => {
                                        const customer =
                                            customers[
                                                order.customer_id
                                                ];

                                        const systemPackage =
                                            packages[
                                                order
                                                    .system_package_id
                                                ];

                                        return (
                                            <tr
                                                key={
                                                    order.id
                                                }
                                            >
                                                {/* NUMBER */}

                                                <td
                                                    style={{
                                                        ...cellStyle,
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    {index + 1}
                                                </td>

                                                {/* CUSTOMER */}

                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {customer?.name ||
                                                        `Клиент #${order.customer_id}`}
                                                </td>

                                                {/* PHONE */}

                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {customer?.phone ||
                                                        "—"}
                                                </td>

                                                {/* SYSTEM */}

                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {systemPackage ? (
                                                        <div>
                                                            <strong>
                                                                {
                                                                    systemPackage.name
                                                                }
                                                            </strong>

                                                            <div
                                                                style={{
                                                                    color:
                                                                        "#777",
                                                                    fontSize:
                                                                        "12px",
                                                                    marginTop:
                                                                        "4px",
                                                                }}
                                                            >
                                                                {
                                                                    systemPackage.system_power_kw
                                                                }{" "}
                                                                kW
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        `Система #${order.system_package_id}`
                                                    )}
                                                </td>

                                                {/* PRICE */}

                                                <td
                                                    style={{
                                                        ...cellStyle,
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    {order.total_price.toLocaleString(
                                                        "ru-RU",
                                                    )}
                                                </td>

                                                {/* STATUS */}

                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                            <span
                                style={{
                                    display:
                                        "inline-block",
                                    padding:
                                        "6px 10px",
                                    borderRadius:
                                        "20px",
                                    background:
                                        getStatusBackground(
                                            order.status,
                                        ),
                                    fontWeight:
                                        600,
                                    fontSize:
                                        "13px",
                                }}
                            >
                              {
                                  order.status
                              }
                            </span>
                                                </td>

                                                {/* ACTION */}

                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            gap: "8px",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                openOrderDetails(
                                                                    order,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    "8px 12px",
                                                                border:
                                                                    "none",
                                                                borderRadius:
                                                                    "6px",
                                                                background:
                                                                    "#222",
                                                                color:
                                                                    "#fff",
                                                                cursor:
                                                                    "pointer",
                                                            }}
                                                        >
                                                            Подробнее
                                                        </button>

                                                        <select
                                                            value={
                                                                order.status
                                                            }
                                                            onChange={(
                                                                e,
                                                            ) =>
                                                                updateStatus(
                                                                    order.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    "8px",
                                                                border:
                                                                    "1px solid #ddd",
                                                                borderRadius:
                                                                    "6px",
                                                                cursor:
                                                                    "pointer",
                                                            }}
                                                        >
                                                            <option value="NEW">
                                                                NEW
                                                            </option>

                                                            <option value="CONFIRMED">
                                                                CONFIRMED
                                                            </option>

                                                            <option value="IN_PROGRESS">
                                                                IN_PROGRESS
                                                            </option>

                                                            <option value="COMPLETED">
                                                                COMPLETED
                                                            </option>

                                                            <option value="CANCELLED">
                                                                CANCELLED
                                                            </option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS MODAL */}

            {selectedOrder && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        padding: "20px",
                        zIndex: 1000,
                    }}
                    onClick={closeDetails}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "700px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#fff",
                            borderRadius:
                                "16px",
                            padding: "30px",
                            boxSizing:
                                "border-box",
                        }}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {detailsLoading ? (
                            <div
                                style={{
                                    padding:
                                        "50px",
                                    textAlign:
                                        "center",
                                    color: "#777",
                                }}
                            >
                                Загружаем детали заказа...
                            </div>
                        ) : selectedDetails ? (
                            <>
                                {/* MODAL HEADER */}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        marginBottom:
                                            "25px",
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: 0,
                                        }}
                                    >
                                        Заказ №
                                        {orders.findIndex(
                                            (item) =>
                                                item.id ===
                                                selectedOrder.id,
                                        ) + 1}
                                    </h2>

                                    <button
                                        onClick={
                                            closeDetails
                                        }
                                        style={{
                                            border:
                                                "none",
                                            background:
                                                "#eee",
                                            borderRadius:
                                                "50%",
                                            width:
                                                "35px",
                                            height:
                                                "35px",
                                            cursor:
                                                "pointer",
                                            fontSize:
                                                "18px",
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* CUSTOMER */}

                                <div
                                    style={
                                        detailSectionStyle
                                    }
                                >
                                    <h3>
                                        👤 Клиент
                                    </h3>

                                    <p>
                                        <strong>
                                            Имя:
                                        </strong>{" "}
                                        {
                                            selectedDetails
                                                .customer
                                                .name
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Телефон:
                                        </strong>{" "}
                                        {
                                            selectedDetails
                                                .customer
                                                .phone
                                        }
                                    </p>
                                </div>

                                {/* SYSTEM */}

                                <div
                                    style={
                                        detailSectionStyle
                                    }
                                >
                                    <h3>
                                        ☀️ Система
                                    </h3>

                                    {selectedDetails.system_package ? (
                                        <>
                                            <p>
                                                <strong>
                                                    Название:
                                                </strong>{" "}
                                                {
                                                    selectedDetails
                                                        .system_package
                                                        .name
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    Мощность:
                                                </strong>{" "}
                                                {
                                                    selectedDetails
                                                        .system_package
                                                        .system_power_kw
                                                }{" "}
                                                kW
                                            </p>

                                            <p>
                                                <strong>
                                                    Описание:
                                                </strong>{" "}
                                                {
                                                    selectedDetails
                                                        .system_package
                                                        .description ||
                                                    "—"
                                                }
                                            </p>
                                        </>
                                    ) : (
                                        <p>
                                            Системный пакет
                                            не найден.
                                        </p>
                                    )}
                                </div>

                                {/* PACKAGE ITEMS */}

                                <div
                                    style={
                                        detailSectionStyle
                                    }
                                >
                                    <h3>
                                        📦 Комплектация
                                    </h3>

                                    {selectedDetails
                                        .package_items
                                        .length === 0 ? (
                                        <p
                                            style={{
                                                color:
                                                    "#777",
                                            }}
                                        >
                                            Товаров в пакете
                                            нет.
                                        </p>
                                    ) : (
                                        <div>
                                            {selectedDetails.package_items.map(
                                                (item) => (
                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        style={{
                                                            padding:
                                                                "14px 0",
                                                            borderBottom:
                                                                "1px solid #ddd",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                gap:
                                                                    "20px",
                                                            }}
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </strong>

                                                                <div
                                                                    style={{
                                                                        color:
                                                                            "#777",
                                                                        fontSize:
                                                                            "13px",
                                                                        marginTop:
                                                                            "4px",
                                                                    }}
                                                                >
                                                                    {
                                                                        item.category
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    textAlign:
                                                                        "right",
                                                                }}
                                                            >
                                                                <strong>
                                                                    ×{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </strong>

                                                                <div
                                                                    style={{
                                                                        color:
                                                                            "#777",
                                                                        fontSize:
                                                                            "13px",
                                                                        marginTop:
                                                                            "4px",
                                                                    }}
                                                                >
                                                                    {item.total_price.toLocaleString(
                                                                        "ru-RU",
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* TOTAL */}

                                <div
                                    style={{
                                        padding:
                                            "20px",
                                        background:
                                            "#edf7e8",
                                        borderRadius:
                                            "10px",
                                        marginBottom:
                                            "15px",
                                    }}
                                >
                                    <div
                                        style={{
                                            color:
                                                "#666",
                                            marginBottom:
                                                "5px",
                                        }}
                                    >
                                        Общая стоимость
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "28px",
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {selectedDetails.order.total_price.toLocaleString(
                                            "ru-RU",
                                        )}
                                    </div>
                                </div>

                                {/* COMMENT */}

                                <div
                                    style={
                                        detailSectionStyle
                                    }
                                >
                                    <h3>
                                        📝 Комментарий
                                    </h3>

                                    <p>
                                        {
                                            selectedDetails
                                                .order
                                                .comment
                                        }
                                        {selectedDetails
                                                .order
                                                .comment ===
                                            "" &&
                                            "Комментарий отсутствует."}
                                    </p>
                                </div>

                                {/* STATUS */}

                                <div
                                    style={
                                        detailSectionStyle
                                    }
                                >
                                    <h3>
                                        📌 Статус
                                    </h3>

                                    <select
                                        value={
                                            selectedDetails
                                                .order
                                                .status
                                        }
                                        onChange={(e) =>
                                            updateStatus(
                                                selectedDetails
                                                    .order
                                                    .id,
                                                e.target.value,
                                            )
                                        }
                                        style={{
                                            width:
                                                "100%",
                                            padding:
                                                "12px",
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "8px",
                                            fontSize:
                                                "15px",
                                        }}
                                    >
                                        <option value="NEW">
                                            NEW
                                        </option>

                                        <option value="CONFIRMED">
                                            CONFIRMED
                                        </option>

                                        <option value="IN_PROGRESS">
                                            IN_PROGRESS
                                        </option>

                                        <option value="COMPLETED">
                                            COMPLETED
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELLED
                                        </option>
                                    </select>
                                </div>

                                <button
                                    onClick={
                                        closeDetails
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        padding:
                                            "13px",
                                        border:
                                            "none",
                                        borderRadius:
                                            "8px",
                                        background:
                                            "#222",
                                        color:
                                            "#fff",
                                        cursor:
                                            "pointer",
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    Закрыть
                                </button>
                            </>
                        ) : (
                            <div>
                                Не удалось загрузить
                                детали заказа.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const cellStyle: React.CSSProperties = {
    padding: "14px 16px",
    borderBottom:
        "1px solid #eee",
    verticalAlign: "middle",
};

const detailSectionStyle: React.CSSProperties = {
    padding: "18px",
    background: "#f7f8f5",
    borderRadius: "10px",
    marginBottom: "15px",
};

function getStatusBackground(
    status: string,
) {
    switch (status) {
        case "NEW":
            return "#fff3cd";

        case "CONFIRMED":
            return "#dbeafe";

        case "IN_PROGRESS":
            return "#e0e7ff";

        case "COMPLETED":
            return "#dcfce7";

        case "CANCELLED":
            return "#fee2e2";

        default:
            return "#eee";
    }
}

export default AdminOrders;
