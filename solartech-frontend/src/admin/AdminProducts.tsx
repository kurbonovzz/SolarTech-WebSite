import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";

type Product = {
    id: number;
    manufacturer_id: number;
    category_id: number;
    name: string;
    model: string;
    description: string;
    power_w: number;
    capacity_kwh: number;
    price: number;
    cost_price: number;
    stock_quantity: number;
    min_stock: number;
    warranty_months: number;
    is_active: boolean;
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
            // Если VITE_API_URL неправильный — используем адрес текущего устройства.
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

const getToken = () => {
    return localStorage.getItem("solartech_admin_token");
};

const categoryName = (categoryId: number) => {
    switch (categoryId) {
        case 1:
            return "Солнечные панели";
        case 2:
            return "Аккумуляторы";
        case 3:
            return "Инверторы";
        default:
            return `Категория #${categoryId}`;
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
};

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);

    const [search, setSearch] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editPrice, setEditPrice] = useState("");
    const [editStock, setEditStock] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/products`);

            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const data = await response.json();

            setProducts(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.products)
                        ? data.products
                        : []
            );
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить товары.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.model.toLowerCase().includes(query) ||
                categoryName(product.category_id)
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [products, search]);

    const startEdit = (product: Product) => {
        setEditingId(product.id);
        setEditPrice(String(product.price));
        setEditStock(String(product.stock_quantity));

        setMessage("");
        setError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditPrice("");
        setEditStock("");
    };

    const saveProduct = async (product: Product) => {
        const price = Number(editPrice);
        const stock = Number(editStock);

        if (!Number.isFinite(price) || price < 0) {
            setError("Цена должна быть числом не меньше 0.");
            return;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            setError("Количество на складе должно быть целым числом не меньше 0.");
            return;
        }

        try {
            setSavingId(product.id);
            setError("");
            setMessage("");

            const token = getToken();

            const updatedProduct: Product = {
                ...product,
                price,
                stock_quantity: stock,
            };

            const response = await fetch(
                `${API_URL}/products/${product.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify(updatedProduct),
                }
            );

            if (response.status === 401) {
                localStorage.removeItem("solartech_admin_token");
                window.location.href = "/admin/login";
                return;
            }

            if (!response.ok) {
                const text = await response.text();

                throw new Error(
                    text || `Ошибка сохранения: ${response.status}`
                );
            }

            let savedProduct: Product | null = null;

            try {
                savedProduct = await response.json();
            } catch {
                // Backend может вернуть пустой ответ.
            }

            setProducts((current) =>
                current.map((item) =>
                    item.id === product.id
                        ? savedProduct || updatedProduct
                        : item
                )
            );

            setMessage(`Товар «${product.name}» успешно обновлён.`);

            cancelEdit();
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить изменения товара.");
        } finally {
            setSavingId(null);
        }
    };

    const activeCount = products.filter(
        (product) => product.is_active
    ).length;

    const lowStockCount = products.filter(
        (product) =>
            product.stock_quantity <= product.min_stock
    ).length;

    return (
        <AdminLayout activePage="products">
            <div
                style={{
                    padding: "24px",
                    maxWidth: "1400px",
                    margin: "0 auto",
                }}
            >
                {/* Заголовок */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "24px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "30px",
                                fontWeight: 700,
                            }}
                        >
                            Товары
                        </h1>

                        <p
                            style={{
                                margin: "8px 0 0",
                                color: "#6b7280",
                            }}
                        >
                            Управление товарами, ценами и остатками
                        </p>
                    </div>

                    <button
                        onClick={loadProducts}
                        disabled={loading}
                        style={{
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            borderRadius: "10px",
                            padding: "10px 16px",
                            cursor: loading ? "default" : "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {loading ? "Загрузка..." : "↻ Обновить"}
                    </button>
                </div>

                {/* Статистика */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        marginBottom: "24px",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            padding: "18px",
                        }}
                    >
                        <div
                            style={{
                                color: "#6b7280",
                                fontSize: "14px",
                                marginBottom: "8px",
                            }}
                        >
                            Всего товаров
                        </div>

                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                            }}
                        >
                            {products.length}
                        </div>
                    </div>

                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            padding: "18px",
                        }}
                    >
                        <div
                            style={{
                                color: "#6b7280",
                                fontSize: "14px",
                                marginBottom: "8px",
                            }}
                        >
                            Активные
                        </div>

                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                            }}
                        >
                            {activeCount}
                        </div>
                    </div>

                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            padding: "18px",
                        }}
                    >
                        <div
                            style={{
                                color: "#6b7280",
                                fontSize: "14px",
                                marginBottom: "8px",
                            }}
                        >
                            Низкий остаток
                        </div>

                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                            }}
                        >
                            {lowStockCount}
                        </div>
                    </div>
                </div>

                {/* Сообщения */}
                {message && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "13px 16px",
                            borderRadius: "10px",
                            background: "#ecfdf5",
                            border: "1px solid #a7f3d0",
                            color: "#065f46",
                        }}
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "13px 16px",
                            borderRadius: "10px",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#991b1b",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Поиск */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        padding: "16px",
                        marginBottom: "16px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Поиск по названию, модели или категории..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "12px 14px",
                            border: "1px solid #d1d5db",
                            borderRadius: "10px",
                            fontSize: "15px",
                            outline: "none",
                        }}
                    />
                </div>

                {/* Таблица */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        overflowX: "auto",
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                padding: "50px",
                                textAlign: "center",
                                color: "#6b7280",
                            }}
                        >
                            Загружаем товары...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div
                            style={{
                                padding: "50px",
                                textAlign: "center",
                                color: "#6b7280",
                            }}
                        >
                            Товары не найдены.
                        </div>
                    ) : (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "950px",
                            }}
                        >
                            <thead>
                            <tr
                                style={{
                                    background: "#f9fafb",
                                }}
                            >
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Товар</th>
                                <th style={thStyle}>Категория</th>
                                <th style={thStyle}>Мощность</th>
                                <th style={thStyle}>Цена</th>
                                <th style={thStyle}>Склад</th>
                                <th style={thStyle}>Статус</th>
                                <th style={thStyle}>Действие</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredProducts.map((product) => {
                                const isEditing =
                                    editingId === product.id;

                                const lowStock =
                                    product.stock_quantity <=
                                    product.min_stock;

                                return (
                                    <tr
                                        key={product.id}
                                        style={{
                                            borderTop:
                                                "1px solid #e5e7eb",
                                        }}
                                    >
                                        <td style={tdStyle}>
                                            #{product.id}
                                        </td>

                                        <td style={tdStyle}>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {product.name}
                                            </div>

                                            {product.model && (
                                                <div
                                                    style={{
                                                        color: "#6b7280",
                                                        fontSize: "13px",
                                                        marginTop: "4px",
                                                    }}
                                                >
                                                    {product.model}
                                                </div>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {categoryName(
                                                product.category_id
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {product.power_w > 0
                                                ? `${product.power_w} W`
                                                : product.capacity_kwh >
                                                0
                                                    ? `${product.capacity_kwh} kWh`
                                                    : "—"}
                                        </td>

                                        <td style={tdStyle}>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={editPrice}
                                                    onChange={(e) =>
                                                        setEditPrice(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={inputStyle}
                                                />
                                            ) : (
                                                <strong>
                                                    {formatPrice(
                                                        product.price
                                                    )}{" "}
                                                    TJS
                                                </strong>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={editStock}
                                                    onChange={(e) =>
                                                        setEditStock(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={inputStyle}
                                                />
                                            ) : (
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        color: lowStock
                                                            ? "#dc2626"
                                                            : "#111827",
                                                    }}
                                                >
                                                        {
                                                            product.stock_quantity
                                                        }{" "}
                                                    шт.
                                                    </span>
                                            )}

                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#9ca3af",
                                                    marginTop: "3px",
                                                }}
                                            >
                                                минимум:{" "}
                                                {product.min_stock}
                                            </div>
                                        </td>

                                        <td style={tdStyle}>
                                                <span
                                                    style={{
                                                        display:
                                                            "inline-block",
                                                        padding:
                                                            "5px 9px",
                                                        borderRadius:
                                                            "999px",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        background:
                                                            product.is_active
                                                                ? "#ecfdf5"
                                                                : "#f3f4f6",
                                                        color:
                                                            product.is_active
                                                                ? "#047857"
                                                                : "#6b7280",
                                                    }}
                                                >
                                                    {product.is_active
                                                        ? "Активен"
                                                        : "Неактивен"}
                                                </span>
                                        </td>

                                        <td style={tdStyle}>
                                            {isEditing ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            saveProduct(
                                                                product
                                                            )
                                                        }
                                                        disabled={
                                                            savingId ===
                                                            product.id
                                                        }
                                                        style={{
                                                            ...buttonStyle,
                                                            background:
                                                                "#111827",
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        {savingId ===
                                                        product.id
                                                            ? "Сохранение..."
                                                            : "Сохранить"}
                                                    </button>

                                                    <button
                                                        onClick={
                                                            cancelEdit
                                                        }
                                                        disabled={
                                                            savingId ===
                                                            product.id
                                                        }
                                                        style={{
                                                            ...buttonStyle,
                                                            background:
                                                                "#f3f4f6",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        startEdit(product)
                                                    }
                                                    style={{
                                                        ...buttonStyle,
                                                        background:
                                                            "#111827",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    Изменить
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div
                    style={{
                        marginTop: "14px",
                        color: "#6b7280",
                        fontSize: "13px",
                    }}
                >
                    Показано: {filteredProducts.length} из{" "}
                    {products.length}
                </div>
            </div>
        </AdminLayout>
    );
}

const thStyle: React.CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: 700,
    color: "#4b5563",
    whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
    padding: "15px 16px",
    verticalAlign: "middle",
    fontSize: "14px",
    color: "#111827",
};

const inputStyle: React.CSSProperties = {
    width: "120px",
    boxSizing: "border-box",
    padding: "9px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
};

const buttonStyle: React.CSSProperties = {
    border: "none",
    borderRadius: "8px",
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
};
