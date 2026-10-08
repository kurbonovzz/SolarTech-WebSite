import { useEffect, useState } from "react";
import "./App.css";

import AdminLogin from "./admin/AdminLogin";
import AdminOrders from "./admin/AdminOrders";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSection from "./admin/AdminSection";
import AdminCustomers from "./admin/AdminCustomers";
import AdminInventory from "./admin/AdminInventory";
import AdminProducts from "./admin/AdminProducts";

type EquipmentType = {
    id: number;
    name: string;
    default_power_w: number;
    description: string;
    is_active: boolean;
    power_factor: number;
};

type Equipment = {
    equipment_type_id: number;
    quantity: number;
};

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

const FALLBACK_EQUIPMENT_TYPES: EquipmentType[] = [
    { id: 11, name: "Освещение", default_power_w: 1000, description: "Общая мощность освещения дома", is_active: true, power_factor: 1 },
    { id: 4, name: "Кондиционер", default_power_w: 1500, description: "Бытовой кондиционер", is_active: true, power_factor: 1 },
    { id: 18, name: "Термекс", default_power_w: 2000, description: "Водонагреватель для дома", is_active: true, power_factor: 1 },
    { id: 8, name: "Пылесос", default_power_w: 1800, description: "Бытовой пылесос", is_active: true, power_factor: 1 },
    { id: 9, name: "Утюг", default_power_w: 2200, description: "Электрический утюг", is_active: true, power_factor: 1 },
    { id: 15, name: "Фен", default_power_w: 1800, description: "Электрический фен", is_active: true, power_factor: 1 },
    { id: 5, name: "Телевизор", default_power_w: 150, description: "Телевизор", is_active: true, power_factor: 1 },
    { id: 13, name: "Тёплый пол", default_power_w: 1500, description: "Электрический тёплый пол", is_active: true, power_factor: 1 },
    { id: 6, name: "Стиральная машина", default_power_w: 2000, description: "Стиральная машина", is_active: true, power_factor: 1 },
    { id: 3, name: "Холодильник", default_power_w: 250, description: "Бытовой холодильник", is_active: true, power_factor: 1 },
    { id: 16, name: "Плита электрическая", default_power_w: 5000, description: "Электрическая плита", is_active: true, power_factor: 1 },
    { id: 17, name: "Духовка", default_power_w: 3000, description: "Электрическая духовка", is_active: true, power_factor: 1 },
    { id: 19, name: "Насос для воды", default_power_w: 1500, description: "Насос для воды", is_active: true, power_factor: 1 },
    { id: 12, name: "Радиатор", default_power_w: 2000, description: "Электрический радиатор", is_active: true, power_factor: 1 },
    { id: 14, name: "Керхер-мойка", default_power_w: 2200, description: "Мойка высокого давления", is_active: true, power_factor: 1 },
];

const FALLBACK_PRODUCTS: Product[] = [
    { id: 1, manufacturer_id: 1, category_id: 1, name: "JA Solar 630W", model: "JAM72D40", description: "Solar panel 630W for photovoltaic systems", power_w: 630, capacity_kwh: 0, price: 1500, cost_price: 3000, stock_quantity: 13, min_stock: 10, warranty_months: 144, is_active: true },
    { id: 3, manufacturer_id: 1, category_id: 2, name: "PV SYS 10 kWh", model: "PV SYS 10 kWh", description: "Аккумулятор PV SYS, 51.2 В, 314 А·ч, ёмкость 10 кВт·ч", power_w: 0, capacity_kwh: 10, price: 14000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 4, manufacturer_id: 1, category_id: 2, name: "PV SYS 16 kWh", model: "PV SYS 16 kWh", description: "Аккумулятор PV SYS, 51.2 В, 314 А·ч, ёмкость 16 кВт·ч", power_w: 0, capacity_kwh: 16, price: 17000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 5, manufacturer_id: 1, category_id: 3, name: "PV SYS 5.5 kW", model: "PV SYS 5.5 kW", description: "Однофазный инвертор PV SYS, мощность 5.5 кВт", power_w: 5500, capacity_kwh: 0, price: 7000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 6, manufacturer_id: 1, category_id: 3, name: "PV SYS 10 kW", model: "PV SYS 10 kW", description: "Однофазный инвертор PV SYS, мощность 10 кВт", power_w: 10000, capacity_kwh: 0, price: 11000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 7, manufacturer_id: 1, category_id: 3, name: "PV SYS 3.5 kW", model: "PV SYS 3.5 kW", description: "Однофазный инвертор PV SYS, мощность 3.5 кВт", power_w: 3500, capacity_kwh: 0, price: 4500, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 8, manufacturer_id: 1, category_id: 3, name: "PV SYS 15 kW", model: "PV SYS 15 kW", description: "Однофазный инвертор PV SYS, мощность 15 кВт", power_w: 15000, capacity_kwh: 0, price: 13000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 9, manufacturer_id: 1, category_id: 3, name: "PV SYS 20 kW", model: "PV SYS 20 kW", description: "Однофазный инвертор PV SYS, мощность 20 кВт", power_w: 20000, capacity_kwh: 0, price: 16000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
    { id: 11, manufacturer_id: 1, category_id: 3, name: "PV SYS 25 kW", model: "PV SYS 25 kW", description: "Однофазный инвертор PV SYS, мощность 25 кВт", power_w: 25000, capacity_kwh: 0, price: 19000, cost_price: 0, stock_quantity: 0, min_stock: 0, warranty_months: 36, is_active: true },
];

type PackageItem = {
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

type SystemPackage = {
    id: number;
    name: string;
    system_power_kw: number;
    description: string;
    total_price: number;
    is_active: boolean;
};
type CalculatorResult = {
    total_power_w: number;
    total_power_kw: number;

    simultaneous_power_w?: number;
    simultaneous_power_kw?: number;

    required_power_w: number;
    required_power_kw: number;

    recommended_system_kw: number;

    daily_energy_wh?: number;
    daily_energy_kwh?: number;

    seasonal_adjustment?: boolean;
    calculation_message?: string;

    system_package: SystemPackage | null;
    package_items: PackageItem[] | null;
    package_total_price: number;
    message?: string;
};

/* =========================================================
   ADMIN ROUTER
========================================================= */

function App() {
    const path = window.location.pathname;

    if (path === "/admin/login") {
        return <AdminLogin />;
    }

    if (path === "/admin") {
        return <AdminDashboard />;
    }

    if (path === "/admin/orders") {
        return <AdminOrders />;
    }

    if (path === "/admin/customers") {
        return <AdminCustomers />;
    }

    if (path === "/admin/inventory") {
        return <AdminInventory />;
    }

    if (path === "/admin/products") {
        return <AdminProducts />;
    }

    if (
        path === "/admin/equipment-types" ||
        path === "/admin/packages"
    ) {
        return <AdminSection />;
    }

    // Все остальные адреса открывают клиентский сайт
    return <ClientSite />;
}

/* =========================================================
   CLIENT SITE
========================================================= */

/* =========================================================
   CLIENT SITE
========================================================= */

const API_URL = (() => {
    const configured = (import.meta.env.VITE_API_URL || "").trim();

    if (configured) {
        try {
            const url = new URL(configured);

            // If VITE_API_URL still contains localhost/127.0.0.1,
            // replace it with the host that opened the website.
            // This is important when the site is opened from a phone
            // through 192.168.0.156.
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
            // Fall through to the automatic local-network URL.
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

function ClientSite() {
    const [equipmentTypes, setEquipmentTypes] =
        useState<EquipmentType[]>([]);

    const [equipment, setEquipment] =
        useState<Equipment[]>([]);

    const [result, setResult] =
        useState<CalculatorResult | null>(null);

    const [loadingEquipment, setLoadingEquipment] =
        useState(true);

    const [loadingCalculator, setLoadingCalculator] =
        useState(false);

    const [showOrderForm, setShowOrderForm] =
        useState(false);

    const [sendingOrder, setSendingOrder] =
        useState(false);

    const [orderSuccess, setOrderSuccess] =
        useState(false);

    const [mobileMenu, setMobileMenu] =
        useState(false);

    const [showContacts, setShowContacts] =
        useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<
        "panels" | "inverters" | "batteries" | null
    >(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadEquipmentTypes();
        loadProducts();
    }, []);

    /* =====================================================
       LOAD EQUIPMENT
    ===================================================== */

    const loadEquipmentTypes = async () => {
        try {
            setLoadingEquipment(true);
            setError("");

            const response = await fetch(
                `${API_URL}/equipment-types`,
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось загрузить оборудование",
                );
            }

            const apiTypes: EquipmentType[] = Array.isArray(data.equipment_types)
                ? data.equipment_types
                : [];

            const types: EquipmentType[] = (apiTypes.length > 0
                    ? apiTypes
                    : FALLBACK_EQUIPMENT_TYPES
            ).filter((type: EquipmentType) => type.is_active !== false);

            // Убираем дубли техники, которые могут прийти из БД.
            // Например, два одинаковых "Кондиционер" показывать клиенту не нужно.
            const uniqueTypes: EquipmentType[] = Array.from(
                new Map<string, EquipmentType>(
                    types.map((type) => [
                        getEquipmentDisplayName(type).toLowerCase(),
                        type,
                    ]),
                ).values(),
            );

            setEquipmentTypes(uniqueTypes);

            setEquipment(
                uniqueTypes.map((type) => ({
                    equipment_type_id: type.id,
                    quantity: 0,
                })),
            );
        } catch (err) {
            console.error("Equipment loading error:", err);

            // Даже если API временно недоступен, калькулятор остаётся рабочим.
            setEquipmentTypes(FALLBACK_EQUIPMENT_TYPES);
            setEquipment(
                FALLBACK_EQUIPMENT_TYPES.map((type) => ({
                    equipment_type_id: type.id,
                    quantity: 0,
                })),
            );
        } finally {
            setLoadingEquipment(false);
        }
    };

    const loadProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await fetch(`${API_URL}/products`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Не удалось загрузить каталог.",
                );
            }

            const apiProducts: Product[] = Array.isArray(data.products)
                ? data.products
                : [];

            const activeProducts: Product[] = (apiProducts.length > 0
                    ? apiProducts
                    : FALLBACK_PRODUCTS
            ).filter((product: Product) => product.is_active !== false);

            setProducts(activeProducts);
        } catch (err) {
            // Каталог не должен оставаться пустым из-за временной ошибки API.
            console.error("Products loading error:", err);
            setProducts(FALLBACK_PRODUCTS);
        } finally {
            setLoadingProducts(false);
        }
    };

    const getCategoryProducts = (
        category: "panels" | "inverters" | "batteries",
    ) => {
        const categoryID =
            category === "panels"
                ? 1
                : category === "batteries"
                    ? 2
                    : 3;

        const filtered = products.filter((product) => {
            const categoryMatches = Number(product.category_id) === categoryID;
            const text = `${product.name || ""} ${product.model || ""} ${product.description || ""}`.toLowerCase();

            if (categoryMatches) return true;
            if (category === "panels") return /panel|solar|панел/.test(text);
            if (category === "batteries") return /battery|batter|аккум|батар|kwh/.test(text);
            return /inverter|инвертор|\bkw\b/.test(text);
        });

        // Убираем одинаковые товары, если в БД случайно есть дубль.
        return Array.from(
            new Map<string, Product>(
                filtered.map((product) => [
                    `${product.name}|${product.model}`.toLowerCase(),
                    product,
                ]),
            ).values(),
        );
    };

    const getCategoryTitle = (
        category: "panels" | "inverters" | "batteries",
    ) => {
        if (category === "panels") return "Солнечные панели";
        if (category === "inverters") return "Инверторы";
        return "Аккумуляторы";
    };

    const getCategoryImage = (
        category: "panels" | "inverters" | "batteries",
    ) => {
        if (category === "panels") {
            return "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=85";
        }
        if (category === "inverters") {
            return "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85";
        }
        return "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1200&q=85";
    };

    const openCatalog = (
        category: "panels" | "inverters" | "batteries",
    ) => {
        setSelectedProduct(null);
        setSelectedCategory(category);
        if (products.length === 0) {
            loadProducts();
        }
    };

    /* =====================================================
       QUANTITY
    ===================================================== */

    const getQuantity = (id: number) =>
        equipment.find(
            (item) =>
                item.equipment_type_id === id,
        )?.quantity || 0;

    const updateQuantity = (
        id: number,
        quantity: number,
    ) => {
        setEquipment((current) =>
            current.map((item) =>
                item.equipment_type_id === id
                    ? {
                        ...item,
                        quantity: Math.max(
                            0,
                            quantity,
                        ),
                    }
                    : item,
            ),
        );
    };

    const changeQuantity = (
        id: number,
        amount: number,
    ) => {
        updateQuantity(
            id,
            getQuantity(id) + amount,
        );
    };

    /* =====================================================
       CALCULATOR
    ===================================================== */

    const calculateSystem = async () => {
        setError("");
        setResult(null);
        setShowOrderForm(false);
        setOrderSuccess(false);

        const selectedEquipment =
            equipment.filter(
                (item) => item.quantity > 0,
            );

        if (selectedEquipment.length === 0) {
            setError(
                "Выберите хотя бы один прибор.",
            );
            return;
        }

        setLoadingCalculator(true);

        try {
            const calculatorEquipment = selectedEquipment.map((item) => {
                const type = equipmentTypes.find(
                    (equipmentType) => equipmentType.id === item.equipment_type_id,
                );

                const selectedPowerKw = type
                    ? Number((type.default_power_w / 1000).toFixed(3))
                    : 0;

                return {
                    equipment_type_id: item.equipment_type_id,
                    quantity: item.quantity,
                    selected_power_kw: selectedPowerKw,
                };
            });

            const response = await fetch(
                `${API_URL}/calculator/calculate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        equipment: calculatorEquipment,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                if (
                    data.error ===
                    "failed to find system package"
                ) {
                    setResult({
                        total_power_w: 0,
                        total_power_kw: 0,
                        required_power_w: 0,
                        required_power_kw: 0,
                        recommended_system_kw: 0,
                        system_package: null,
                        package_items: [],
                        package_total_price: 0,
                        message:
                            "Для этой нагрузки нужен индивидуальный расчёт.",
                    });

                    return;
                }

                throw new Error(
                    data.error ||
                    "Ошибка расчёта",
                );
            }

            setResult(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось выполнить расчёт.",
            );
        } finally {
            setLoadingCalculator(false);
        }
    };

    /* =====================================================
       ORDER
    ===================================================== */

    const submitOrder = async () => {
        setError("");

        if (!result?.system_package) {
            setError(
                "Сначала рассчитайте систему.",
            );
            return;
        }

        if (!name.trim()) {
            setError("Введите ваше имя.");
            return;
        }

        if (!phone.trim()) {
            setError(
                "Введите номер телефона.",
            );
            return;
        }

        setSendingOrder(true);

        try {
            const response = await fetch(
                `${API_URL}/public/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        phone: phone.trim(),
                        system_package_id:
                        result.system_package.id,
                        comment: comment.trim(),
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось отправить заявку.",
                );
            }

            setOrderSuccess(true);
            setShowOrderForm(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось отправить заявку.",
            );
        } finally {
            setSendingOrder(false);
        }
    };

    /* =====================================================
       EQUIPMENT DISPLAY
       Показываем клиенту нормальные русские названия,
       даже если backend вернул английское название.
    ===================================================== */

    const getEquipmentDisplayName = (type: EquipmentType) => {
        const text = `${type.name} ${type.description}`.toLowerCase();

        if (/air conditioner|кондиционер|кондиц/.test(text)) return "Кондиционер";
        if (/water heater|водонагреватель|бойлер|термекс/.test(text)) return "Термекс";
        if (/refrigerator|холодильник/.test(text)) return "Холодильник";
        if (/washing machine|стиральная машина|стирал/.test(text)) return "Стиральная машина";
        if (/television|телевизор|tv/.test(text)) return "Телевизор";
        if (/kettle|электрочайник|чайник/.test(text)) return "Электрочайник";
        if (/vacuum|пылесос/.test(text)) return "Пылесос";
        if (/iron|утюг/.test(text)) return "Утюг";
        if (/hair dryer|фен/.test(text)) return "Фен";
        if (/microwave|микроволнов/.test(text)) return "Микроволновка";
        if (/lighting|освещ/.test(text)) return "Освещение";
        if (/floor heating|тёплый пол|теплый пол/.test(text)) return "Тёплый пол";
        if (/electric stove|электрическая плита|плита электрическая/.test(text)) return "Плита электрическая";
        if (/oven|духовка/.test(text)) return "Духовка";
        if (/water pump|насос для воды|водяной насос/.test(text)) return "Насос для воды";
        if (/radiator|радиатор/.test(text)) return "Радиатор";
        if (/karcher|карчер|керхер|мойка/.test(text)) return "Керхер-мойка";

        return type.name;
    };

    const getEquipmentDescription = (type: EquipmentType) => {
        const name = getEquipmentDisplayName(type);
        const descriptions: Record<string, string> = {
            "Освещение": "Общая мощность освещения дома",
            "Кондиционер": "Бытовой кондиционер",
            "Термекс": "Водонагреватель для дома",
            "Пылесос": "Бытовой пылесос",
            "Утюг": "Электрический утюг",
            "Фен": "Электрический фен",
            "Телевизор": "Телевизор",
            "Тёплый пол": "Электрический тёплый пол",
            "Стиральная машина": "Стиральная машина",
            "Холодильник": "Бытовой холодильник",
            "Плита электрическая": "Электрическая плита",
            "Духовка": "Электрическая духовка",
            "Насос для воды": "Насос для воды",
            "Радиатор": "Электрический радиатор",
            "Керхер-мойка": "Мойка высокого давления",
            "Электрочайник": "Электрический чайник",
            "Микроволновка": "Микроволновая печь",
        };

        return descriptions[name] || type.description || "Электроприбор";
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const scrollTo = (id: string) => {
        setMobileMenu(false);

        document
            .getElementById(id)
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };

    return (
        <div className="solar-client">
            {/* =================================================
                HEADER
            ================================================= */}

            <header className="solar-header-client">
                <div
                    className="solar-brand"
                    onClick={() => scrollTo("home")}
                >
                    <div className="solar-brand-icon">
                        ☀
                    </div>

                    <div>
                        <div className="solar-brand-name">
                            Solar<span>Tech</span>
                        </div>

                        <div className="solar-brand-sub">
                            ENERGY
                        </div>
                    </div>
                </div>

                <nav
                    className={`solar-client-nav ${
                        mobileMenu
                            ? "mobile-open"
                            : ""
                    }`}
                >
                    <button
                        onClick={() =>
                            scrollTo("home")
                        }
                    >
                        Главная
                    </button>

                    <button
                        onClick={() =>
                            scrollTo("solutions")
                        }
                    >
                        Решения
                    </button>

                    <button
                        onClick={() =>
                            scrollTo("calculator")
                        }
                    >
                        Калькулятор
                    </button>

                    <button
                        onClick={() =>
                            scrollTo("projects")
                        }
                    >
                        Проекты
                    </button>

                    <button
                        onClick={() => {
                            setMobileMenu(false);
                            setShowContacts(true);
                        }}
                    >
                        Контакты
                    </button>
                </nav>

                <button
                    className="solar-header-cta"
                    onClick={() =>
                        scrollTo("calculator")
                    }
                >
                    Рассчитать систему
                    <span>↗</span>
                </button>

                <button
                    className="solar-mobile-button"
                    onClick={() =>
                        setMobileMenu(
                            !mobileMenu,
                        )
                    }
                >
                    ☰
                </button>
            </header>

            {/* =================================================
                HERO
            ================================================= */}

            <section
                id="home"
                className="solar-hero"
            >
                <div className="solar-hero-image" />

                <div className="solar-hero-overlay" />

                <div className="solar-hero-content">
                    <div className="solar-pill">
                        <span />
                        SOLARTECH ENERGY
                    </div>

                    <h1>
                        Энергия солнца.
                        <br />
                        <em>
                            Свобода вашего дома.
                        </em>
                    </h1>

                    <p>
                        Современные солнечные
                        системы для дома и
                        бизнеса. Рассчитайте
                        необходимую мощность за
                        несколько секунд.
                    </p>

                    <div className="solar-hero-buttons">
                        <button
                            className="solar-main-button"
                            onClick={() =>
                                scrollTo(
                                    "calculator",
                                )
                            }
                        >
                            Рассчитать систему
                            <span>↗</span>
                        </button>

                        <button
                            className="solar-outline-button"
                            onClick={() =>
                                scrollTo(
                                    "solutions",
                                )
                            }
                        >
                            Смотреть решения
                        </button>
                    </div>

                    <div className="solar-hero-stats">
                        <div>
                            <strong>
                                24/7
                            </strong>
                            <span>
                                доступная энергия
                            </span>
                        </div>

                        <div>
                            <strong>
                                100%
                            </strong>
                            <span>
                                солнечная энергия
                            </span>
                        </div>

                        <div>
                            <strong>
                                Smart
                            </strong>
                            <span>
                                современные системы
                            </span>
                        </div>
                    </div>
                </div>

                <div className="solar-hero-floating">
                    <div className="floating-icon">
                        ☀
                    </div>

                    <div>
                        <span>
                            SOLAR ENERGY
                        </span>

                        <strong>
                            Чистая энергия
                        </strong>
                    </div>
                </div>

                <div className="solar-scroll">
                    SCROLL
                    <span>↓</span>
                </div>
            </section>

            {/* =================================================
                INTRO
            ================================================= */}

            <section className="solar-intro">
                <div className="solar-intro-label">
                    SOLARTECH / 01
                </div>

                <div>
                    <h2>
                        Энергия, которую
                        <br />
                        <span>
                            контролируете вы.
                        </span>
                    </h2>

                    <p>
                        Мы создаём солнечные
                        решения, которые помогают
                        получать собственную
                        энергию, хранить её и
                        использовать тогда, когда
                        она нужна.
                    </p>
                </div>
            </section>

            {/* =================================================
                SOLUTIONS
            ================================================= */}

            <section
                id="solutions"
                className="solar-solutions"
            >
                <div className="solar-section-top">
                    <div>
                        <span>
                            OUR SOLUTIONS
                        </span>

                        <h2>
                            Всё для вашей
                            <br />
                            <strong>
                                энергетической системы.
                            </strong>
                        </h2>
                    </div>

                    <p>
                        Подберём оборудование
                        под ваш дом, бизнес и
                        реальное потребление.
                    </p>
                </div>

                <div className="solar-solution-grid">
                    <article
                        className="solar-solution solar-solution-large"
                        role="button"
                        tabIndex={0}
                        onClick={() => openCatalog("panels")}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openCatalog("panels"); }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=85"
                            alt="Солнечные панели"
                        />

                        <div className="solar-solution-gradient" />

                        <div className="solar-solution-content">
                            <span>
                                01 / SOLAR
                            </span>

                            <h3>
                                Солнечные
                                <br />
                                панели
                            </h3>

                            <p>
                                Производство
                                чистой энергии
                                непосредственно
                                от солнца.
                            </p>

                            <div className="solar-round-arrow">
                                ↗
                            </div>
                        </div>
                    </article>

                    <article
                        className="solar-solution"
                        role="button"
                        tabIndex={0}
                        onClick={() => openCatalog("inverters")}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openCatalog("inverters"); }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=85"
                            alt="Энергетическая система"
                        />

                        <div className="solar-solution-gradient" />

                        <div className="solar-solution-content">
                            <span>
                                02 / POWER
                            </span>

                            <h3>
                                Инверторы
                            </h3>

                            <p>
                                Стабильное
                                преобразование
                                энергии.
                            </p>

                            <div className="solar-round-arrow">
                                ↗
                            </div>
                        </div>
                    </article>

                    <article
                        className="solar-solution"
                        role="button"
                        tabIndex={0}
                        onClick={() => openCatalog("batteries")}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openCatalog("batteries"); }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1000&q=85"
                            alt="Солнечная энергетика"
                        />

                        <div className="solar-solution-gradient" />

                        <div className="solar-solution-content">
                            <span>
                                03 / STORAGE
                            </span>

                            <h3>
                                Аккумуляторы
                            </h3>

                            <p>
                                Сохраняйте энергию
                                для нужного
                                момента.
                            </p>

                            <div className="solar-round-arrow">
                                ↗
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            {selectedCategory && (
                <div
                    className="solar-catalog-overlay"
                    onClick={() => {
                        setSelectedCategory(null);
                        setSelectedProduct(null);
                    }}
                >
                    <div
                        className="solar-catalog-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="solar-catalog-close"
                            onClick={() => {
                                setSelectedCategory(null);
                                setSelectedProduct(null);
                            }}
                            aria-label="Закрыть каталог"
                        >
                            ×
                        </button>

                        <div className="solar-catalog-top">
                            <div>
                                <span>CATALOG / SOLARTECH</span>
                                <h2>{getCategoryTitle(selectedCategory)}</h2>
                                <p>
                                    Оборудование SolarTech. Нажмите на товар,
                                    чтобы посмотреть характеристики.
                                </p>
                            </div>
                            <img
                                src={getCategoryImage(selectedCategory)}
                                alt={getCategoryTitle(selectedCategory)}
                            />
                        </div>

                        {loadingProducts ? (
                            <div className="solar-catalog-loading">
                                Загружаем каталог...
                            </div>
                        ) : getCategoryProducts(selectedCategory).length === 0 ? (
                            <div className="solar-catalog-empty">
                                В этой категории пока нет товаров.
                            </div>
                        ) : (
                            <div className="solar-product-grid">
                                {getCategoryProducts(selectedCategory).map((product) => (
                                    <button
                                        type="button"
                                        className="solar-product-card"
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div className="solar-product-icon">
                                            {selectedCategory === "panels" ? "☀" : selectedCategory === "inverters" ? "⚡" : "🔋"}
                                        </div>
                                        <div className="solar-product-card-body">
                                            <span>{product.model || "SolarTech"}</span>
                                            <strong>{product.name}</strong>
                                            <small>
                                                {product.power_w > 0
                                                    ? `${product.power_w.toLocaleString("ru-RU")} W`
                                                    : `${product.capacity_kwh} kWh`}
                                            </small>
                                        </div>
                                        <b>↗</b>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedProduct && (
                            <div className="solar-product-detail">
                                <div className="solar-product-detail-head">
                                    <div>
                                        <span>ИНФОРМАЦИЯ О ТОВАРЕ</span>
                                        <h3>{selectedProduct.name}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProduct(null)}
                                        aria-label="Закрыть информацию"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p>{selectedProduct.description}</p>

                                <div className="solar-product-specs">
                                    <div>
                                        <span>Модель</span>
                                        <strong>{selectedProduct.model || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Мощность</span>
                                        <strong>
                                            {selectedProduct.power_w > 0
                                                ? `${selectedProduct.power_w.toLocaleString("ru-RU")} W`
                                                : "—"}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Ёмкость</span>
                                        <strong>
                                            {selectedProduct.capacity_kwh > 0
                                                ? `${selectedProduct.capacity_kwh} kWh`
                                                : "—"}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Гарантия</span>
                                        <strong>{selectedProduct.warranty_months} мес.</strong>
                                    </div>
                                    <div>
                                        <span>Цена</span>
                                        <strong>
                                            {Number(selectedProduct.price || 0).toLocaleString("ru-RU")} TJS
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Наличие</span>
                                        <strong>{selectedProduct.stock_quantity} шт.</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =================================================
                WHY US
            ================================================= */}

            <section className="solar-why">
                <div className="solar-why-image">
                    <img
                        src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1400&q=85"
                        alt="SolarTech"
                    />
                </div>

                <div className="solar-why-content">
                    <span>
                        WHY SOLARTECH
                    </span>

                    <h2>
                        Не просто панели.
                        <br />
                        <strong>
                            Полная система.
                        </strong>
                    </h2>

                    <p>
                        Мы помогаем подобрать
                        оборудование исходя из
                        ваших реальных приборов
                        и потребления.
                    </p>

                    <div className="solar-feature-list">
                        <div>
                            <b>01</b>

                            <div>
                                <strong>
                                    Индивидуальный
                                    расчёт
                                </strong>

                                <span>
                                    Система под ваши
                                    потребности.
                                </span>
                            </div>
                        </div>

                        <div>
                            <b>02</b>

                            <div>
                                <strong>
                                    Надёжное
                                    оборудование
                                </strong>

                                <span>
                                    Панели, инверторы
                                    и аккумуляторы.
                                </span>
                            </div>
                        </div>

                        <div>
                            <b>03</b>

                            <div>
                                <strong>
                                    Готовое решение
                                </strong>

                                <span>
                                    От расчёта до
                                    установки.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                PROJECTS
            ================================================= */}

            <section
                id="projects"
                className="solar-projects"
            >
                <div className="solar-section-top">
                    <div>
                        <span>
                            PROJECTS
                        </span>

                        <h2>
                            Солнечная энергия
                            <br />
                            <strong>
                                в реальной жизни.
                            </strong>
                        </h2>
                    </div>

                    <p>
                        Создаём решения для
                        частных домов и бизнеса.
                    </p>
                </div>

                <div className="solar-gallery">
                    <div className="solar-gallery-main">
                        <img
                            src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=85"
                            alt="Solar panels house"
                        />

                        <div>
                            <span>
                                RESIDENTIAL
                            </span>

                            <strong>
                                Солнечная система
                                для дома
                            </strong>
                        </div>
                    </div>

                    <div className="solar-gallery-small">
                        <img
                            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=85"
                            alt="Solar installation"
                        />

                        <span>
        CLEAN ENERGY
    </span>
                    </div>

                    <div className="solar-gallery-small">
                        <img
                            src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=85"
                            alt="Solar energy"
                        />

                        <span>
                            SMART POWER
                        </span>
                    </div>
                </div>
            </section>

            {/* =================================================
                CALCULATOR
            ================================================= */}

            <section
                id="calculator"
                className="solar-calculator"
            >
                <div className="solar-calculator-heading">
                    <span>
                        SOLAR CALCULATOR / 02
                    </span>

                    <h2>
                        Рассчитайте свою
                        <br />
                        <strong>
                            систему.
                        </strong>
                    </h2>

                    <p>
                        Выберите приборы, которые
                        используются у вас дома.
                        Мы рассчитаем необходимую
                        мощность.
                    </p>
                </div>

                <div className="solar-calculator-layout">
                    {/* LEFT */}

                    <div className="solar-calc-box">
                        <div className="solar-calc-title">
                            <div>
                                <span>
                                    STEP 01
                                </span>

                                <h3>
                                    Что есть у вас
                                    дома?
                                </h3>
                            </div>

                            <div className="solar-step">
                                01
                            </div>
                        </div>

                        {loadingEquipment ? (
                            <div className="solar-loader">
                                <div />
                                Загружаем
                                оборудование...
                            </div>
                        ) : (
                            <div className="solar-equipment-grid">
                                {equipmentTypes.map(
                                    (type) => {
                                        const quantity =
                                            getQuantity(
                                                type.id,
                                            );

                                        return (
                                            <div
                                                key={
                                                    type.id
                                                }
                                                className={`solar-equipment ${
                                                    quantity >
                                                    0
                                                        ? "chosen"
                                                        : ""
                                                }`}
                                            >
                                                <div className="solar-equipment-icon">
                                                    ⚡
                                                </div>

                                                <div className="solar-equipment-info">
                                                    <strong>
                                                        {
                                                            getEquipmentDisplayName(type)
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            getEquipmentDescription(type)
                                                        }
                                                    </span>

                                                    <small>
                                                        {
                                                            type.default_power_w
                                                        }{" "}
                                                        W
                                                    </small>
                                                </div>

                                                <div className="solar-counter">
                                                    <button
                                                        onClick={() =>
                                                            changeQuantity(
                                                                type.id,
                                                                -1,
                                                            )
                                                        }
                                                        disabled={
                                                            quantity ===
                                                            0
                                                        }
                                                    >
                                                        −
                                                    </button>

                                                    <strong>
                                                        {
                                                            quantity
                                                        }
                                                    </strong>

                                                    <button
                                                        onClick={() =>
                                                            changeQuantity(
                                                                type.id,
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="solar-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="solar-calculate-button"
                            onClick={
                                calculateSystem
                            }
                            disabled={
                                loadingCalculator ||
                                loadingEquipment
                            }
                        >
                            {loadingCalculator
                                ? "Рассчитываем..."
                                : "Рассчитать мою систему"}

                            <span>↗</span>
                        </button>
                    </div>

                    {/* RIGHT */}

                    <div className="solar-result">
                        {!result ? (
                            <div className="solar-result-empty">
                                <div className="solar-result-icon">
                                    ☀
                                </div>

                                <span>
                                    YOUR RESULT
                                </span>

                                <h3>
                                    Здесь появится
                                    <br />
                                    ваша система
                                </h3>

                                <p>
                                    Выберите приборы и
                                    нажмите кнопку
                                    расчёта.
                                </p>
                            </div>
                        ) : (
                            <div className="solar-result-content">
                                <span className="solar-result-label">
                                    RECOMMENDED SYSTEM
                                </span>

                                <h3>
                                    SolarTech{" "}
                                    {
                                        result.recommended_system_kw
                                    }{" "}
                                    kW
                                </h3>

                                <div className="solar-result-power">
                                    {
                                        result.recommended_system_kw
                                    }
                                    <small>
                                        kW
                                    </small>
                                </div>

                                <div className="solar-result-stats">
                                    <div>
        <span>
            Все выбранные приборы
        </span>

                                        <strong>
                                            {Number(result.total_power_kw || 0).toFixed(2)} kW
                                        </strong>
                                    </div>

                                    <div>
        <span>
            Одновременная нагрузка
        </span>

                                        <strong>
                                            {Number(
                                                result.simultaneous_power_kw ??
                                                result.required_power_kw / 1.2
                                            ).toFixed(2)} kW
                                        </strong>
                                    </div>

                                    <div>
        <span>
            С учётом запаса 20%
        </span>

                                        <strong>
                                            {Number(result.required_power_kw || 0).toFixed(2)} kW
                                        </strong>
                                    </div>

                                    <div>
        <span>
            Суточное потребление
        </span>

                                        <strong>
                                            {Number(result.daily_energy_kwh || 0).toFixed(1)} kWh
                                        </strong>
                                    </div>
                                </div>

                                {result.seasonal_adjustment && (
                                    <div
                                        style={{
                                            marginTop: "12px",
                                            padding: "12px 14px",
                                            borderRadius: "12px",
                                            background: "rgba(167, 217, 94, 0.12)",
                                            border: "1px solid rgba(167, 217, 94, 0.28)",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                display: "block",
                                                color: "#b9df9e",
                                                fontSize: "13px",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            Расчёт учитывает сезонность
                                        </strong>

                                        <span
                                            style={{
                                                display: "block",
                                                color: "#c4d0c6",
                                                fontSize: "12px",
                                                lineHeight: 1.5,
                                            }}
                                        >
            {result.calculation_message ||
                "Не все приборы работают одновременно. Расчёт учитывает сезонность и обычный режим использования бытовой техники."}
        </span>
                                    </div>
                                )}

                                {result.system_package ? (
                                    <>
                                        <div className="solar-package">
                                            <strong>
                                                {
                                                    result
                                                        .system_package
                                                        .name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    result
                                                        .system_package
                                                        .description
                                                }
                                            </span>

                                            {result.package_items?.map(
                                                (
                                                    item,
                                                ) => (
                                                    <div
                                                        className="solar-package-row"
                                                        key={
                                                            item.id
                                                        }
                                                    >
                                                     <span>
    {
        item.category === "INVERTER"
            ? `Инвертор — ${item.product_name.replace("PV SYS ", "")}`
            : item.category === "BATTERY"
                ? `Аккумулятор — ${item.product_name.replace("PV SYS ", "")}`
                : item.product_name
    }
</span>

                                                        <strong>
                                                            ×
                                                            {
                                                                item.quantity
                                                            }
                                                        </strong>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="solar-result-price">
                                            <span>
                                                Стоимость
                                            </span>

                                            <strong>
                                                {result.package_total_price.toLocaleString(
                                                    "ru-RU",
                                                )}{" "}
                                                TJS
                                            </strong>
                                        </div>

                                        {!showOrderForm &&
                                            !orderSuccess && (
                                                <button
                                                    className="solar-order-button"
                                                    onClick={() =>
                                                        setShowOrderForm(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    Заказать эту
                                                    систему
                                                    <span>
                                                        ↗
                                                    </span>
                                                </button>
                                            )}

                                        {showOrderForm &&
                                            !orderSuccess && (
                                                <div className="solar-order-form">
                                                    <h4>
                                                        Оставить
                                                        заявку
                                                    </h4>

                                                    <input
                                                        value={
                                                            name
                                                        }
                                                        onChange={(
                                                            e,
                                                        ) =>
                                                            setName(
                                                                e
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Ваше имя"
                                                    />

                                                    <input
                                                        value={
                                                            phone
                                                        }
                                                        onChange={(
                                                            e,
                                                        ) =>
                                                            setPhone(
                                                                e
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="+992 XX XXX XX XX"
                                                    />

                                                    <textarea
                                                        value={
                                                            comment
                                                        }
                                                        onChange={(
                                                            e,
                                                        ) =>
                                                            setComment(
                                                                e
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Комментарий"
                                                    />

                                                    <button
                                                        onClick={
                                                            submitOrder
                                                        }
                                                        disabled={
                                                            sendingOrder
                                                        }
                                                    >
                                                        {sendingOrder
                                                            ? "Отправляем..."
                                                            : "Отправить заявку"}
                                                    </button>
                                                </div>
                                            )}
                                    </>
                                ) : (
                                    <div className="solar-individual">
                                        <strong>
                                            ⚡ Индивидуальный
                                            расчёт
                                        </strong>

                                        <p>
                                            Для этой
                                            нагрузки нет
                                            готового
                                            стандартного
                                            пакета.
                                        </p>
                                    </div>
                                )}

                                {orderSuccess && (
                                    <div className="solar-success">
                                        <strong>
                                            ✓ Заявка
                                            отправлена!
                                        </strong>

                                        <span>
                                            Наш специалист
                                            свяжется с
                                            вами.
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* =================================================
                CTA
            ================================================= */}

            <section
                id="contacts"
                className="solar-final"
            >
                <div className="solar-final-image" />

                <div className="solar-final-overlay" />

                <div className="solar-final-content">
                    <span>
                        SOLARTECH ENERGY
                    </span>

                    <h2>
                        Ваш дом.
                        <br />
                        <em>
                            Ваша энергия.
                        </em>
                    </h2>

                    <p>
                        Начните с простого
                        расчёта системы.
                    </p>

                    <button
                        onClick={() =>
                            scrollTo("calculator")
                        }
                    >
                        Рассчитать систему
                        <span>↗</span>
                    </button>
                </div>
            </section>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="solar-footer-client">
                <div className="solar-footer-brand">
                    <div className="solar-brand-icon">
                        ☀
                    </div>

                    <div>
                        <strong>
                            Solar<span>Tech</span>
                        </strong>

                        <small>
                            ENERGY
                        </small>
                    </div>
                </div>

                <div>
                    SolarTech Energy © 2026
                </div>

                <div>
                    Чистая энергия для будущего
                </div>
            </footer>

            {showContacts && (
                <div
                    className="solar-contact-overlay"
                    onClick={() => setShowContacts(false)}
                >
                    <div
                        className="solar-contact-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="solar-contact-close"
                            onClick={() => setShowContacts(false)}
                            aria-label="Закрыть"
                        >
                            ×
                        </button>

                        <div className="solar-contact-sun">☀</div>

                        <span className="solar-contact-label">
                            SOLARTECH ENERGY
                        </span>

                        <h2>
                            Свяжитесь
                            <br />
                            <span>с нами</span>
                        </h2>

                        <p>
                            Мы ответим на ваши вопросы и поможем
                            подобрать солнечную систему.
                        </p>

                        <div className="solar-contact-list">
                            <div className="solar-contact-card">
                                <div className="solar-contact-number">
                                    <span>Телефон 01</span>
                                    <strong>+992 90 100 0596</strong>
                                </div>

                                <div className="solar-contact-actions">
                                    <a
                                        href="tel:+992901000596"
                                        className="solar-call"
                                        aria-label="Позвонить"
                                    >
                                        ☎
                                    </a>
                                    <a
                                        href="https://wa.me/992901000596"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="solar-whatsapp"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>

                            <div className="solar-contact-card">
                                <div className="solar-contact-number">
                                    <span>Телефон 02</span>
                                    <strong>+992 90 000 0596</strong>
                                </div>

                                <div className="solar-contact-actions">
                                    <a
                                        href="tel:+992900000596"
                                        className="solar-call"
                                        aria-label="Позвонить"
                                    >
                                        ☎
                                    </a>
                                    <a
                                        href="https://wa.me/992900000596"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="solar-whatsapp"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="solar-contact-bottom">
                            <span>Ответим в WhatsApp</span>
                            <span>•</span>
                            <span>SolarTech Energy</span>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                STYLES
            ================================================= */}

            <style>{`
                * {
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    margin: 0;
                    background: #f5f6f1;
                    color: #142017;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        Arial,
                        sans-serif;
                }

                button,
                input,
                textarea {
                    font: inherit;
                }

                button {
                    cursor: pointer;
                }

                .solar-client {
                    min-height: 100vh;
                    overflow-x: hidden;
                    background: #f5f6f1;
                }

                /* CONTACT MODAL */

                .solar-contact-overlay {
                    position: fixed;
                    z-index: 5000;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(4, 12, 6, .72);
                    backdrop-filter: blur(14px);
                    animation: contactFade .2s ease;
                }

                .solar-contact-modal {
                    position: relative;
                    width: min(520px, 100%);
                    padding: 42px;
                    overflow: hidden;
                    border: 1px solid rgba(167,217,94,.2);
                    border-radius: 30px;
                    background: radial-gradient(circle at 90% 0%, rgba(167,217,94,.12), transparent 35%), #17241a;
                    color: white;
                    box-shadow: 0 40px 100px rgba(0,0,0,.45);
                    animation: contactModal .25s ease;
                }

                .solar-contact-close {
                    position: absolute;
                    top: 18px;
                    right: 18px;
                    width: 38px;
                    height: 38px;
                    border: 1px solid rgba(255,255,255,.1);
                    border-radius: 50%;
                    background: rgba(255,255,255,.06);
                    color: #aeb9b0;
                    font-size: 25px;
                    line-height: 1;
                }

                .solar-contact-close:hover {
                    background: #a7d95e;
                    color: #17241a;
                }

                .solar-contact-sun {
                    width: 58px;
                    height: 58px;
                    display: grid;
                    place-items: center;
                    margin-bottom: 20px;
                    border-radius: 18px;
                    background: #a7d95e;
                    color: #17241a;
                    font-size: 28px;
                }

                .solar-contact-label {
                    color: #8dbb73;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 2.5px;
                }

                .solar-contact-modal h2 {
                    margin: 12px 0;
                    font-size: 50px;
                    line-height: .95;
                    letter-spacing: -3px;
                }

                .solar-contact-modal h2 span {
                    color: #a7d95e;
                }

                .solar-contact-modal > p {
                    margin: 0 0 25px;
                    color: #8f9d92;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .solar-contact-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .solar-contact-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 16px;
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 17px;
                    background: rgba(255,255,255,.045);
                }

                .solar-contact-number span,
                .solar-contact-number strong {
                    display: block;
                }

                .solar-contact-number span {
                    margin-bottom: 5px;
                    color: #718075;
                    font-size: 8px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }

                .solar-contact-number strong {
                    color: white;
                    font-size: 16px;
                }

                .solar-contact-actions {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                }

                .solar-call,
                .solar-whatsapp {
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    text-decoration: none;
                    font-size: 11px;
                    font-weight: 800;
                }

                .solar-call {
                    width: 38px;
                    background: rgba(255,255,255,.08);
                    color: white;
                }

                .solar-whatsapp {
                    padding: 0 13px;
                    background: #a7d95e;
                    color: #17241a;
                }

                .solar-call:hover {
                    background: rgba(255,255,255,.15);
                }

                .solar-whatsapp:hover {
                    background: #b8e878;
                }

                .solar-contact-bottom {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 22px;
                    color: #68766b;
                    font-size: 9px;
                }

                @keyframes contactFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes contactModal {
                    from { opacity: 0; transform: translateY(15px) scale(.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* HEADER */

                .solar-header-client {
                    position: fixed;
                    z-index: 1000;
                    top: 18px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: calc(100% - 60px);
                    max-width: 1380px;
                    height: 72px;
                    padding: 0 18px 0 22px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid rgba(255,255,255,.2);
                    border-radius: 20px;
                    background: rgba(17,29,20,.78);
                    backdrop-filter: blur(22px);
                    box-shadow: 0 20px 50px rgba(0,0,0,.15);
                }

                .solar-brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    color: white;
                    cursor: pointer;
                }

                .solar-brand-icon {
                    width: 42px;
                    height: 42px;
                    display: grid;
                    place-items: center;
                    border-radius: 13px;
                    background: #a7d95e;
                    color: #172419;
                    font-size: 23px;
                }

                .solar-brand-name {
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -.8px;
                }

                .solar-brand-name span,
                .solar-footer-brand strong span {
                    color: #a7d95e;
                }

                .solar-brand-sub {
                    margin-top: 2px;
                    color: #91a092;
                    font-size: 7px;
                    letter-spacing: 3px;
                }

                .solar-client-nav {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                }

                .solar-client-nav button {
                    border: 0;
                    background: transparent;
                    color: #c5cec5;
                    font-size: 13px;
                    transition: .2s;
                }

                .solar-client-nav button:hover {
                    color: #a7d95e;
                }

                .solar-header-cta {
                    border: 0;
                    border-radius: 12px;
                    padding: 13px 17px;
                    background: #a7d95e;
                    color: #162118;
                    font-size: 12px;
                    font-weight: 800;
                }

                .solar-header-cta span {
                    margin-left: 10px;
                    font-size: 16px;
                }

                .solar-mobile-button {
                    display: none;
                    border: 0;
                    background: transparent;
                    color: white;
                    font-size: 24px;
                }

                /* HERO */

                .solar-hero {
                    min-height: 880px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    color: white;
                    background: #18251b;
                }

                .solar-hero-image,
                .solar-hero-overlay {
                    position: absolute;
                    inset: 0;
                }

                .solar-hero-image {
                    background:
                        url("https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2200&q=90")
                        center/cover;
                    transform: scale(1.03);
                }

                .solar-hero-overlay {
                    background:
                        linear-gradient(
                            90deg,
                            rgba(8,19,11,.88) 0%,
                            rgba(8,19,11,.67) 43%,
                            rgba(8,19,11,.18) 100%
                        );
                }

                .solar-hero-content {
                    position: relative;
                    z-index: 2;
                    width: min(760px, 90%);
                    margin-left: max(7vw, 35px);
                    padding-top: 70px;
                }

                .solar-pill {
                    width: fit-content;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 13px;
                    border: 1px solid rgba(255,255,255,.18);
                    border-radius: 50px;
                    background: rgba(255,255,255,.08);
                    color: #c7d5c7;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    backdrop-filter: blur(10px);
                }

                .solar-pill span {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #a7d95e;
                    box-shadow: 0 0 16px #a7d95e;
                }

                .solar-hero h1 {
                    margin: 28px 0 22px;
                    font-size: clamp(52px, 7vw, 94px);
                    line-height: .94;
                    letter-spacing: -5px;
                    font-weight: 800;
                }

                .solar-hero h1 em {
                    color: #a7d95e;
                    font-style: normal;
                }

                .solar-hero-content > p {
                    max-width: 560px;
                    color: #c4cec5;
                    font-size: 17px;
                    line-height: 1.7;
                }

                .solar-hero-buttons {
                    display: flex;
                    gap: 12px;
                    margin-top: 34px;
                }

                .solar-main-button,
                .solar-outline-button {
                    padding: 17px 22px;
                    border-radius: 13px;
                    font-weight: 800;
                }

                .solar-main-button {
                    border: 0;
                    background: #a7d95e;
                    color: #152117;
                    box-shadow: 0 15px 40px rgba(167,217,94,.22);
                }

                .solar-main-button span,
                .solar-final button span {
                    margin-left: 14px;
                }

                .solar-outline-button {
                    border: 1px solid rgba(255,255,255,.25);
                    background: rgba(255,255,255,.07);
                    color: white;
                    backdrop-filter: blur(10px);
                }

                .solar-hero-stats {
                    display: flex;
                    gap: 40px;
                    margin-top: 60px;
                }

                .solar-hero-stats div {
                    display: flex;
                    flex-direction: column;
                }

                .solar-hero-stats strong {
                    font-size: 22px;
                    color: white;
                }

                .solar-hero-stats span {
                    margin-top: 5px;
                    color: #98a599;
                    font-size: 10px;
                }

                .solar-hero-floating {
                    position: absolute;
                    z-index: 4;
                    right: 8%;
                    bottom: 105px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px 18px;
                    border: 1px solid rgba(255,255,255,.18);
                    border-radius: 17px;
                    background: rgba(14,29,17,.72);
                    backdrop-filter: blur(18px);
                }

                .floating-icon {
                    width: 43px;
                    height: 43px;
                    display: grid;
                    place-items: center;
                    border-radius: 13px;
                    background: #a7d95e;
                    color: #18231a;
                    font-size: 22px;
                }

                .solar-hero-floating span,
                .solar-hero-floating strong {
                    display: block;
                }

                .solar-hero-floating span {
                    color: #7e8e81;
                    font-size: 8px;
                    letter-spacing: 1.5px;
                }

                .solar-hero-floating strong {
                    margin-top: 5px;
                    color: white;
                    font-size: 13px;
                }

                .solar-scroll {
                    position: absolute;
                    z-index: 4;
                    right: 35px;
                    bottom: 40px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    color: #8d9a90;
                    font-size: 8px;
                    letter-spacing: 2px;
                    writing-mode: vertical-rl;
                }

                .solar-scroll span {
                    color: #a7d95e;
                    font-size: 17px;
                }

                /* INTRO */

                .solar-intro {
                    max-width: 1240px;
                    margin: auto;
                    padding: 110px 30px;
                    display: grid;
                    grid-template-columns: .35fr 1fr;
                    gap: 70px;
                }

                .solar-intro-label {
                    color: #819080;
                    font-size: 9px;
                    letter-spacing: 2px;
                }

                .solar-intro h2 {
                    margin: 0;
                    font-size: clamp(40px, 5vw, 66px);
                    line-height: 1;
                    letter-spacing: -3px;
                }

                .solar-intro h2 span {
                    color: #5d9a43;
                }

                .solar-intro p {
                    max-width: 650px;
                    margin-top: 25px;
                    color: #758078;
                    font-size: 16px;
                    line-height: 1.8;
                }

                /* SECTIONS */

                .solar-solutions,
                .solar-projects {
                    max-width: 1380px;
                    margin: auto;
                    padding: 80px 30px 120px;
                }

                .solar-section-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                    gap: 30px;
                    margin-bottom: 42px;
                }

                .solar-section-top > div > span,
                .solar-calculator-heading > span,
                .solar-why-content > span,
                .solar-final-content > span {
                    color: #659f4c;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 2.5px;
                }

                .solar-section-top h2 {
                    margin: 14px 0 0;
                    font-size: clamp(40px, 5vw, 65px);
                    line-height: .98;
                    letter-spacing: -3px;
                }

                .solar-section-top h2 strong {
                    color: #5c9844;
                }

                .solar-section-top > p {
                    max-width: 360px;
                    margin: 0;
                    color: #7d877f;
                    line-height: 1.7;
                    font-size: 13px;
                }

                .solar-solution-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr;
                    gap: 16px;
                }

                .solar-solution {
                    height: 540px;
                    position: relative;
                    overflow: hidden;
                    border-radius: 26px;
                    background: #1c2b20;
                }

                .solar-solution img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform .6s;
                }

                .solar-solution:hover img {
                    transform: scale(1.06);
                }

                .solar-solution-gradient {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(
                            180deg,
                            transparent 25%,
                            rgba(5,15,8,.85) 100%
                        );
                }

                .solar-solution-content {
                    position: absolute;
                    z-index: 2;
                    inset: auto 30px 30px;
                    color: white;
                }

                .solar-solution-content > span {
                    color: #a7d95e;
                    font-size: 9px;
                    letter-spacing: 2px;
                }

                .solar-solution-content h3 {
                    margin: 12px 0;
                    font-size: 35px;
                    line-height: .98;
                }

                .solar-solution-content p {
                    max-width: 260px;
                    color: #bdc7be;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .solar-round-arrow {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 48px;
                    height: 48px;
                    display: grid;
                    place-items: center;
                    border-radius: 50%;
                    background: #a7d95e;
                    color: #172318;
                    font-size: 20px;
                }

                /* WHY */

                .solar-why {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    max-width: 1380px;
                    margin: 0 auto 120px;
                    padding: 0 30px;
                    gap: 80px;
                    align-items: center;
                }

                .solar-why-image {
                    height: 680px;
                    overflow: hidden;
                    border-radius: 30px;
                }

                .solar-why-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .solar-why-content h2 {
                    margin: 16px 0;
                    font-size: clamp(43px, 5vw, 70px);
                    line-height: .96;
                    letter-spacing: -3px;
                }

                .solar-why-content h2 strong {
                    color: #609c46;
                }

                .solar-why-content > p {
                    max-width: 500px;
                    color: #778178;
                    line-height: 1.8;
                }

                .solar-feature-list {
                    margin-top: 40px;
                }

                .solar-feature-list > div {
                    display: flex;
                    gap: 22px;
                    padding: 21px 0;
                    border-top: 1px solid #dfe4dc;
                }

                .solar-feature-list b {
                    color: #8a968b;
                    font-size: 10px;
                }

                .solar-feature-list strong,
                .solar-feature-list span {
                    display: block;
                }

                .solar-feature-list strong {
                    font-size: 14px;
                }

                .solar-feature-list span {
                    margin-top: 6px;
                    color: #8a948c;
                    font-size: 11px;
                }

                /* PROJECTS */

                .solar-gallery {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    grid-template-rows: 300px 300px;
                    gap: 16px;
                }

                .solar-gallery-main {
                    grid-row: span 2;
                    position: relative;
                    overflow: hidden;
                    border-radius: 26px;
                }

                .solar-gallery-main img,
                .solar-gallery-small img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .solar-gallery-main > div {
                    position: absolute;
                    left: 28px;
                    bottom: 28px;
                    color: white;
                }

                .solar-gallery-main span,
                .solar-gallery-main strong {
                    display: block;
                }

                .solar-gallery-main span,
                .solar-gallery-small span {
                    color: #a7d95e;
                    font-size: 8px;
                    letter-spacing: 2px;
                }

                .solar-gallery-main strong {
                    margin-top: 9px;
                    font-size: 25px;
                }

                .solar-gallery-small {
                    position: relative;
                    overflow: hidden;
                    border-radius: 22px;
                }

                .solar-gallery-small::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        180deg,
                        transparent,
                        rgba(0,0,0,.65)
                    );
                }

                .solar-gallery-small span {
                    position: absolute;
                    z-index: 2;
                    left: 20px;
                    bottom: 18px;
                }

                /* CALCULATOR */

                .solar-calculator {
                    padding: 120px 30px;
                    background: #e9ede5;
                }

                .solar-calculator-heading {
                    max-width: 1380px;
                    margin: auto auto 50px;
                }

                .solar-calculator-heading h2 {
                    margin: 14px 0;
                    font-size: clamp(44px, 5vw, 68px);
                    line-height: .95;
                    letter-spacing: -3px;
                }

                .solar-calculator-heading h2 strong {
                    color: #609d46;
                }

                .solar-calculator-heading p {
                    max-width: 570px;
                    color: #758078;
                    line-height: 1.7;
                }

                .solar-calculator-layout {
                    max-width: 1380px;
                    margin: auto;
                    display: grid;
                    grid-template-columns: 1.25fr .75fr;
                    gap: 20px;
                    align-items: start;
                }

                .solar-calc-box {
                    padding: 32px;
                    border-radius: 28px;
                    background: white;
                    box-shadow: 0 20px 70px rgba(26,43,30,.07);
                }

                .solar-calc-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .solar-calc-title span {
                    color: #659d4d;
                    font-size: 9px;
                    letter-spacing: 2px;
                    font-weight: 900;
                }

                .solar-calc-title h3 {
                    margin: 8px 0 0;
                    font-size: 24px;
                }

                .solar-step {
                    width: 52px;
                    height: 52px;
                    display: grid;
                    place-items: center;
                    border-radius: 16px;
                    background: #edf6e8;
                    color: #579341;
                    font-weight: 900;
                }

                .solar-equipment-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 11px;
                }

                .solar-equipment {
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding: 15px;
                    border: 1px solid #cfd8ca;
                    border-radius: 17px;
                    background: #ffffff;
                    color: #172018;
                    transition: .2s;
                }

                .solar-equipment.chosen {
                    background: #eef8e8;
                    border-color: #63a44d;
                    box-shadow: 0 8px 22px rgba(84,145,64,.12);
                }

                .solar-equipment-icon {
                    width: 42px;
                    height: 42px;
                    flex-shrink: 0;
                    display: grid;
                    place-items: center;
                    border-radius: 12px;
                    background: #e3f1dc;
                    color: #3d7e2e;
                    font-size: 18px;
                }

                .solar-equipment-info {
                    min-width: 0;
                    flex: 1;
                }

                .solar-equipment-info strong,
                .solar-equipment-info span,
                .solar-equipment-info small {
                    display: block;
                }

                .solar-equipment-info strong {
                    color: #182219;
                    font-size: 14px;
                    font-weight: 800;
                }

                .solar-equipment-info span {
                    margin-top: 4px;
                    overflow: hidden;
                    color: #566158;
                    font-size: 10px;
                    line-height: 1.35;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .solar-equipment-info small {
                    margin-top: 5px;
                    color: #3f8430;
                    font-size: 10px;
                    font-weight: 900;
                }

                .solar-counter {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .solar-counter button {
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5d0c1;
                    border-radius: 8px;
                    background: #ffffff;
                    color: #1b251d;
                    font-size: 16px;
                    font-weight: 800;
                }

                .solar-counter button:hover:not(:disabled) {
                    background: #dff0d7;
                    border-color: #73aa61;
                    color: #2f6e25;
                }

                .solar-counter button:disabled {
                    opacity: .45;
                    color: #667067;
                    background: #f1f3f0;
                    cursor: not-allowed;
                }

                .solar-counter strong {
                    width: 20px;
                    text-align: center;
                    color: #172018;
                    font-size: 14px;
                }

                .solar-calculate-button,
                .solar-order-button {
                    width: 100%;
                    margin-top: 20px;
                    padding: 17px;
                    border: 0;
                    border-radius: 14px;
                    background: #5b9943;
                    color: white;
                    font-weight: 800;
                }

                .solar-calculate-button:hover,
                .solar-order-button:hover {
                    background: #4b8237;
                }

                .solar-calculate-button span,
                .solar-order-button span {
                    float: right;
                    font-size: 18px;
                }

                .solar-calculate-button:disabled,
                .solar-order-button:disabled {
                    opacity: .5;
                    cursor: not-allowed;
                }

                .solar-error {
                    margin-top: 15px;
                    padding: 12px;
                    border-radius: 10px;
                    background: #fff0ed;
                    color: #b34f3d;
                    font-size: 12px;
                }

                .solar-loader {
                    min-height: 300px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                    color: #778078;
                }

                .solar-loader div {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #dfe8db;
                    border-top-color: #619d49;
                    border-radius: 50%;
                    animation: solarSpin .8s linear infinite;
                }

                @keyframes solarSpin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* RESULT */

                .solar-result {
                    position: sticky;
                    top: 110px;
                    min-height: 510px;
                    padding: 30px;
                    overflow: hidden;
                    border-radius: 28px;
                    background: #17241a;
                    color: white;
                    box-shadow: 0 25px 70px rgba(23,36,26,.18);
                }

                .solar-result::before {
                    content: "";
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    right: -130px;
                    top: -130px;
                    border-radius: 50%;
                    background: rgba(167,217,94,.12);
                }

                .solar-result-empty {
                    min-height: 430px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .solar-result-icon {
                    width: 75px;
                    height: 75px;
                    display: grid;
                    place-items: center;
                    border-radius: 24px;
                    background: rgba(167,217,94,.12);
                    color: #a7d95e;
                    font-size: 35px;
                    margin-bottom: 22px;
                }

                .solar-result-empty > span,
                .solar-result-label {
                    color: #91bb79;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 2px;
                }

                .solar-result-empty h3 {
                    margin: 13px 0;
                    font-size: 25px;
                    line-height: 1.1;
                }

                .solar-result-empty p {
                    max-width: 240px;
                    color: #b4c1b7;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .solar-result-content {
                    position: relative;
                    z-index: 2;
                }

                .solar-result-content h3 {
                    margin: 12px 0;
                    font-size: 27px;
                }

                .solar-result-power {
                    color: #a7d95e;
                    font-size: 64px;
                    font-weight: 900;
                    letter-spacing: -4px;
                }

                .solar-result-power small {
                    margin-left: 5px;
                    color: #b5c4b7;
                    font-size: 18px;
                    letter-spacing: 0;
                }

                .solar-result-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 9px;
                    margin: 20px 0;
                }

                .solar-result-stats div {
                    padding: 13px;
                    border-radius: 12px;
                    background: rgba(255,255,255,.06);
                }

                .solar-result-stats span,
                .solar-result-stats strong {
                    display: block;
                }

                .solar-result-stats span {
                    color: #b6c4b9;
                    font-size: 10px;
                }

                .solar-result-stats strong {
                    margin-top: 5px;
                    font-size: 15px;
                }

                .solar-package {
                    padding: 15px;
                    border-radius: 15px;
                    background: rgba(255,255,255,.055);
                }

                .solar-package > strong,
                .solar-package > span {
                    display: block;
                }

                .solar-package > strong {
                    color: #b9df9e;
                }

                .solar-package > span {
                    margin-top: 5px;
                    color: #bdc9bf;
                    font-size: 11px;
                }

                .solar-package-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    padding-top: 9px;
                    margin-top: 9px;
                    border-top: 1px solid rgba(255,255,255,.07);
                    color: #d2dad4;
                    font-size: 11px;
                }

                .solar-result-price {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 18px;
                }

                .solar-result-price span {
                    color: #c0cbc3;
                    font-size: 12px;
                }

                .solar-result-price strong {
                    color: #d6eecb;
                    font-size: 20px;
                }

                .solar-order-form {
                    margin-top: 18px;
                }

                .solar-order-form h4 {
                    margin: 0 0 8px;
                    font-size: 16px;
                }

                .solar-order-form input,
                .solar-order-form textarea {
                    width: 100%;
                    margin-top: 8px;
                    padding: 12px;
                    border: 1px solid rgba(255,255,255,.12);
                    border-radius: 10px;
                    outline: none;
                    background: rgba(255,255,255,.07);
                    color: white;
                }

                .solar-order-form input::placeholder,
                .solar-order-form textarea::placeholder {
                    color: #829086;
                }

                .solar-order-form textarea {
                    min-height: 70px;
                    resize: vertical;
                }

                .solar-order-form button {
                    width: 100%;
                    margin-top: 10px;
                    padding: 13px;
                    border: 0;
                    border-radius: 10px;
                    background: #a7d95e;
                    color: #182319;
                    font-weight: 800;
                }

                .solar-success {
                    margin-top: 18px;
                    padding: 17px;
                    border-radius: 14px;
                    background: rgba(167,217,94,.12);
                }

                .solar-success strong,
                .solar-success span {
                    display: block;
                }

                .solar-success strong {
                    color: #b9e29f;
                }

                .solar-success span {
                    margin-top: 5px;
                    color: #94a397;
                    font-size: 11px;
                }

                .solar-individual {
                    margin-top: 16px;
                    padding: 16px;
                    border-radius: 14px;
                    background: rgba(244,184,71,.08);
                }

                .solar-individual strong {
                    color: #f2c873;
                }

                .solar-individual p {
                    color: #9da99f;
                    font-size: 11px;
                }

                /* FINAL */

                .solar-final {
                    position: relative;
                    min-height: 620px;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    color: white;
                }

                .solar-final-image,
                .solar-final-overlay {
                    position: absolute;
                    inset: 0;
                }

                .solar-final-image {
                    background:
                        url("https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=2200&q=90")
                        center/cover;
                }

                .solar-final-overlay {
                    background:
                        linear-gradient(
                            90deg,
                            rgba(7,19,10,.9),
                            rgba(7,19,10,.35)
                        );
                }

                .solar-final-content {
                    position: relative;
                    z-index: 2;
                    width: min(700px, 90%);
                    margin-left: max(7vw, 30px);
                }

                .solar-final-content h2 {
                    margin: 15px 0;
                    font-size: clamp(55px, 7vw, 90px);
                    line-height: .9;
                    letter-spacing: -5px;
                }

                .solar-final-content h2 em {
                    color: #a7d95e;
                    font-style: normal;
                }

                .solar-final-content p {
                    color: #b5c0b7;
                }

                .solar-final button {
                    margin-top: 25px;
                    padding: 17px 22px;
                    border: 0;
                    border-radius: 13px;
                    background: #a7d95e;
                    color: #182318;
                    font-weight: 900;
                }

                /* FOOTER */

                .solar-footer-client {
                    min-height: 110px;
                    padding: 25px 6%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 25px;
                    background: #111b13;
                    color: #78847a;
                    font-size: 10px;
                }

                .solar-footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                }

                .solar-footer-brand strong,
                .solar-footer-brand small {
                    display: block;
                }

                .solar-footer-brand small {
                    margin-top: 2px;
                    color: #68736a;
                    font-size: 7px;
                    letter-spacing: 2px;
                }

                /* CATALOG */

                .solar-solution {
                    cursor: pointer;
                }

                .solar-solution:focus-visible {
                    outline: 3px solid #a7d95e;
                    outline-offset: 4px;
                }

                .solar-catalog-overlay {
                    position: fixed;
                    z-index: 6000;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: rgba(4, 10, 5, .78);
                    backdrop-filter: blur(14px);
                    overflow-y: auto;
                }

                .solar-catalog-modal {
                    position: relative;
                    width: min(1100px, 100%);
                    max-height: calc(100vh - 48px);
                    overflow-y: auto;
                    padding: 32px;
                    border: 1px solid #dbe6d5;
                    border-radius: 28px;
                    background: #f9fbf7;
                    color: #172018;
                    box-shadow: 0 35px 100px rgba(0,0,0,.35);
                }

                .solar-catalog-close {
                    position: absolute;
                    z-index: 2;
                    top: 18px;
                    right: 18px;
                    width: 42px;
                    height: 42px;
                    border: 1px solid #d6dfd2;
                    border-radius: 50%;
                    background: white;
                    color: #172018;
                    font-size: 25px;
                }

                .solar-catalog-top {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 25px;
                    align-items: stretch;
                    margin-bottom: 25px;
                }

                .solar-catalog-top > div {
                    padding: 12px 10px;
                }

                .solar-catalog-top span,
                .solar-product-detail-head span {
                    color: #4d8e39;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 2px;
                }

                .solar-catalog-top h2 {
                    margin: 12px 0 10px;
                    font-size: clamp(34px, 5vw, 58px);
                    line-height: .95;
                    letter-spacing: -2px;
                }

                .solar-catalog-top p {
                    max-width: 600px;
                    margin: 0;
                    color: #566158;
                    line-height: 1.6;
                }

                .solar-catalog-top img {
                    width: 100%;
                    height: 190px;
                    object-fit: cover;
                    border-radius: 20px;
                }

                .solar-product-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }

                .solar-product-card {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    width: 100%;
                    padding: 16px;
                    border: 1px solid #d8e1d4;
                    border-radius: 18px;
                    background: white;
                    color: #172018;
                    text-align: left;
                    transition: .2s;
                }

                .solar-product-card:hover {
                    transform: translateY(-2px);
                    border-color: #72a95f;
                    box-shadow: 0 12px 30px rgba(51,100,43,.12);
                }

                .solar-product-icon {
                    width: 48px;
                    height: 48px;
                    flex: 0 0 48px;
                    display: grid;
                    place-items: center;
                    border-radius: 14px;
                    background: #e5f3de;
                    color: #3e7f30;
                    font-size: 23px;
                }

                .solar-product-card-body {
                    min-width: 0;
                    flex: 1;
                }

                .solar-product-card-body span,
                .solar-product-card-body strong,
                .solar-product-card-body small {
                    display: block;
                }

                .solar-product-card-body span {
                    color: #657066;
                    font-size: 10px;
                }

                .solar-product-card-body strong {
                    margin-top: 4px;
                    color: #172018;
                    font-size: 15px;
                }

                .solar-product-card-body small {
                    margin-top: 5px;
                    color: #438135;
                    font-size: 11px;
                    font-weight: 800;
                }

                .solar-product-card > b {
                    color: #4d8e39;
                    font-size: 20px;
                }

                .solar-catalog-loading,
                .solar-catalog-empty {
                    padding: 50px 20px;
                    border-radius: 18px;
                    background: white;
                    color: #566158;
                    text-align: center;
                }

                .solar-product-detail {
                    margin-top: 22px;
                    padding: 22px;
                    border: 1px solid #cfdcc9;
                    border-radius: 20px;
                    background: #edf7e9;
                }

                .solar-product-detail-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                }

                .solar-product-detail-head h3 {
                    margin: 8px 0 0;
                    color: #172018;
                    font-size: 26px;
                }

                .solar-product-detail-head button {
                    width: 34px;
                    height: 34px;
                    border: 0;
                    border-radius: 50%;
                    background: white;
                    color: #172018;
                    font-size: 20px;
                }

                .solar-product-detail > p {
                    margin: 15px 0;
                    color: #4f5b51;
                    line-height: 1.6;
                }

                .solar-product-specs {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }

                .solar-product-specs div {
                    padding: 13px;
                    border-radius: 13px;
                    background: white;
                }

                .solar-product-specs span,
                .solar-product-specs strong {
                    display: block;
                }

                .solar-product-specs span {
                    color: #667268;
                    font-size: 9px;
                }

                .solar-product-specs strong {
                    margin-top: 5px;
                    color: #172018;
                    font-size: 13px;
                }

                /* RESPONSIVE */

                @media (max-width: 1050px) {
                    .solar-client-nav {
                        gap: 14px;
                    }

                    .solar-solution-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .solar-solution-large {
                        grid-column: span 2;
                    }

                    .solar-calculator-layout {
                        grid-template-columns: 1fr;
                    }

                    .solar-result {
                        position: static;
                    }

                    .solar-why {
                        gap: 40px;
                    }
                }

                @media (max-width: 600px) {
                    .solar-contact-modal {
                        padding: 30px 20px;
                        border-radius: 24px;
                    }

                    .solar-contact-modal h2 {
                        font-size: 42px;
                    }

                    .solar-contact-card {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .solar-contact-actions {
                        width: 100%;
                    }

                    .solar-call {
                        width: 44px;
                    }

                    .solar-whatsapp {
                        flex: 1;
                    }
                }

                @media (max-width: 760px) {
                    .solar-header-client {
                        width: calc(100% - 24px);
                        top: 10px;
                        height: 64px;
                    }

                    .solar-client-nav {
                        position: absolute;
                        display: none;
                        top: 72px;
                        left: 0;
                        right: 0;
                        flex-direction: column;
                        align-items: stretch;
                        padding: 15px;
                        border-radius: 17px;
                        background: #17251a;
                    }

                    .solar-client-nav.mobile-open {
                        display: flex;
                    }

                    .solar-client-nav button {
                        padding: 13px;
                        text-align: left;
                    }

                    .solar-header-cta {
                        display: none;
                    }

                    .solar-mobile-button {
                        display: block;
                    }

                    .solar-hero {
                        min-height: 760px;
                    }

                    .solar-hero-content {
                        margin-left: 22px;
                        padding-top: 80px;
                    }

                    .solar-hero h1 {
                        font-size: 53px;
                        letter-spacing: -3px;
                    }

                    .solar-hero-content > p {
                        font-size: 14px;
                    }

                    .solar-hero-buttons {
                        flex-direction: column;
                        width: 100%;
                    }

                    .solar-hero-buttons button {
                        width: 100%;
                    }

                    .solar-hero-stats {
                        gap: 18px;
                        margin-top: 35px;
                    }

                    .solar-hero-floating {
                        display: none;
                    }

                    .solar-scroll {
                        display: none;
                    }

                    .solar-intro {
                        grid-template-columns: 1fr;
                        gap: 25px;
                        padding: 75px 22px;
                    }

                    .solar-solutions,
                    .solar-projects {
                        padding: 60px 20px 80px;
                    }

                    .solar-section-top {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .solar-section-top h2 {
                        font-size: 43px;
                    }

                    .solar-solution-grid {
                        grid-template-columns: 1fr;
                    }

                    .solar-solution-large {
                        grid-column: auto;
                    }

                    .solar-solution {
                        height: 420px;
                    }

                    .solar-why {
                        grid-template-columns: 1fr;
                        padding: 0 20px;
                        margin-bottom: 80px;
                    }

                    .solar-why-image {
                        height: 420px;
                    }

                    .solar-gallery {
                        grid-template-columns: 1fr;
                        grid-template-rows: 350px 220px 220px;
                    }

                    .solar-gallery-main {
                        grid-row: auto;
                    }

                    .solar-calculator {
                        padding: 75px 20px;
                    }

                    .solar-calculator-heading h2 {
                        font-size: 45px;
                    }

                    .solar-calc-box,
                    .solar-result {
                        padding: 20px;
                    }

                    .solar-equipment-grid {
                        grid-template-columns: 1fr;
                    }

                    .solar-equipment-info strong {
                        font-size: 14px;
                    }

                    .solar-equipment-info span {
                        font-size: 10px;
                    }

                    .solar-final {
                        min-height: 540px;
                    }

                    .solar-final-content {
                        margin-left: 22px;
                    }

                    .solar-final-content h2 {
                        font-size: 55px;
                        letter-spacing: -3px;
                    }

                    .solar-footer-client {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 30px 22px;
                    }

                    .solar-catalog-overlay {
                        padding: 12px;
                    }

                    .solar-catalog-modal {
                        max-height: calc(100vh - 24px);
                        padding: 20px;
                        border-radius: 22px;
                    }

                    .solar-catalog-top {
                        grid-template-columns: 1fr;
                    }

                    .solar-catalog-top img {
                        height: 170px;
                    }

                    .solar-product-grid {
                        grid-template-columns: 1fr;
                    }

                    .solar-product-specs {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default App;
