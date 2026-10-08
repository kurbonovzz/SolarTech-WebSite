
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";

type SystemPackage = {
    id: number;
    name: string;
    system_power_kw: number;
    description: string;
    total_price: number;
    is_active: boolean;
};

type PackageForm = {
    name: string;
    system_power_kw: number;
    description: string;
    total_price: number;
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
            // Automatic LAN fallback below.
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

const emptyForm: PackageForm = {
    name: "",
    system_power_kw: 3.5,
    description: "",
    total_price: 0,
    is_active: true,
};

const STANDARD_POWERS = [3.5, 5, 10, 15, 20, 25];

function getPowerClass(power: number) {
    if (power <= 5) return "small";
    if (power <= 15) return "medium";
    return "large";
}

function getPowerLabel(power: number) {
    return Number.isInteger(power)
        ? `${power} kW`
        : `${power.toLocaleString("ru-RU")} kW`;
}

function PackageIcon({ power }: { power: number }) {
    return (
        <div className={`package-icon ${getPowerClass(power)}`}>
            <span>☀</span>
            <strong>{power}</strong>
            <small>kW</small>
        </div>
    );
}

function AdminPackagesPage() {
    const [packages, setPackages] = useState<SystemPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] =
        useState<SystemPackage | null>(null);
    const [form, setForm] = useState<PackageForm>({
        ...emptyForm,
    });

    useEffect(() => {
        loadPackages();
    }, []);

    function getToken() {
        return localStorage.getItem("solartech_admin_token");
    }

    function logout() {
        localStorage.removeItem("solartech_admin_token");
        window.location.href = "/admin/login";
    }

    async function loadPackages() {
        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/system-packages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = await response.json();

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось загрузить системы.",
                );
            }

            const list =
                data.system_packages ||
                data.packages ||
                [];

            setPackages(
                Array.isArray(list)
                    ? [...list].sort(
                        (a: SystemPackage, b: SystemPackage) =>
                            a.system_power_kw -
                            b.system_power_kw,
                    )
                    : [],
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка загрузки систем.",
            );
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingPackage(null);
        setForm({ ...emptyForm });
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function openEdit(item: SystemPackage) {
        setEditingPackage(item);
        setForm({
            name: item.name,
            system_power_kw: item.system_power_kw,
            description: item.description || "",
            total_price: item.total_price,
            is_active: item.is_active,
        });
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function closeModal() {
        if (saving) return;

        setShowModal(false);
        setEditingPackage(null);
        setForm({ ...emptyForm });
        setError("");
    }

    function updateField(
        field: keyof PackageForm,
        value: string | number | boolean,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function savePackage(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        if (!form.name.trim()) {
            setError("Введите название системы.");
            return;
        }

        if (form.system_power_kw <= 0) {
            setError("Мощность системы должна быть больше 0.");
            return;
        }

        if (form.total_price < 0) {
            setError("Цена не может быть отрицательной.");
            return;
        }

        try {
            setSaving(true);

            const url = editingPackage
                ? `${API_URL}/system-packages/${editingPackage.id}`
                : `${API_URL}/system-packages`;

            const response = await fetch(url, {
                method: editingPackage ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    system_power_kw:
                        Number(form.system_power_kw),
                    description:
                        form.description.trim(),
                    total_price:
                        Number(form.total_price),
                    is_active:
                        Boolean(form.is_active),
                }),
            });

            const data = await response.json();

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось сохранить систему.",
                );
            }

            setSuccess(
                editingPackage
                    ? "Система успешно обновлена."
                    : "Система успешно добавлена.",
            );

            setShowModal(false);
            setEditingPackage(null);
            setForm({ ...emptyForm });

            await loadPackages();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка сохранения системы.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function deletePackage(
        item: SystemPackage,
    ) {
        const confirmed = window.confirm(
            `Удалить систему «${item.name}»?`,
        );

        if (!confirmed) return;

        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        try {
            setError("");
            setSuccess("");
            setSaving(true);

            const response = await fetch(
                `${API_URL}/system-packages/${item.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = await response.json();

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось удалить систему.",
                );
            }

            setPackages((current) =>
                current.filter(
                    (pkg) => pkg.id !== item.id,
                ),
            );

            setSuccess(
                `«${item.name}» удалена.`,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка удаления системы.",
            );
        } finally {
            setSaving(false);
        }
    }

    const filteredPackages = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return packages;

        return packages.filter((item) =>
            [
                item.name,
                item.description,
                String(item.system_power_kw),
                String(item.total_price),
            ]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [packages, search]);

    const activeCount = packages.filter(
        (item) => item.is_active,
    ).length;

    const totalValue = packages.reduce(
        (sum, item) => sum + item.total_price,
        0,
    );

    const maxPower =
        packages.length > 0
            ? Math.max(
                ...packages.map(
                    (item) => item.system_power_kw,
                ),
            )
            : 0;

    function navigate(page: string) {
        const routes: Record<string, string> = {
            dashboard: "/admin",
            orders: "/admin/orders",
            customers: "/admin/customers",
            inventory: "/admin/inventory",
            products: "/admin/products",
            "equipment-types":
                "/admin/equipment-types",
            packages: "/admin/packages",
        };

        if (routes[page]) {
            window.location.href = routes[page];
        }
    }

    return (
        <AdminLayout
            activePage="packages"
            onNavigate={navigate}
        >
            <div className="packages-page">
                <style>{`
                    * {
                        box-sizing: border-box;
                    }

                    .packages-page {
                        min-height: 100vh;
                        padding: 34px 36px 60px;
                        background:
                            radial-gradient(
                                circle at 92% 0%,
                                rgba(102, 168, 73, .09),
                                transparent 30%
                            ),
                            radial-gradient(
                                circle at 0% 70%,
                                rgba(78, 137, 184, .05),
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

                    .packages-container {
                        width: 100%;
                        max-width: 1450px;
                        margin: 0 auto;
                    }

                    .packages-header {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 24px;
                        margin-bottom: 28px;
                    }

                    .packages-heading {
                        display: flex;
                        align-items: center;
                        gap: 17px;
                    }

                    .packages-heading-icon {
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
                        font-size: 28px;
                        box-shadow:
                            0 12px 28px
                            rgba(68,133,52,.22);
                    }

                    .packages-eyebrow {
                        display: block;
                        margin-bottom: 5px;
                        color: #5d9948;
                        font-size: 10px;
                        font-weight: 900;
                        letter-spacing: 2px;
                    }

                    .packages-heading h1 {
                        margin: 0;
                        font-size: 30px;
                        line-height: 1.1;
                        letter-spacing: -1px;
                    }

                    .packages-heading p {
                        margin: 7px 0 0;
                        color: #7c887f;
                        font-size: 13px;
                    }

                    .packages-primary {
                        min-height: 44px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        padding: 0 18px;
                        border: 1px solid #57963f;
                        border-radius: 12px;
                        background:
                            linear-gradient(
                                135deg,
                                #65a84b,
                                #478c38
                            );
                        color: white;
                        font-size: 12px;
                        font-weight: 900;
                        cursor: pointer;
                        box-shadow:
                            0 10px 24px
                            rgba(70,137,54,.18);
                    }

                    .packages-primary:hover {
                        transform: translateY(-1px);
                    }

                    .packages-alert {
                        margin-bottom: 18px;
                        padding: 13px 16px;
                        border-radius: 13px;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    .packages-error {
                        border: 1px solid #f0d2ca;
                        background: #fff5f2;
                        color: #ad4e3c;
                    }

                    .packages-success {
                        border: 1px solid #cfe4c8;
                        background: #f2faef;
                        color: #438035;
                    }

                    .packages-stats {
                        display: grid;
                        grid-template-columns:
                            repeat(4, minmax(0, 1fr));
                        gap: 15px;
                        margin-bottom: 22px;
                    }

                    .packages-stat {
                        min-height: 122px;
                        padding: 21px;
                        border: 1px solid #e0e7dc;
                        border-radius: 18px;
                        background: white;
                        box-shadow:
                            0 7px 25px
                            rgba(34,53,37,.045);
                    }

                    .packages-stat-icon {
                        width: 43px;
                        height: 43px;
                        display: grid;
                        place-items: center;
                        border-radius: 13px;
                        background: #edf7e9;
                        color: #56963f;
                        font-size: 19px;
                        font-weight: 900;
                    }

                    .packages-stat:nth-child(2)
                        .packages-stat-icon {
                        background: #eef7eb;
                    }

                    .packages-stat:nth-child(3)
                        .packages-stat-icon {
                        background: #edf4fa;
                        color: #5185ae;
                    }

                    .packages-stat:nth-child(4)
                        .packages-stat-icon {
                        background: #fff4e6;
                        color: #d38a30;
                    }

                    .packages-stat-label {
                        display: block;
                        margin-top: 15px;
                        color: #7d8980;
                        font-size: 11px;
                        font-weight: 700;
                    }

                    .packages-stat-value {
                        display: block;
                        margin-top: 4px;
                        font-size: 25px;
                        line-height: 1;
                        letter-spacing: -.8px;
                    }

                    .packages-card {
                        overflow: hidden;
                        border: 1px solid #e0e7dc;
                        border-radius: 21px;
                        background: white;
                        box-shadow:
                            0 12px 40px
                            rgba(34,53,37,.055);
                    }

                    .packages-toolbar {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 18px;
                        padding: 18px 20px;
                        border-bottom: 1px solid #edf0eb;
                        background: #fcfdfb;
                    }

                    .packages-search {
                        width: min(520px, 100%);
                        height: 45px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 0 14px;
                        border: 1px solid #dce5d9;
                        border-radius: 12px;
                        background: white;
                    }

                    .packages-search span {
                        color: #87928a;
                        font-size: 17px;
                    }

                    .packages-search input {
                        width: 100%;
                        height: 100%;
                        border: 0;
                        outline: 0;
                        color: #273229;
                        font-size: 12px;
                    }

                    .packages-search input::placeholder {
                        color: #a1aaa3;
                    }

                    .packages-toolbar-count {
                        color: #89948c;
                        font-size: 11px;
                    }

                    .packages-toolbar-count strong {
                        color: #29352d;
                    }

                    .packages-grid {
                        display: grid;
                        grid-template-columns:
                            repeat(3, minmax(0, 1fr));
                        gap: 16px;
                        padding: 20px;
                    }

                    .package-card {
                        position: relative;
                        overflow: hidden;
                        min-height: 275px;
                        padding: 20px;
                        border: 1px solid #e0e8dc;
                        border-radius: 18px;
                        background:
                            linear-gradient(
                                145deg,
                                #ffffff,
                                #f8fbf6
                            );
                        box-shadow:
                            0 7px 24px
                            rgba(34,53,37,.045);
                        transition:
                            transform .16s ease,
                            box-shadow .16s ease,
                            border-color .16s ease;
                    }

                    .package-card:hover {
                        transform: translateY(-2px);
                        border-color: #cddfc7;
                        box-shadow:
                            0 14px 32px
                            rgba(34,53,37,.08);
                    }

                    .package-card::after {
                        content: "";
                        position: absolute;
                        right: -50px;
                        top: -55px;
                        width: 145px;
                        height: 145px;
                        border-radius: 50%;
                        background: rgba(104,169,73,.07);
                    }

                    .package-top {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 14px;
                    }

                    .package-icon {
                        width: 66px;
                        height: 66px;
                        display: grid;
                        place-items: center;
                        align-content: center;
                        border-radius: 19px;
                        color: white;
                        box-shadow:
                            0 10px 23px
                            rgba(70,137,54,.16);
                    }

                    .package-icon.small {
                        background:
                            linear-gradient(
                                145deg,
                                #73b55b,
                                #4c923b
                            );
                    }

                    .package-icon.medium {
                        background:
                            linear-gradient(
                                145deg,
                                #5d9e4b,
                                #3f8134
                            );
                    }

                    .package-icon.large {
                        background:
                            linear-gradient(
                                145deg,
                                #4c8e43,
                                #326e35
                            );
                    }

                    .package-icon span {
                        font-size: 16px;
                        line-height: 15px;
                    }

                    .package-icon strong {
                        margin-top: 0;
                        font-size: 20px;
                        line-height: 20px;
                    }

                    .package-icon small {
                        font-size: 8px;
                        font-weight: 900;
                        letter-spacing: 1px;
                    }

                    .package-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 7px 10px;
                        border-radius: 9px;
                        font-size: 9px;
                        font-weight: 900;
                    }

                    .package-status.active {
                        border: 1px solid #d7ead2;
                        background: #f0f9ed;
                        color: #4c8e3c;
                    }

                    .package-status.inactive {
                        border: 1px solid #e4e6e4;
                        background: #f4f5f4;
                        color: #929a94;
                    }

                    .package-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: currentColor;
                    }

                    .package-content {
                        position: relative;
                        z-index: 1;
                        margin-top: 17px;
                    }

                    .package-content h3 {
                        margin: 0;
                        color: #1f2b23;
                        font-size: 17px;
                        letter-spacing: -.2px;
                    }

                    .package-description {
                        min-height: 38px;
                        margin: 7px 0 0;
                        color: #87928a;
                        font-size: 10px;
                        line-height: 1.5;
                    }

                    .package-price-row {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 10px;
                        margin-top: 15px;
                        padding-top: 14px;
                        border-top: 1px solid #e8eee5;
                    }

                    .package-price-label {
                        display: block;
                        color: #929d95;
                        font-size: 9px;
                        font-weight: 800;
                    }

                    .package-price {
                        display: block;
                        margin-top: 3px;
                        color: #26332a;
                        font-size: 21px;
                        font-weight: 900;
                        letter-spacing: -.7px;
                    }

                    .package-price span {
                        color: #829087;
                        font-size: 10px;
                        font-weight: 800;
                        letter-spacing: 0;
                    }

                    .package-power {
                        padding: 7px 10px;
                        border: 1px solid #dce9d7;
                        border-radius: 9px;
                        background: #f4f9f2;
                        color: #508a40;
                        font-size: 10px;
                        font-weight: 900;
                    }

                    .package-actions {
                        display: flex;
                        gap: 7px;
                        margin-top: 15px;
                    }

                    .package-action {
                        flex: 1;
                        height: 36px;
                        border-radius: 9px;
                        font-size: 10px;
                        font-weight: 900;
                        cursor: pointer;
                    }

                    .package-edit {
                        border: 1px solid #dce8d8;
                        background: #f4f9f2;
                        color: #579444;
                    }

                    .package-delete {
                        border: 1px solid #efd9d4;
                        background: #fff6f4;
                        color: #bd5a49;
                    }

                    .package-action:hover:not(:disabled) {
                        transform: translateY(-1px);
                    }

                    .package-action:disabled {
                        opacity: .5;
                        cursor: not-allowed;
                    }

                    .packages-empty {
                        min-height: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        padding: 30px;
                        color: #8b968e;
                        text-align: center;
                        grid-column: 1 / -1;
                    }

                    .packages-empty-icon {
                        width: 64px;
                        height: 64px;
                        display: grid;
                        place-items: center;
                        margin-bottom: 15px;
                        border-radius: 20px;
                        background: #f0f6ed;
                        color: #669b52;
                        font-size: 27px;
                    }

                    .packages-empty h3 {
                        margin: 0;
                        color: #2b362f;
                        font-size: 17px;
                    }

                    .packages-empty p {
                        max-width: 440px;
                        margin: 7px 0 0;
                        font-size: 11px;
                        line-height: 1.5;
                    }

                    .packages-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        background: rgba(10,20,13,.68);
                        backdrop-filter: blur(8px);
                    }

                    .packages-modal {
                        width: min(680px, 100%);
                        max-height: 92vh;
                        overflow-y: auto;
                        border: 1px solid #dfe8db;
                        border-radius: 24px;
                        background: #fbfdf9;
                        box-shadow:
                            0 35px 100px
                            rgba(0,0,0,.32);
                    }

                    .packages-modal-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 23px 25px;
                        border-bottom: 1px solid #e8ede5;
                    }

                    .modal-label {
                        display: block;
                        margin-bottom: 5px;
                        color: #619b4b;
                        font-size: 9px;
                        font-weight: 900;
                        letter-spacing: 1.8px;
                    }

                    .packages-modal-header h2 {
                        margin: 0;
                        color: #202b24;
                        font-size: 22px;
                    }

                    .packages-modal-header p {
                        margin: 5px 0 0;
                        color: #8c978f;
                        font-size: 11px;
                    }

                    .modal-close {
                        width: 39px;
                        height: 39px;
                        border: 1px solid #dce4d9;
                        border-radius: 11px;
                        background: white;
                        color: #6e7971;
                        font-size: 23px;
                        cursor: pointer;
                    }

                    .packages-form {
                        padding: 25px;
                    }

                    .form-title {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 15px;
                        color: #29362e;
                        font-size: 12px;
                        font-weight: 900;
                    }

                    .form-title::before {
                        content: "";
                        width: 4px;
                        height: 17px;
                        border-radius: 5px;
                        background: #65a84b;
                    }

                    .form-grid {
                        display: grid;
                        grid-template-columns:
                            repeat(2, minmax(0,1fr));
                        gap: 15px;
                    }

                    .form-field {
                        display: flex;
                        flex-direction: column;
                        gap: 7px;
                    }

                    .form-field.full {
                        grid-column: 1 / -1;
                    }

                    .form-field label {
                        color: #68746c;
                        font-size: 10px;
                        font-weight: 800;
                    }

                    .form-field input,
                    .form-field textarea {
                        width: 100%;
                        border: 1px solid #dce5d9;
                        border-radius: 11px;
                        outline: none;
                        background: white;
                        color: #29342d;
                        font-size: 12px;
                    }

                    .form-field input {
                        height: 43px;
                        padding: 0 12px;
                    }

                    .form-field textarea {
                        min-height: 95px;
                        padding: 12px;
                        resize: vertical;
                    }

                    .form-field input:focus,
                    .form-field textarea:focus {
                        border-color: #77a967;
                        box-shadow:
                            0 0 0 3px
                            rgba(91,153,67,.08);
                    }

                    .power-presets {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 7px;
                        margin-top: 1px;
                    }

                    .power-preset {
                        min-width: 54px;
                        height: 34px;
                        padding: 0 10px;
                        border: 1px solid #dce7d9;
                        border-radius: 9px;
                        background: #f5f9f3;
                        color: #5a8e4b;
                        font-size: 10px;
                        font-weight: 900;
                        cursor: pointer;
                    }

                    .power-preset.active {
                        border-color: #62a34b;
                        background: #eaf5e6;
                        color: #3f7d32;
                    }

                    .active-option {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-top: 18px;
                        padding: 14px;
                        border: 1px solid #dfe8dc;
                        border-radius: 12px;
                        background: #f8fbf6;
                        color: #536057;
                        font-size: 11px;
                        font-weight: 800;
                    }

                    .active-option input {
                        width: 17px;
                        height: 17px;
                        accent-color: #5fa047;
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
                        padding: 0 19px;
                        border-radius: 11px;
                        font-size: 11px;
                        font-weight: 900;
                        cursor: pointer;
                    }

                    .modal-cancel {
                        border: 1px solid #dce4da;
                        background: white;
                        color: #69756d;
                    }

                    .modal-save {
                        border: 1px solid #57963f;
                        background:
                            linear-gradient(
                                135deg,
                                #67a94e,
                                #478b38
                            );
                        color: white;
                    }

                    .modal-button:disabled {
                        opacity: .6;
                        cursor: not-allowed;
                    }

                    @media (max-width:1150px) {
                        .packages-grid {
                            grid-template-columns:
                                repeat(2, minmax(0,1fr));
                        }
                    }

                    @media (max-width:1050px) {
                        .packages-stats {
                            grid-template-columns:
                                repeat(2, minmax(0,1fr));
                        }
                    }

                    @media (max-width:760px) {
                        .packages-page {
                            padding: 20px 14px 40px;
                        }

                        .packages-header {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .packages-primary {
                            width: 100%;
                        }

                        .packages-toolbar {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .packages-search {
                            width: 100%;
                        }

                        .packages-toolbar-count {
                            text-align: right;
                        }

                        .packages-grid {
                            grid-template-columns: 1fr;
                            padding: 14px;
                        }

                        .packages-modal {
                            max-height: 96vh;
                            border-radius: 19px;
                        }

                        .packages-form {
                            padding: 18px;
                        }

                        .form-grid {
                            grid-template-columns: 1fr;
                        }

                        .form-field.full {
                            grid-column: auto;
                        }

                        .modal-actions {
                            flex-direction: column-reverse;
                        }

                        .modal-button {
                            width: 100%;
                        }
                    }

                    @media (max-width:450px) {
                        .packages-stats {
                            grid-template-columns: 1fr;
                        }

                        .packages-heading h1 {
                            font-size: 26px;
                        }

                        .packages-heading-icon {
                            width: 50px;
                            height: 50px;
                        }
                    }
                `}</style>

                <div className="packages-container">
                    <div className="packages-header">
                        <div className="packages-heading">
                            <div className="packages-heading-icon">
                                ☀
                            </div>

                            <div>
                                <span className="packages-eyebrow">
                                    SOLARTECH ENERGY / ADMIN
                                </span>

                                <h1>
                                    Системы SolarTech
                                </h1>

                                <p>
                                    Готовые солнечные системы
                                    для клиентов
                                </p>
                            </div>
                        </div>

                        <button
                            className="packages-primary"
                            onClick={openCreate}
                        >
                            ＋ Добавить систему
                        </button>
                    </div>

                    {error && !showModal && (
                        <div className="packages-alert packages-error">
                            ⚠ {error}
                        </div>
                    )}

                    {success && (
                        <div className="packages-alert packages-success">
                            ✓ {success}
                        </div>
                    )}

                    <div className="packages-stats">
                        <div className="packages-stat">
                            <div className="packages-stat-icon">
                                ☀
                            </div>
                            <span className="packages-stat-label">
                                Всего систем
                            </span>
                            <strong className="packages-stat-value">
                                {packages.length}
                            </strong>
                        </div>

                        <div className="packages-stat">
                            <div className="packages-stat-icon">
                                ✓
                            </div>
                            <span className="packages-stat-label">
                                Активные
                            </span>
                            <strong className="packages-stat-value">
                                {activeCount}
                            </strong>
                        </div>

                        <div className="packages-stat">
                            <div className="packages-stat-icon">
                                ⚡
                            </div>
                            <span className="packages-stat-label">
                                Максимальная мощность
                            </span>
                            <strong className="packages-stat-value">
                                {maxPower || 0} kW
                            </strong>
                        </div>

                        <div className="packages-stat">
                            <div className="packages-stat-icon">
                                ₸
                            </div>
                            <span className="packages-stat-label">
                                Сумма всех пакетов
                            </span>
                            <strong className="packages-stat-value">
                                {totalValue.toLocaleString(
                                    "ru-RU",
                                )}{" "}
                                <small
                                    style={{
                                        fontSize: 10,
                                        color: "#829087",
                                    }}
                                >
                                    TJS
                                </small>
                            </strong>
                        </div>
                    </div>

                    <div className="packages-card">
                        <div className="packages-toolbar">
                            <div className="packages-search">
                                <span>⌕</span>
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Поиск системы..."
                                />
                            </div>

                            <div className="packages-toolbar-count">
                                Показано{" "}
                                <strong>
                                    {filteredPackages.length}
                                </strong>{" "}
                                из{" "}
                                <strong>
                                    {packages.length}
                                </strong>
                            </div>
                        </div>

                        <div className="packages-grid">
                            {loading ? (
                                <div className="packages-empty">
                                    <div className="packages-empty-icon">
                                        ⟳
                                    </div>
                                    <h3>
                                        Загружаем системы...
                                    </h3>
                                </div>
                            ) : filteredPackages.length === 0 ? (
                                <div className="packages-empty">
                                    <div className="packages-empty-icon">
                                        ☀
                                    </div>
                                    <h3>
                                        Системы не найдены
                                    </h3>
                                    <p>
                                        Проверь API
                                        <strong>
                                            {" "}
                                            /system-packages
                                        </strong>{" "}
                                        или измените
                                        поисковый запрос.
                                    </p>
                                </div>
                            ) : (
                                filteredPackages.map(
                                    (item) => (
                                        <article
                                            className="package-card"
                                            key={item.id}
                                        >
                                            <div className="package-top">
                                                <PackageIcon
                                                    power={
                                                        item.system_power_kw
                                                    }
                                                />

                                                <span
                                                    className={
                                                        item.is_active
                                                            ? "package-status active"
                                                            : "package-status inactive"
                                                    }
                                                >
                                                    <span className="package-dot" />
                                                    {item.is_active
                                                        ? "Активна"
                                                        : "Выключена"}
                                                </span>
                                            </div>

                                            <div className="package-content">
                                                <h3>
                                                    {item.name}
                                                </h3>

                                                <p className="package-description">
                                                    {item.description ||
                                                        "Готовая солнечная система SolarTech."}
                                                </p>

                                                <div className="package-price-row">
                                                    <div>
                                                        <span className="package-price-label">
                                                            Цена системы
                                                        </span>

                                                        <strong className="package-price">
                                                            {item.total_price.toLocaleString(
                                                                "ru-RU",
                                                            )}{" "}
                                                            <span>
                                                                TJS
                                                            </span>
                                                        </strong>
                                                    </div>

                                                    <span className="package-power">
                                                        {getPowerLabel(
                                                            item.system_power_kw,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="package-actions">
                                                    <button
                                                        type="button"
                                                        className="package-action package-edit"
                                                        onClick={() =>
                                                            openEdit(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        ✏️ Редактировать
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="package-action package-delete"
                                                        onClick={() =>
                                                            deletePackage(
                                                                item,
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ),
                                )
                            )}
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div
                        className="packages-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeModal();
                            }
                        }}
                    >
                        <div className="packages-modal">
                            <div className="packages-modal-header">
                                <div>
                                    <span className="modal-label">
                                        SOLARTECH / SYSTEM
                                    </span>

                                    <h2>
                                        {editingPackage
                                            ? "Редактировать систему"
                                            : "Добавить систему"}
                                    </h2>

                                    <p>
                                        {editingPackage
                                            ? `Изменение системы #${editingPackage.id}`
                                            : "Новая готовая система для калькулятора"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                className="packages-form"
                                onSubmit={savePackage}
                            >
                                <div className="form-title">
                                    Основная информация
                                </div>

                                <div className="form-grid">
                                    <div className="form-field full">
                                        <label>
                                            Название системы *
                                        </label>

                                        <input
                                            value={form.name}
                                            onChange={(event) =>
                                                updateField(
                                                    "name",
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            placeholder="Например: SolarTech 25 kW"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Мощность системы, kW *
                                        </label>

                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={
                                                form.system_power_kw
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "system_power_kw",
                                                    Number(
                                                        event.target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />

                                        <div className="power-presets">
                                            {STANDARD_POWERS.map(
                                                (power) => (
                                                    <button
                                                        key={power}
                                                        type="button"
                                                        className={
                                                            form.system_power_kw ===
                                                            power
                                                                ? "power-preset active"
                                                                : "power-preset"
                                                        }
                                                        onClick={() =>
                                                            updateField(
                                                                "system_power_kw",
                                                                power,
                                                            )
                                                        }
                                                    >
                                                        {power}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Цена, TJS *
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={
                                                form.total_price
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "total_price",
                                                    Number(
                                                        event.target
                                                            .value,
                                                    ),
                                                )
                                            }
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="form-field full">
                                        <label>
                                            Описание
                                        </label>

                                        <textarea
                                            value={
                                                form.description
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "description",
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            placeholder="Например: готовая система для дома..."
                                        />
                                    </div>
                                </div>

                                <label className="active-option">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.is_active
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "is_active",
                                                event.target
                                                    .checked,
                                            )
                                        }
                                    />

                                    Показывать эту систему
                                    клиенту в калькуляторе
                                </label>

                                {error && (
                                    <div className="packages-alert packages-error">
                                        ⚠ {error}
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="modal-button modal-cancel"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Отмена
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-button modal-save"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Сохраняем..."
                                            : editingPackage
                                                ? "Сохранить изменения"
                                                : "Добавить систему"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminPackagesPage;
