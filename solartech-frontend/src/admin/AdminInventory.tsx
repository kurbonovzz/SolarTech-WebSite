
import { useEffect, useMemo, useState } from "react";
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

type ProductForm = {
    manufacturer_id: string;
    category_id: string;
    name: string;
    model: string;
    description: string;
    power_w: string;
    capacity_kwh: string;
    price: string;
    cost_price: string;
    stock_quantity: string;
    min_stock: string;
    warranty_months: string;
    is_active: boolean;
};

/* =========================================================
   API
========================================================= */

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
            // Используем адрес ниже.
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

/* =========================================================
   FORM
========================================================= */

const emptyForm: ProductForm = {
    manufacturer_id: "",
    category_id: "",
    name: "",
    model: "",
    description: "",
    power_w: "0",
    capacity_kwh: "0",
    price: "0",
    cost_price: "0",
    stock_quantity: "0",
    min_stock: "0",
    warranty_months: "0",
    is_active: true,
};

/* =========================================================
   HELPERS
========================================================= */

function getCategoryName(categoryId: number) {
    switch (categoryId) {
        case 1:
            return "Солнечные панели";
        case 2:
            return "Аккумуляторы";
        case 3:
            return "Инверторы";
        default:
            return `Категория ${categoryId}`;
    }
}

function getCategoryShort(categoryId: number) {
    switch (categoryId) {
        case 1:
            return "Панели";
        case 2:
            return "Аккумулятор";
        case 3:
            return "Инвертор";
        default:
            return "Товар";
    }
}

function getCategoryIcon(categoryId: number) {
    switch (categoryId) {
        case 1:
            return "☀";
        case 2:
            return "▣";
        case 3:
            return "ϟ";
        default:
            return "□";
    }
}

function formatPrice(value: number) {
    return `${Number(value || 0).toLocaleString("ru-RU")} TJS`;
}

/* =========================================================
   ICON
========================================================= */

function Icon({
                  name,
                  size = 20,
              }: {
    name:
        | "box"
        | "warning"
        | "money"
        | "search"
        | "refresh"
        | "plus"
        | "edit"
        | "trash"
        | "close"
        | "sun"
        | "battery"
        | "bolt";
    size?: number;
}) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    if (name === "search") {
        return (
            <svg {...common}>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </svg>
        );
    }

    if (name === "refresh") {
        return (
            <svg {...common}>
                <path d="M20 11a8.1 8.1 0 0 0-14.9-4L3 10" />
                <path d="M3 4v6h6" />
                <path d="M4 13a8.1 8.1 0 0 0 14.9 4L21 14" />
                <path d="M21 20v-6h-6" />
            </svg>
        );
    }

    if (name === "plus") {
        return (
            <svg {...common}>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </svg>
        );
    }

    if (name === "edit") {
        return (
            <svg {...common}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
        );
    }

    if (name === "trash") {
        return (
            <svg {...common}>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
            </svg>
        );
    }

    if (name === "close") {
        return (
            <svg {...common}>
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
            </svg>
        );
    }

    if (name === "warning") {
        return (
            <svg {...common}>
                <path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </svg>
        );
    }

    if (name === "money") {
        return (
            <svg {...common}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M7 9h.01M17 15h.01" />
            </svg>
        );
    }

    if (name === "sun") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
            </svg>
        );
    }

    if (name === "battery") {
        return (
            <svg {...common}>
                <rect x="3" y="6" width="17" height="12" rx="2" />
                <path d="M20 10h2v4h-2" />
                <path d="M8 10v4M11 10v4" />
            </svg>
        );
    }

    if (name === "bolt") {
        return (
            <svg {...common}>
                <path d="m13 2-9 12h7l-1 8 9-12h-7Z" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <path d="M4 7h16v13H4z" />
            <path d="m4 7 4-4h8l4 4" />
            <path d="M9 12h6" />
        </svg>
    );
}

/* =========================================================
   MAIN
========================================================= */

function AdminInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [form, setForm] =
        useState<ProductForm>(emptyForm);

    /* =====================================================
       LOAD
    ===================================================== */

    const loadProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/products`,
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось загрузить товары.",
                );
            }

            const items: Product[] = Array.isArray(
                data.products,
            )
                ? data.products
                : Array.isArray(data)
                    ? data
                    : [];

            setProducts(items);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка загрузки товаров.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredProducts = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.name
                    .toLowerCase()
                    .includes(value) ||
                (product.model || "")
                    .toLowerCase()
                    .includes(value) ||
                getCategoryName(product.category_id)
                    .toLowerCase()
                    .includes(value) ||
                String(product.id).includes(value)
            );
        });
    }, [products, search]);

    /* =====================================================
       STATS
    ===================================================== */

    const lowStockCount = products.filter(
        (product) =>
            product.stock_quantity <= product.min_stock,
    ).length;

    const outOfStockCount = products.filter(
        (product) => product.stock_quantity === 0,
    ).length;

    const totalStockValue = products.reduce(
        (sum, product) =>
            sum +
            Number(product.price || 0) *
            Number(product.stock_quantity || 0),
        0,
    );

    /* =====================================================
       MODAL
    ===================================================== */

    const openCreate = () => {
        setEditingProduct(null);
        setForm({ ...emptyForm });
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);

        setForm({
            manufacturer_id: String(
                product.manufacturer_id,
            ),
            category_id: String(product.category_id),
            name: product.name,
            model: product.model || "",
            description: product.description || "",
            power_w: String(product.power_w || 0),
            capacity_kwh: String(
                product.capacity_kwh || 0,
            ),
            price: String(product.price || 0),
            cost_price: String(
                product.cost_price || 0,
            ),
            stock_quantity: String(
                product.stock_quantity || 0,
            ),
            min_stock: String(
                product.min_stock || 0,
            ),
            warranty_months: String(
                product.warranty_months || 0,
            ),
            is_active: product.is_active,
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingProduct(null);
        setForm({ ...emptyForm });
        setError("");
    };

    const updateField = (
        field: keyof ProductForm,
        value: string | boolean,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    /* =====================================================
       SAVE
    ===================================================== */

    const saveProduct = async () => {
        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Введите название товара.");
            return;
        }

        if (Number(form.manufacturer_id) <= 0) {
            setError(
                "Введите корректный Manufacturer ID.",
            );
            return;
        }

        if (Number(form.category_id) <= 0) {
            setError(
                "Введите корректный Category ID.",
            );
            return;
        }

        if (Number(form.price) < 0) {
            setError("Цена не может быть отрицательной.");
            return;
        }

        if (Number(form.cost_price) < 0) {
            setError(
                "Себестоимость не может быть отрицательной.",
            );
            return;
        }

        if (Number(form.stock_quantity) < 0) {
            setError(
                "Количество товара не может быть отрицательным.",
            );
            return;
        }

        if (Number(form.min_stock) < 0) {
            setError(
                "Минимальный запас не может быть отрицательным.",
            );
            return;
        }

        const payload = {
            manufacturer_id: Number(
                form.manufacturer_id,
            ),
            category_id: Number(form.category_id),
            name: form.name.trim(),
            model: form.model.trim(),
            description: form.description.trim(),
            power_w: Number(form.power_w),
            capacity_kwh: Number(form.capacity_kwh),
            price: Number(form.price),
            cost_price: Number(form.cost_price),
            stock_quantity: Number(
                form.stock_quantity,
            ),
            min_stock: Number(form.min_stock),
            warranty_months: Number(
                form.warranty_months,
            ),
            is_active: form.is_active,
        };

        setSaving(true);

        try {
            const url = editingProduct
                ? `${API_URL}/products/${editingProduct.id}`
                : `${API_URL}/products`;

            const method = editingProduct
                ? "PUT"
                : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось сохранить товар.",
                );
            }

            await loadProducts();

            setSuccess(
                editingProduct
                    ? "Товар успешно обновлён."
                    : "Товар успешно добавлен.",
            );

            setTimeout(() => {
                setShowModal(false);
                setEditingProduct(null);
                setForm({ ...emptyForm });
                setSuccess("");
            }, 700);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка сохранения товара.",
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const deleteProduct = async (
        product: Product,
    ) => {
        const confirmed = window.confirm(
            `Удалить товар "${product.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/products/${product.id}`,
                {
                    method: "DELETE",
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось удалить товар.",
                );
            }

            setProducts((current) =>
                current.filter(
                    (item) =>
                        item.id !== product.id,
                ),
            );

            setSuccess(
                "Товар успешно удалён.",
            );

            setTimeout(() => {
                setSuccess("");
            }, 2000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка удаления товара.",
            );
        }
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navigate = (page: string) => {
        switch (page) {
            case "dashboard":
                window.location.href = "/admin";
                break;

            case "orders":
                window.location.href =
                    "/admin/orders";
                break;

            case "customers":
                window.location.href =
                    "/admin/customers";
                break;

            case "inventory":
                window.location.href =
                    "/admin/inventory";
                break;

            case "products":
                window.location.href =
                    "/admin/products";
                break;

            case "equipment-types":
                window.location.href =
                    "/admin/equipment-types";
                break;

            case "packages":
                window.location.href =
                    "/admin/packages";
                break;

            default:
                break;
        }
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <AdminLayout
            activePage="inventory"
            onNavigate={navigate}
        >
            <div className="inventory-page">
                <style>{`
                    * {
                        box-sizing: border-box;
                    }

                    .inventory-page {
                        min-height: 100vh;
                        padding: 34px 36px 60px;
                        background:
                            radial-gradient(
                                circle at 90% 0%,
                                rgba(104, 169, 73, 0.08),
                                transparent 28%
                            ),
                            #f5f7f3;
                        color: #17221a;
                        font-family:
                            Inter,
                            -apple-system,
                            BlinkMacSystemFont,
                            "Segoe UI",
                            Arial,
                            sans-serif;
                    }

                    .inventory-container {
                        width: 100%;
                        max-width: 1450px;
                        margin: 0 auto;
                    }

                    /* HEADER */

                    .inventory-header {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 24px;
                        margin-bottom: 28px;
                    }

                    .inventory-title {
                        display: flex;
                        align-items: center;
                        gap: 17px;
                    }

                    .inventory-title-icon {
                        width: 58px;
                        height: 58px;
                        display: grid;
                        place-items: center;
                        border-radius: 18px;
                        background:
                            linear-gradient(
                                145deg,
                                #6cae4d,
                                #3f8232
                            );
                        color: white;
                        box-shadow:
                            0 12px 28px
                            rgba(68, 133, 52, 0.22);
                    }

                    .inventory-title-icon svg {
                        width: 28px;
                        height: 28px;
                    }

                    .inventory-eyebrow {
                        display: block;
                        margin-bottom: 5px;
                        color: #5d9948;
                        font-size: 10px;
                        font-weight: 900;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                    }

                    .inventory-title h1 {
                        margin: 0;
                        font-size: 30px;
                        line-height: 1.1;
                        letter-spacing: -1px;
                    }

                    .inventory-title p {
                        margin: 7px 0 0;
                        color: #7c887f;
                        font-size: 13px;
                    }

                    .inventory-actions {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .inventory-btn {
                        min-height: 44px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        padding: 0 17px;
                        border: 1px solid #dce5d8;
                        border-radius: 12px;
                        background: white;
                        color: #344038;
                        font-size: 12px;
                        font-weight: 800;
                        cursor: pointer;
                        transition:
                            transform .18s ease,
                            box-shadow .18s ease,
                            border-color .18s ease;
                    }

                    .inventory-btn:hover {
                        transform: translateY(-1px);
                        border-color: #bfd0b9;
                        box-shadow:
                            0 8px 22px
                            rgba(42, 65, 45, .08);
                    }

                    .inventory-btn:disabled {
                        opacity: .55;
                        cursor: not-allowed;
                        transform: none;
                    }

                    .inventory-btn-primary {
                        border-color: #57963f;
                        background:
                            linear-gradient(
                                135deg,
                                #65a84b,
                                #478c38
                            );
                        color: white;
                        box-shadow:
                            0 10px 24px
                            rgba(70, 137, 54, .18);
                    }

                    .inventory-btn-primary:hover {
                        border-color: #478536;
                    }

                    /* ALERTS */

                    .inventory-alert {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 18px;
                        padding: 13px 16px;
                        border-radius: 13px;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    .inventory-alert.error {
                        border: 1px solid #f0d2ca;
                        background: #fff5f2;
                        color: #ad4e3c;
                    }

                    .inventory-alert.success {
                        border: 1px solid #cfe4c8;
                        background: #f2faef;
                        color: #438035;
                    }

                    /* STATS */

                    .inventory-stats {
                        display: grid;
                        grid-template-columns:
                            repeat(4, minmax(0, 1fr));
                        gap: 15px;
                        margin-bottom: 22px;
                    }

                    .inventory-stat {
                        position: relative;
                        overflow: hidden;
                        min-height: 122px;
                        padding: 21px;
                        border: 1px solid #e0e7dc;
                        border-radius: 18px;
                        background: rgba(255,255,255,.94);
                        box-shadow:
                            0 7px 25px
                            rgba(34, 53, 37, .045);
                    }

                    .inventory-stat::after {
                        content: "";
                        position: absolute;
                        right: -28px;
                        bottom: -40px;
                        width: 105px;
                        height: 105px;
                        border-radius: 50%;
                        background: rgba(95, 153, 67, .055);
                    }

                    .inventory-stat-top {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                    }

                    .inventory-stat-icon {
                        width: 43px;
                        height: 43px;
                        display: grid;
                        place-items: center;
                        border-radius: 13px;
                    }

                    .inventory-stat-icon.green {
                        background: #edf7e9;
                        color: #56963f;
                    }

                    .inventory-stat-icon.orange {
                        background: #fff4e6;
                        color: #d38a30;
                    }

                    .inventory-stat-icon.red {
                        background: #fff0ed;
                        color: #c95a46;
                    }

                    .inventory-stat-icon.blue {
                        background: #edf4fa;
                        color: #5185ae;
                    }

                    .inventory-stat-label {
                        display: block;
                        margin-top: 16px;
                        color: #7d8980;
                        font-size: 11px;
                        font-weight: 700;
                    }

                    .inventory-stat-value {
                        display: block;
                        margin-top: 4px;
                        font-size: 25px;
                        line-height: 1;
                        letter-spacing: -.8px;
                    }

                    .inventory-stat-value.money {
                        font-size: 20px;
                    }

                    /* MAIN CARD */

                    .inventory-card {
                        overflow: hidden;
                        border: 1px solid #e0e7dc;
                        border-radius: 21px;
                        background: white;
                        box-shadow:
                            0 12px 40px
                            rgba(34, 53, 37, .055);
                    }

                    .inventory-toolbar {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 18px;
                        padding: 18px 20px;
                        border-bottom: 1px solid #edf0eb;
                        background: #fcfdfb;
                    }

                    .inventory-search {
                        width: min(520px, 100%);
                        height: 45px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 0 14px;
                        border: 1px solid #dce5d9;
                        border-radius: 12px;
                        background: white;
                        color: #829087;
                        transition:
                            border-color .18s ease,
                            box-shadow .18s ease;
                    }

                    .inventory-search:focus-within {
                        border-color: #79a968;
                        box-shadow:
                            0 0 0 3px
                            rgba(91, 153, 67, .09);
                    }

                    .inventory-search input {
                        width: 100%;
                        height: 100%;
                        border: 0;
                        outline: 0;
                        background: transparent;
                        color: #273229;
                        font-size: 12px;
                    }

                    .inventory-search input::placeholder {
                        color: #a1aaa3;
                    }

                    .inventory-count {
                        color: #89948c;
                        font-size: 11px;
                        white-space: nowrap;
                    }

                    .inventory-count strong {
                        color: #29352d;
                        font-size: 12px;
                    }

                    /* TABLE */

                    .inventory-table-wrap {
                        width: 100%;
                        overflow-x: auto;
                    }

                    .inventory-table {
                        width: 100%;
                        min-width: 920px;
                        border-collapse: collapse;
                    }

                    .inventory-table th {
                        padding: 15px 18px;
                        border-bottom: 1px solid #e9eee7;
                        background: #fafcf9;
                        color: #8a958d;
                        font-size: 9px;
                        font-weight: 900;
                        letter-spacing: 1px;
                        text-align: left;
                        text-transform: uppercase;
                        white-space: nowrap;
                    }

                    .inventory-table td {
                        padding: 17px 18px;
                        border-bottom: 1px solid #edf0ec;
                        color: #39453d;
                        font-size: 12px;
                        vertical-align: middle;
                    }

                    .inventory-table tbody tr {
                        transition: background .15s ease;
                    }

                    .inventory-table tbody tr:hover {
                        background: #fbfdf9;
                    }

                    .inventory-table tbody tr:last-child td {
                        border-bottom: 0;
                    }

                    .product-main {
                        display: flex;
                        align-items: center;
                        gap: 13px;
                        min-width: 230px;
                    }

                    .product-icon {
                        width: 46px;
                        height: 46px;
                        flex: 0 0 46px;
                        display: grid;
                        place-items: center;
                        border: 1px solid #dce9d7;
                        border-radius: 14px;
                        background:
                            linear-gradient(
                                145deg,
                                #f4faef,
                                #e7f2e1
                            );
                        color: #5c9a45;
                        font-size: 21px;
                        font-weight: 800;
                    }

                    .product-main-info {
                        min-width: 0;
                    }

                    .product-name {
                        display: block;
                        overflow: hidden;
                        color: #1f2b23;
                        font-size: 13px;
                        font-weight: 800;
                        line-height: 1.25;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .product-model {
                        display: block;
                        margin-top: 5px;
                        color: #99a39c;
                        font-size: 10px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .category-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 7px 10px;
                        border: 1px solid #e1e8de;
                        border-radius: 9px;
                        background: #f8faf7;
                        color: #536057;
                        font-size: 10px;
                        font-weight: 800;
                        white-space: nowrap;
                    }

                    .category-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #6da655;
                    }

                    .spec-main {
                        display: block;
                        color: #344139;
                        font-size: 12px;
                        font-weight: 800;
                    }

                    .spec-sub {
                        display: block;
                        margin-top: 4px;
                        color: #a0aaa2;
                        font-size: 9px;
                    }

                    .price-main {
                        color: #3f8232;
                        font-size: 13px;
                        font-weight: 900;
                        white-space: nowrap;
                    }

                    .stock-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 7px;
                        padding: 7px 10px;
                        border: 1px solid #dcebd7;
                        border-radius: 9px;
                        background: #f2faef;
                        color: #4b8b3b;
                        font-size: 10px;
                        font-weight: 900;
                        white-space: nowrap;
                    }

                    .stock-badge.low {
                        border-color: #f1dcc0;
                        background: #fff8ee;
                        color: #c6812e;
                    }

                    .stock-badge.empty {
                        border-color: #efd0ca;
                        background: #fff3f0;
                        color: #c15442;
                    }

                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 7px 10px;
                        border-radius: 9px;
                        font-size: 9px;
                        font-weight: 900;
                        white-space: nowrap;
                    }

                    .status-badge.active {
                        border: 1px solid #d7ead2;
                        background: #f0f9ed;
                        color: #4c8e3c;
                    }

                    .status-badge.inactive {
                        border: 1px solid #e4e6e4;
                        background: #f4f5f4;
                        color: #929a94;
                    }

                    .status-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: currentColor;
                    }

                    .product-actions {
                        display: flex;
                        align-items: center;
                        gap: 7px;
                    }

                    .table-action {
                        width: 35px;
                        height: 35px;
                        display: grid;
                        place-items: center;
                        border: 1px solid #e0e6dd;
                        border-radius: 10px;
                        background: white;
                        color: #718078;
                        cursor: pointer;
                        transition:
                            transform .15s ease,
                            background .15s ease,
                            color .15s ease,
                            border-color .15s ease;
                    }

                    .table-action:hover {
                        transform: translateY(-1px);
                    }

                    .table-action.edit:hover {
                        border-color: #bdd5b6;
                        background: #f0f8ed;
                        color: #4e8d3c;
                    }

                    .table-action.delete:hover {
                        border-color: #efc9c1;
                        background: #fff2ef;
                        color: #bd5441;
                    }

                    /* LOADING */

                    .inventory-loading {
                        min-height: 350px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                        color: #8a958d;
                        font-size: 12px;
                    }

                    .inventory-spinner {
                        width: 38px;
                        height: 38px;
                        border: 3px solid #e4ece0;
                        border-top-color: #5e9c47;
                        border-radius: 50%;
                        animation:
                            inventorySpin .8s linear infinite;
                    }

                    @keyframes inventorySpin {
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    .inventory-empty {
                        min-height: 350px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                    }

                    .inventory-empty-icon {
                        width: 64px;
                        height: 64px;
                        display: grid;
                        place-items: center;
                        margin-bottom: 15px;
                        border-radius: 20px;
                        background: #f0f6ed;
                        color: #669b52;
                    }

                    .inventory-empty h3 {
                        margin: 0;
                        font-size: 18px;
                    }

                    .inventory-empty p {
                        margin: 8px 0 0;
                        color: #929c95;
                        font-size: 12px;
                    }

                    /* MODAL */

                    .inventory-modal-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        background: rgba(10, 20, 13, .68);
                        backdrop-filter: blur(8px);
                        animation:
                            inventoryFade .18s ease;
                    }

                    @keyframes inventoryFade {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    .inventory-modal {
                        width: min(780px, 100%);
                        max-height: min(900px, 92vh);
                        overflow: auto;
                        border: 1px solid #dfe8db;
                        border-radius: 24px;
                        background: #fbfdf9;
                        box-shadow:
                            0 35px 100px
                            rgba(0,0,0,.32);
                        animation:
                            inventoryModal .22s ease;
                    }

                    @keyframes inventoryModal {
                        from {
                            opacity: 0;
                            transform:
                                translateY(15px)
                                scale(.985);
                        }
                        to {
                            opacity: 1;
                            transform:
                                translateY(0)
                                scale(1);
                        }
                    }

                    .inventory-modal-header {
                        position: sticky;
                        top: 0;
                        z-index: 2;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 23px 25px;
                        border-bottom: 1px solid #e8ede5;
                        background: rgba(251,253,249,.96);
                        backdrop-filter: blur(10px);
                    }

                    .modal-eyebrow {
                        display: block;
                        margin-bottom: 5px;
                        color: #619b4b;
                        font-size: 9px;
                        font-weight: 900;
                        letter-spacing: 1.8px;
                        text-transform: uppercase;
                    }

                    .inventory-modal-header h2 {
                        margin: 0;
                        color: #202b24;
                        font-size: 22px;
                        letter-spacing: -.5px;
                    }

                    .inventory-modal-header p {
                        margin: 5px 0 0;
                        color: #8c978f;
                        font-size: 11px;
                    }

                    .modal-close {
                        width: 39px;
                        height: 39px;
                        display: grid;
                        place-items: center;
                        flex: 0 0 39px;
                        border: 1px solid #dce4d9;
                        border-radius: 11px;
                        background: white;
                        color: #6e7971;
                        cursor: pointer;
                    }

                    .modal-close:hover {
                        background: #f2f7ef;
                        color: #3f8033;
                    }

                    .inventory-form {
                        padding: 25px;
                    }

                    .form-section-title {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin: 0 0 14px;
                        color: #29362e;
                        font-size: 12px;
                        font-weight: 900;
                    }

                    .form-section-title::before {
                        content: "";
                        width: 4px;
                        height: 17px;
                        border-radius: 5px;
                        background: #65a84b;
                    }

                    .form-grid {
                        display: grid;
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr));
                        gap: 15px;
                    }

                    .form-group {
                        display: flex;
                        flex-direction: column;
                        gap: 7px;
                    }

                    .form-group.full {
                        grid-column: 1 / -1;
                    }

                    .form-group label,
                    .active-label {
                        color: #68746c;
                        font-size: 10px;
                        font-weight: 800;
                    }

                    .form-input,
                    .form-textarea {
                        width: 100%;
                        border: 1px solid #dce5d9;
                        border-radius: 11px;
                        outline: none;
                        background: white;
                        color: #29342d;
                        font-size: 12px;
                        transition:
                            border-color .18s ease,
                            box-shadow .18s ease;
                    }

                    .form-input {
                        height: 43px;
                        padding: 0 12px;
                    }

                    .form-textarea {
                        min-height: 100px;
                        padding: 12px;
                        resize: vertical;
                        line-height: 1.5;
                    }

                    .form-input:focus,
                    .form-textarea:focus {
                        border-color: #77a967;
                        box-shadow:
                            0 0 0 3px
                            rgba(91, 153, 67, .08);
                    }

                    .form-hint {
                        margin-top: 1px;
                        color: #a0aaa3;
                        font-size: 9px;
                    }

                    .active-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 15px;
                        margin-top: 20px;
                        padding: 14px 15px;
                        border: 1px solid #dfe8dc;
                        border-radius: 12px;
                        background: #f8fbf6;
                    }

                    .active-row-info strong {
                        display: block;
                        color: #334038;
                        font-size: 11px;
                    }

                    .active-row-info span {
                        display: block;
                        margin-top: 3px;
                        color: #929d95;
                        font-size: 9px;
                    }

                    .switch {
                        position: relative;
                        width: 45px;
                        height: 25px;
                        flex: 0 0 45px;
                    }

                    .switch input {
                        width: 0;
                        height: 0;
                        opacity: 0;
                    }

                    .switch-slider {
                        position: absolute;
                        inset: 0;
                        border-radius: 20px;
                        background: #ccd5cb;
                        cursor: pointer;
                        transition: .2s;
                    }

                    .switch-slider::before {
                        content: "";
                        position: absolute;
                        width: 19px;
                        height: 19px;
                        left: 3px;
                        top: 3px;
                        border-radius: 50%;
                        background: white;
                        box-shadow: 0 2px 5px rgba(0,0,0,.15);
                        transition: .2s;
                    }

                    .switch input:checked + .switch-slider {
                        background: #62a348;
                    }

                    .switch input:checked + .switch-slider::before {
                        transform: translateX(20px);
                    }

                    .modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                        margin-top: 24px;
                        padding-top: 20px;
                        border-top: 1px solid #e8ede5;
                    }

                    .modal-button {
                        min-height: 43px;
                        padding: 0 18px;
                        border-radius: 11px;
                        font-size: 11px;
                        font-weight: 900;
                        cursor: pointer;
                    }

                    .modal-button.cancel {
                        border: 1px solid #dce4da;
                        background: white;
                        color: #69756d;
                    }

                    .modal-button.save {
                        border: 1px solid #57963f;
                        background:
                            linear-gradient(
                                135deg,
                                #67a94e,
                                #478b38
                            );
                        color: white;
                        box-shadow:
                            0 8px 20px
                            rgba(70, 137, 54, .16);
                    }

                    .modal-button:disabled {
                        opacity: .55;
                        cursor: not-allowed;
                    }

                    /* MOBILE */

                    @media (max-width: 1100px) {
                        .inventory-stats {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                        }
                    }

                    @media (max-width: 760px) {
                        .inventory-page {
                            padding: 20px 14px 40px;
                        }

                        .inventory-header {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .inventory-title h1 {
                            font-size: 26px;
                        }

                        .inventory-actions {
                            width: 100%;
                        }

                        .inventory-btn {
                            flex: 1;
                        }

                        .inventory-stats {
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                        }

                        .inventory-stat {
                            min-height: 110px;
                            padding: 16px;
                        }

                        .inventory-stat-value {
                            font-size: 21px;
                        }

                        .inventory-stat-value.money {
                            font-size: 16px;
                        }

                        .inventory-toolbar {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .inventory-search {
                            width: 100%;
                        }

                        .inventory-count {
                            text-align: right;
                        }

                        .inventory-modal-overlay {
                            padding: 10px;
                        }

                        .inventory-modal {
                            max-height: 96vh;
                            border-radius: 19px;
                        }

                        .inventory-form {
                            padding: 18px;
                        }

                        .form-grid {
                            grid-template-columns: 1fr;
                        }

                        .form-group.full {
                            grid-column: auto;
                        }

                        .modal-actions {
                            flex-direction: column-reverse;
                        }

                        .modal-button {
                            width: 100%;
                        }
                    }

                    @media (max-width: 450px) {
                        .inventory-stats {
                            grid-template-columns: 1fr;
                        }

                        .inventory-title-icon {
                            width: 50px;
                            height: 50px;
                            border-radius: 15px;
                        }

                        .inventory-actions {
                            flex-direction: column;
                        }

                        .inventory-btn {
                            width: 100%;
                            flex: none;
                        }
                    }
                `}</style>

                <div className="inventory-container">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="inventory-header">
                        <div className="inventory-title">
                            <div className="inventory-title-icon">
                                <Icon name="box" size={28} />
                            </div>

                            <div>
                                <span className="inventory-eyebrow">
                                    SOLARTECH ENERGY / ADMIN
                                </span>

                                <h1>Склад</h1>

                                <p>
                                    Управление товарами,
                                    остатками и ценами
                                </p>
                            </div>
                        </div>

                        <div className="inventory-actions">
                            <button
                                className="inventory-btn"
                                onClick={loadProducts}
                                disabled={loading}
                            >
                                <Icon
                                    name="refresh"
                                    size={16}
                                />

                                {loading
                                    ? "Загрузка..."
                                    : "Обновить"}
                            </button>

                            <button
                                className="inventory-btn inventory-btn-primary"
                                onClick={openCreate}
                            >
                                <Icon
                                    name="plus"
                                    size={17}
                                />

                                Добавить товар
                            </button>
                        </div>
                    </div>

                    {/* =================================================
                        ALERTS
                    ================================================= */}

                    {error && (
                        <div className="inventory-alert error">
                            <Icon
                                name="warning"
                                size={17}
                            />

                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="inventory-alert success">
                            <span
                                style={{
                                    fontSize: 18,
                                }}
                            >
                                ✓
                            </span>

                            <span>{success}</span>
                        </div>
                    )}

                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="inventory-stats">

                        <div className="inventory-stat">
                            <div className="inventory-stat-top">
                                <div className="inventory-stat-icon green">
                                    <Icon
                                        name="box"
                                        size={21}
                                    />
                                </div>
                            </div>

                            <span className="inventory-stat-label">
                                Всего товаров
                            </span>

                            <strong className="inventory-stat-value">
                                {products.length}
                            </strong>
                        </div>

                        <div className="inventory-stat">
                            <div className="inventory-stat-top">
                                <div className="inventory-stat-icon orange">
                                    <Icon
                                        name="warning"
                                        size={21}
                                    />
                                </div>
                            </div>

                            <span className="inventory-stat-label">
                                Нужно пополнить
                            </span>

                            <strong className="inventory-stat-value">
                                {lowStockCount}
                            </strong>
                        </div>

                        <div className="inventory-stat">
                            <div className="inventory-stat-top">
                                <div className="inventory-stat-icon red">
                                    <Icon
                                        name="battery"
                                        size={21}
                                    />
                                </div>
                            </div>

                            <span className="inventory-stat-label">
                                Нет на складе
                            </span>

                            <strong className="inventory-stat-value">
                                {outOfStockCount}
                            </strong>
                        </div>

                        <div className="inventory-stat">
                            <div className="inventory-stat-top">
                                <div className="inventory-stat-icon blue">
                                    <Icon
                                        name="money"
                                        size={21}
                                    />
                                </div>
                            </div>

                            <span className="inventory-stat-label">
                                Стоимость склада
                            </span>

                            <strong className="inventory-stat-value money">
                                {formatPrice(
                                    totalStockValue,
                                )}
                            </strong>
                        </div>

                    </div>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="inventory-card">

                        <div className="inventory-toolbar">

                            <div className="inventory-search">
                                <Icon
                                    name="search"
                                    size={17}
                                />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Поиск товара, модели или категории..."
                                />
                            </div>

                            <div className="inventory-count">
                                Показано{" "}
                                <strong>
                                    {
                                        filteredProducts.length
                                    }
                                </strong>{" "}
                                из{" "}
                                <strong>
                                    {products.length}
                                </strong>
                            </div>

                        </div>

                        {loading ? (
                            <div className="inventory-loading">
                                <div className="inventory-spinner" />

                                Загружаем товары...
                            </div>
                        ) : filteredProducts.length ===
                        0 ? (
                            <div className="inventory-empty">

                                <div className="inventory-empty-icon">
                                    <Icon
                                        name="search"
                                        size={28}
                                    />
                                </div>

                                <h3>
                                    Товары не найдены
                                </h3>

                                <p>
                                    Измените запрос поиска
                                    или добавьте новый товар.
                                </p>

                            </div>
                        ) : (
                            <div className="inventory-table-wrap">

                                <table className="inventory-table">

                                    <thead>
                                    <tr>
                                        <th>
                                            Товар
                                        </th>

                                        <th>
                                            Категория
                                        </th>

                                        <th>
                                            Характеристика
                                        </th>

                                        <th>
                                            Цена
                                        </th>

                                        <th>
                                            Остаток
                                        </th>

                                        <th>
                                            Статус
                                        </th>

                                        <th>
                                            Действия
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filteredProducts.map(
                                        (product) => {
                                            const isEmpty =
                                                product.stock_quantity ===
                                                0;

                                            const lowStock =
                                                product.stock_quantity <=
                                                product.min_stock;

                                            return (
                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                >

                                                    {/* PRODUCT */}

                                                    <td>
                                                        <div className="product-main">

                                                            <div className="product-icon">
                                                                {getCategoryIcon(
                                                                    product.category_id,
                                                                )}
                                                            </div>

                                                            <div className="product-main-info">
                                                                    <span className="product-name">
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </span>

                                                                <span className="product-model">
                                                                        {product.model
                                                                            ? product.model
                                                                            : `ID #${product.id}`}
                                                                    </span>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    {/* CATEGORY */}

                                                    <td>
                                                            <span className="category-badge">
                                                                <span className="category-dot" />

                                                                {
                                                                    getCategoryShort(
                                                                        product.category_id,
                                                                    )
                                                                }
                                                            </span>
                                                    </td>

                                                    {/* SPEC */}

                                                    <td>
                                                        {product.power_w >
                                                        0 ? (
                                                            <>
                                                                    <span className="spec-main">
                                                                        {product.power_w.toLocaleString(
                                                                            "ru-RU",
                                                                        )}{" "}
                                                                        W
                                                                    </span>

                                                                {product.warranty_months >
                                                                    0 && (
                                                                        <span className="spec-sub">
                                                                            Гарантия{" "}
                                                                            {
                                                                                product.warranty_months
                                                                            }{" "}
                                                                            мес.
                                                                        </span>
                                                                    )}
                                                            </>
                                                        ) : product.capacity_kwh >
                                                        0 ? (
                                                            <>
                                                                    <span className="spec-main">
                                                                        {
                                                                            product.capacity_kwh
                                                                        }{" "}
                                                                        kWh
                                                                    </span>

                                                                {product.warranty_months >
                                                                    0 && (
                                                                        <span className="spec-sub">
                                                                            Гарантия{" "}
                                                                            {
                                                                                product.warranty_months
                                                                            }{" "}
                                                                            мес.
                                                                        </span>
                                                                    )}
                                                            </>
                                                        ) : (
                                                            <span className="spec-main">
                                                                    —
                                                                </span>
                                                        )}
                                                    </td>

                                                    {/* PRICE */}

                                                    <td>
                                                            <span className="price-main">
                                                                {formatPrice(
                                                                    product.price,
                                                                )}
                                                            </span>
                                                    </td>

                                                    {/* STOCK */}

                                                    <td>
                                                            <span
                                                                className={
                                                                    isEmpty
                                                                        ? "stock-badge empty"
                                                                        : lowStock
                                                                            ? "stock-badge low"
                                                                            : "stock-badge"
                                                                }
                                                            >
                                                                {isEmpty
                                                                    ? "Нет"
                                                                    : `${product.stock_quantity} шт.`}
                                                            </span>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td>
                                                        {product.is_active ? (
                                                            <span className="status-badge active">
                                                                    <span className="status-dot" />
                                                                    Активен
                                                                </span>
                                                        ) : (
                                                            <span className="status-badge inactive">
                                                                    <span className="status-dot" />
                                                                    Выключен
                                                                </span>
                                                        )}
                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td>
                                                        <div className="product-actions">

                                                            <button
                                                                className="table-action edit"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        product,
                                                                    )
                                                                }
                                                                title="Редактировать"
                                                                aria-label="Редактировать"
                                                            >
                                                                <Icon
                                                                    name="edit"
                                                                    size={16}
                                                                />
                                                            </button>

                                                            <button
                                                                className="table-action delete"
                                                                onClick={() =>
                                                                    deleteProduct(
                                                                        product,
                                                                    )
                                                                }
                                                                title="Удалить"
                                                                aria-label="Удалить"
                                                            >
                                                                <Icon
                                                                    name="trash"
                                                                    size={16}
                                                                />
                                                            </button>

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

                {/* =====================================================
                    MODAL
                ===================================================== */}

                {showModal && (
                    <div
                        className="inventory-modal-overlay"
                        onClick={closeModal}
                    >
                        <div
                            className="inventory-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="inventory-modal-header">

                                <div>
                                    <span className="modal-eyebrow">
                                        SOLARTECH / PRODUCT
                                    </span>

                                    <h2>
                                        {editingProduct
                                            ? "Редактировать товар"
                                            : "Добавить товар"}
                                    </h2>

                                    <p>
                                        {editingProduct
                                            ? "Измените данные товара и сохраните изменения."
                                            : "Добавьте новый товар на склад."}
                                    </p>
                                </div>

                                <button
                                    className="modal-close"
                                    onClick={closeModal}
                                    disabled={saving}
                                    aria-label="Закрыть"
                                >
                                    <Icon
                                        name="close"
                                        size={18}
                                    />
                                </button>

                            </div>

                            <div className="inventory-form">

                                <div className="form-section-title">
                                    Основная информация
                                </div>

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>
                                            Название товара *
                                        </label>

                                        <input
                                            className="form-input"
                                            value={
                                                form.name
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "name",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="JA Solar 630W"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Модель
                                        </label>

                                        <input
                                            className="form-input"
                                            value={
                                                form.model
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "model",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="JAM72D40"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Производитель ID *
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="1"
                                            value={
                                                form.manufacturer_id
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "manufacturer_id",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="1"
                                        />

                                        <span className="form-hint">
                                            ID производителя
                                            из базы данных
                                        </span>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Категория *
                                        </label>

                                        <select
                                            className="form-input"
                                            value={
                                                form.category_id
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "category_id",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Выберите категорию
                                            </option>

                                            <option value="1">
                                                Солнечные панели
                                            </option>

                                            <option value="2">
                                                Аккумуляторы
                                            </option>

                                            <option value="3">
                                                Инверторы
                                            </option>
                                        </select>
                                    </div>

                                </div>

                                <div
                                    className="form-section-title"
                                    style={{
                                        marginTop: 27,
                                    }}
                                >
                                    Характеристики
                                </div>

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>
                                            Мощность, W
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            value={
                                                form.power_w
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "power_w",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="630"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Ёмкость, kWh
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.capacity_kwh
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "capacity_kwh",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="16"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Гарантия, месяцев
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            value={
                                                form.warranty_months
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "warranty_months",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="36"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Минимальный запас
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            value={
                                                form.min_stock
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "min_stock",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="5"
                                        />
                                    </div>

                                </div>

                                <div
                                    className="form-section-title"
                                    style={{
                                        marginTop: 27,
                                    }}
                                >
                                    Цена и склад
                                </div>

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>
                                            Цена продажи, TJS
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.price
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "price",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="1500"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Себестоимость, TJS
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.cost_price
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "cost_price",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="1200"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Количество на складе
                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            value={
                                                form.stock_quantity
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "stock_quantity",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="10"
                                        />
                                    </div>

                                </div>

                                <div
                                    className="form-section-title"
                                    style={{
                                        marginTop: 27,
                                    }}
                                >
                                    Описание
                                </div>

                                <div className="form-group">
                                    <label>
                                        Описание товара
                                    </label>

                                    <textarea
                                        className="form-textarea"
                                        value={
                                            form.description
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Описание товара, характеристики и дополнительная информация..."
                                    />
                                </div>

                                <div className="active-row">

                                    <div className="active-row-info">
                                        <strong>
                                            Товар активен
                                        </strong>

                                        <span>
                                            Активный товар
                                            отображается в
                                            каталоге сайта.
                                        </span>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.is_active
                                            }
                                            onChange={(e) =>
                                                updateField(
                                                    "is_active",
                                                    e.target
                                                        .checked,
                                                )
                                            }
                                        />

                                        <span className="switch-slider" />
                                    </label>

                                </div>

                                <div className="modal-actions">

                                    <button
                                        className="modal-button cancel"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Отмена
                                    </button>

                                    <button
                                        className="modal-button save"
                                        onClick={saveProduct}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Сохраняем..."
                                            : editingProduct
                                                ? "Сохранить изменения"
                                                : "Добавить товар"}
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}

export default AdminInventory;