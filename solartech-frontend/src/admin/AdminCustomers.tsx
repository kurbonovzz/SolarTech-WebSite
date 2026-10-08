import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";

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

const API_URL = "http://localhost:8080/api/v1";

function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const getToken = () => {
        return localStorage.getItem("solartech_admin_token");
    };

    const loadCustomers = async () => {
        const token = getToken();

        if (!token) {
            window.location.href = "/admin/login";
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Получаем реальные заказы
            const ordersResponse = await fetch(
                `${API_URL}/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (ordersResponse.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );

                window.location.href = "/admin/login";
                return;
            }

            const ordersData = await ordersResponse.json();

            if (!ordersResponse.ok) {
                throw new Error(
                    ordersData.error ||
                    "Не удалось загрузить заказы.",
                );
            }

            const ordersList: Order[] =
                ordersData.orders || [];

            setOrders(ordersList);

            // Получаем уникальные ID клиентов
            const customerIDs = Array.from(
                new Set(
                    ordersList.map(
                        (order) => order.customer_id,
                    ),
                ),
            );

            // Загружаем каждого клиента
            const loadedCustomers: Customer[] = [];

            await Promise.all(
                customerIDs.map(async (customerID) => {
                    try {
                        const response = await fetch(
                            `${API_URL}/customers/${customerID}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            },
                        );

                        if (!response.ok) {
                            return;
                        }

                        const data =
                            await response.json();

                        if (data.customer) {
                            loadedCustomers.push(
                                data.customer,
                            );
                        }
                    } catch {
                        // Если клиента не удалось загрузить,
                        // просто пропускаем его.
                    }
                }),
            );

            loadedCustomers.sort(
                (a, b) => b.id - a.id,
            );

            setCustomers(loadedCustomers);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось загрузить клиентов.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        if (!value) {
            return customers;
        }

        return customers.filter((customer) =>
            customer.name
                .toLowerCase()
                .includes(value) ||
            customer.phone
                .toLowerCase()
                .includes(value) ||
            String(customer.id).includes(value),
        );
    }, [customers, search]);

    const getOrderCount = (customerID: number) => {
        return orders.filter(
            (order) =>
                order.customer_id === customerID,
        ).length;
    };

    const getCustomerTotal = (
        customerID: number,
    ) => {
        return orders
            .filter(
                (order) =>
                    order.customer_id === customerID,
            )
            .reduce(
                (sum, order) =>
                    sum + Number(order.total_price || 0),
                0,
            );
    };

    const getTotalOrdersAmount = () => {
        return orders.reduce(
            (sum, order) =>
                sum + Number(order.total_price || 0),
            0,
        );
    };

    const navigate = (page: string) => {
        if (page === "dashboard") {
            window.location.href = "/admin";
            return;
        }

        if (page === "hboard") {
            window.location.href = "/admin";
            return;
        }

        if (page === "orders") {
            window.location.href = "/admin/orders";
            return;
        }

        if (page === "customers") {
            window.location.href = "/admin/customers";
            return;
        }

        alert(
            `${page} раздел пока находится в разработке.`,
        );
    };

    return (
        <AdminLayout
            activePage="customers"
            onNavigate={navigate}
        >
            <div
                style={{
                    padding: "40px",
                    maxWidth: "1250px",
                    margin: "0 auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "25px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "32px",
                            }}
                        >
                            Клиенты
                        </h1>

                        <p
                            style={{
                                color: "#777",
                                marginTop: "8px",
                            }}
                        >
                            Реальные клиенты из базы данных
                        </p>
                    </div>

                    <button
                        onClick={loadCustomers}
                        style={{
                            padding: "12px 18px",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                    >
                        ↻ Обновить
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3, 1fr)",
                        gap: "15px",
                        marginBottom: "25px",
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "15px",
                        }}
                    >
                        <div
                            style={{
                                color: "#777",
                            }}
                        >
                            Всего клиентов
                        </div>

                        <strong
                            style={{
                                fontSize: "28px",
                            }}
                        >
                            {customers.length}
                        </strong>
                    </div>

                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "15px",
                        }}
                    >
                        <div
                            style={{
                                color: "#777",
                            }}
                        >
                            Заказов
                        </div>

                        <strong
                            style={{
                                fontSize: "28px",
                            }}
                        >
                            {orders.length}
                        </strong>
                    </div>

                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "15px",
                        }}
                    >
                        <div
                            style={{
                                color: "#777",
                            }}
                        >
                            Общая сумма
                        </div>

                        <strong
                            style={{
                                fontSize: "28px",
                            }}
                        >
                            {getTotalOrdersAmount().toLocaleString(
                                "ru-RU",
                            )}{" "}
                            TJS
                        </strong>
                    </div>
                </div>

                <div
                    style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "15px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔎 Поиск по имени, телефону или ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "14px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            fontSize: "15px",
                            marginBottom: "20px",
                        }}
                    />

                    {loading && (
                        <div
                            style={{
                                padding: "30px",
                                textAlign: "center",
                            }}
                        >
                            Загружаем клиентов...
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                padding: "15px",
                                background: "#ffe5e5",
                                color: "#b00020",
                                borderRadius: "10px",
                                marginBottom: "15px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {!loading &&
                        filteredCustomers.length === 0 && (
                            <div
                                style={{
                                    padding: "30px",
                                    textAlign: "center",
                                    color: "#777",
                                }}
                            >
                                Клиенты не найдены.
                            </div>
                        )}

                    {!loading &&
                        filteredCustomers.length > 0 && (
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
                                    <tr>
                                        <th
                                            style={{
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "14px",
                                            }}
                                        >
                                            ID
                                        </th>

                                        <th
                                            style={{
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "14px",
                                            }}
                                        >
                                            Клиент
                                        </th>

                                        <th
                                            style={{
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "14px",
                                            }}
                                        >
                                            Телефон
                                        </th>

                                        <th
                                            style={{
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "14px",
                                            }}
                                        >
                                            Заказов
                                        </th>

                                        <th
                                            style={{
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "14px",
                                            }}
                                        >
                                            Сумма
                                        </th>

                                        <th
                                            style={{
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "14px",
                                            }}
                                        >
                                            Дата
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filteredCustomers.map(
                                        (customer) => (
                                            <tr
                                                key={
                                                    customer.id
                                                }
                                                style={{
                                                    borderTop:
                                                        "1px solid #eee",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding:
                                                            "14px",
                                                    }}
                                                >
                                                    #{customer.id}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px",
                                                    }}
                                                >
                                                    <strong>
                                                        {
                                                            customer.name
                                                        }
                                                    </strong>
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px",
                                                    }}
                                                >
                                                    {
                                                        customer.phone
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px",
                                                    }}
                                                >
                                                    {
                                                        getOrderCount(
                                                            customer.id,
                                                        )
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px",
                                                    }}
                                                >
                                                    {getCustomerTotal(
                                                        customer.id,
                                                    ).toLocaleString(
                                                        "ru-RU",
                                                    )}{" "}
                                                    TJS
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px",
                                                    }}
                                                >
                                                    {new Date(
                                                        customer.created_at,
                                                    ).toLocaleDateString(
                                                        "ru-RU",
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminCustomers;