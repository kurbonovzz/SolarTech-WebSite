
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import AdminPackagesPage from "./AdminPackages";

type EquipmentType = {
    id: number;
    name: string;
    default_power_w: number;
    average_power_w: number;
    default_hours_per_day: number;
    description: string;
    is_active: boolean;
    power_factor: number;
    calculation_type: string;
};

type FormData = {
    name: string;
    default_power_w: number;
    average_power_w: number;
    default_hours_per_day: number;
    power_factor: number;
    description: string;
    is_active: boolean;
    calculation_type: string;
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
            // fallback
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

const emptyForm: FormData = {
    name: "",
    default_power_w: 1000,
    average_power_w: 800,
    default_hours_per_day: 1,
    power_factor: 0.8,
    description: "",
    is_active: true,
    calculation_type: "quantity",
};

function EquipmentIcon({
                           type,
                       }: {
    type: EquipmentType;
}) {
    const name = type.name.toLowerCase();

    let icon = "⚡";

    if (name.includes("холод")) icon = "❄";
    else if (name.includes("кондиц")) icon = "❄";
    else if (name.includes("телевиз")) icon = "▣";
    else if (name.includes("стира")) icon = "◉";
    else if (name.includes("чайник")) icon = "☕";
    else if (name.includes("пылесос")) icon = "◌";
    else if (name.includes("утюг")) icon = "▱";
    else if (name.includes("освещ")) icon = "☀";
    else if (name.includes("радиатор")) icon = "♨";
    else if (name.includes("тёплый") || name.includes("теплый"))
        icon = "♨";
    else if (name.includes("керхер")) icon = "≋";
    else if (name.includes("плита")) icon = "▤";
    else if (name.includes("духов")) icon = "▤";
    else if (name.includes("термекс")) icon = "♨";
    else if (name.includes("насос")) icon = "◉";
    else if (name.includes("микроволн")) icon = "◉";
    else if (name.includes("фен")) icon = "≋";

    return (
        <div className="equipment-icon">
            {icon}
        </div>
    );
}

function EquipmentTypesPage() {
    const [items, setItems] = useState<EquipmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] =
        useState<EquipmentType | null>(null);

    const [form, setForm] = useState<FormData>({
        ...emptyForm,
    });

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/equipment-types`,
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось загрузить технику.",
                );
            }

            setItems(
                Array.isArray(data.equipment_types)
                    ? data.equipment_types
                    : [],
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка загрузки.",
            );
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingItem(null);
        setForm({ ...emptyForm });
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function openEdit(item: EquipmentType) {
        setEditingItem(item);

        setForm({
            name: item.name,
            default_power_w: item.default_power_w,
            average_power_w: item.average_power_w,
            default_hours_per_day:
            item.default_hours_per_day,
            power_factor: item.power_factor,
            description: item.description || "",
            is_active: item.is_active,
            calculation_type:
                item.calculation_type || "quantity",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function closeModal() {
        if (saving) return;

        setShowModal(false);
        setEditingItem(null);
        setForm({ ...emptyForm });
    }

    function updateField(
        field: keyof FormData,
        value: string | number | boolean,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function createEquipmentType(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Введите название техники.");
            return;
        }

        if (form.default_power_w <= 0) {
            setError(
                "Мощность должна быть больше 0 Вт.",
            );
            return;
        }

        if (form.power_factor <= 0) {
            setError(
                "Коэффициент должен быть больше 0.",
            );
            return;
        }

        const token = localStorage.getItem(
            "solartech_admin_token",
        );

        if (!token) {
            window.location.href = "/admin/login";
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/equipment-types`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        default_power_w:
                            Number(
                                form.default_power_w,
                            ),
                        average_power_w:
                            Number(
                                form.average_power_w,
                            ),
                        default_hours_per_day:
                            Number(
                                form.default_hours_per_day,
                            ),
                        power_factor:
                            Number(
                                form.power_factor,
                            ),
                        description:
                            form.description.trim(),
                        is_active:
                        form.is_active,
                        calculation_type:
                        form.calculation_type,
                    }),
                },
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );

                window.location.href =
                    "/admin/login";

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось добавить технику.",
                );
            }

            setSuccess(
                "Техника успешно добавлена.",
            );

            setShowModal(false);
            setForm({ ...emptyForm });

            await loadItems();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка добавления.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function updateEquipmentType(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!editingItem) {
            await createEquipmentType(event);
            return;
        }

        if (!form.name.trim()) {
            setError("Введите название техники.");
            return;
        }

        if (form.default_power_w <= 0) {
            setError("Мощность должна быть больше 0 Вт.");
            return;
        }

        if (form.average_power_w < 0) {
            setError("Средняя мощность не может быть отрицательной.");
            return;
        }

        if (
            form.default_hours_per_day < 0 ||
            form.default_hours_per_day > 24
        ) {
            setError("Часы в день должны быть от 0 до 24.");
            return;
        }

        if (form.power_factor <= 0) {
            setError("Коэффициент должен быть больше 0.");
            return;
        }

        const token = localStorage.getItem(
            "solartech_admin_token",
        );

        if (!token) {
            window.location.href = "/admin/login";
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/equipment-types/${editingItem.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        default_power_w:
                            Number(form.default_power_w),
                        average_power_w:
                            Number(form.average_power_w),
                        default_hours_per_day:
                            Number(form.default_hours_per_day),
                        power_factor:
                            Number(form.power_factor),
                        description:
                            form.description.trim(),
                        is_active:
                            Boolean(form.is_active),
                        calculation_type:
                        form.calculation_type,
                    }),
                },
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );
                window.location.href = "/admin/login";
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось изменить технику.",
                );
            }

            setSuccess("Техника успешно изменена.");
            setShowModal(false);
            setEditingItem(null);
            setForm({ ...emptyForm });

            await loadItems();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка изменения.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteEquipmentType(
        item: EquipmentType,
    ) {
        const confirmed = window.confirm(
            `Удалить «${item.name}» из калькулятора?`,
        );

        if (!confirmed) return;

        const token = localStorage.getItem(
            "solartech_admin_token",
        );

        if (!token) {
            window.location.href = "/admin/login";
            return;
        }

        try {
            setError("");
            setSuccess("");
            setSaving(true);

            const response = await fetch(
                `${API_URL}/equipment-types/${item.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem(
                    "solartech_admin_token",
                );
                window.location.href = "/admin/login";
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Не удалось удалить технику.",
                );
            }

            setSuccess(
                `«${item.name}» удалён из калькулятора.`,
            );

            await loadItems();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка удаления.",
            );
        } finally {
            setSaving(false);
        }
    }

    const filteredItems = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) return items;

        return items.filter((item) =>
            [
                item.name,
                item.description,
                item.calculation_type,
                String(item.default_power_w),
            ]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [items, search]);

    const activeCount = items.filter(
        (item) => item.is_active,
    ).length;

    const powerCount = items.filter(
        (item) =>
            item.calculation_type === "power",
    ).length;

    const averagePower =
        items.length > 0
            ? Math.round(
                items.reduce(
                    (sum, item) =>
                        sum +
                        item.default_power_w,
                    0,
                ) / items.length,
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
            window.location.href =
                routes[page];
        }
    }

    return (
        <AdminLayout
            activePage="equipment-types"
            onNavigate={navigate}
        >
            <div className="equipment-page">
                <style>{`
                    * {
                        box-sizing: border-box;
                    }

                    .equipment-page {
                        min-height: 100vh;
                        padding: 34px 36px 60px;
                        background:
                            radial-gradient(
                                circle at 90% 0%,
                                rgba(104,169,73,.08),
                                transparent 30%
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

                    .equipment-container {
                        width: 100%;
                        max-width: 1450px;
                        margin: 0 auto;
                    }

                    /* HEADER */

                    .equipment-header {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 25px;
                        margin-bottom: 28px;
                    }

                    .equipment-heading {
                        display: flex;
                        align-items: center;
                        gap: 17px;
                    }

                    .equipment-heading-icon {
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
                        font-size: 27px;
                        box-shadow:
                            0 12px 28px
                            rgba(68,133,52,.22);
                    }

                    .equipment-eyebrow {
                        display: block;
                        margin-bottom: 5px;
                        color: #5d9948;
                        font-size: 10px;
                        font-weight: 900;
                        letter-spacing: 2px;
                    }

                    .equipment-heading h1 {
                        margin: 0;
                        font-size: 30px;
                        line-height: 1.1;
                        letter-spacing: -1px;
                    }

                    .equipment-heading p {
                        margin: 7px 0 0;
                        color: #7c887f;
                        font-size: 13px;
                    }

                    .equipment-primary {
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

                    .equipment-primary:hover {
                        transform: translateY(-1px);
                    }

                    /* ALERT */

                    .equipment-alert {
                        margin-bottom: 18px;
                        padding: 13px 16px;
                        border-radius: 13px;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    .equipment-error {
                        border: 1px solid #f0d2ca;
                        background: #fff5f2;
                        color: #ad4e3c;
                    }

                    .equipment-success {
                        border: 1px solid #cfe4c8;
                        background: #f2faef;
                        color: #438035;
                    }

                    /* STATS */

                    .equipment-stats {
                        display: grid;
                        grid-template-columns:
                            repeat(4, minmax(0, 1fr));
                        gap: 15px;
                        margin-bottom: 22px;
                    }

                    .equipment-stat {
                        min-height: 122px;
                        padding: 21px;
                        border: 1px solid #e0e7dc;
                        border-radius: 18px;
                        background: white;
                        box-shadow:
                            0 7px 25px
                            rgba(34,53,37,.045);
                    }

                    .equipment-stat-icon {
                        width: 43px;
                        height: 43px;
                        display: grid;
                        place-items: center;
                        border-radius: 13px;
                        background: #edf7e9;
                        color: #56963f;
                        font-size: 20px;
                        font-weight: 900;
                    }

                    .equipment-stat:nth-child(2)
                        .equipment-stat-icon {
                        background: #f0f9ed;
                    }

                    .equipment-stat:nth-child(3)
                        .equipment-stat-icon {
                        background: #edf4fa;
                        color: #5185ae;
                    }

                    .equipment-stat:nth-child(4)
                        .equipment-stat-icon {
                        background: #fff4e6;
                        color: #d38a30;
                    }

                    .equipment-stat-label {
                        display: block;
                        margin-top: 15px;
                        color: #7d8980;
                        font-size: 11px;
                        font-weight: 700;
                    }

                    .equipment-stat-value {
                        display: block;
                        margin-top: 4px;
                        font-size: 25px;
                        line-height: 1;
                        letter-spacing: -.8px;
                    }

                    /* CARD */

                    .equipment-card {
                        overflow: hidden;
                        border: 1px solid #e0e7dc;
                        border-radius: 21px;
                        background: white;
                        box-shadow:
                            0 12px 40px
                            rgba(34,53,37,.055);
                    }

                    .equipment-toolbar {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 18px;
                        padding: 18px 20px;
                        border-bottom: 1px solid #edf0eb;
                        background: #fcfdfb;
                    }

                    .equipment-search {
                        width: min(520px,100%);
                        height: 45px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 0 14px;
                        border: 1px solid #dce5d9;
                        border-radius: 12px;
                        background: white;
                    }

                    .equipment-search span {
                        color: #87928a;
                        font-size: 17px;
                    }

                    .equipment-search input {
                        width: 100%;
                        height: 100%;
                        border: 0;
                        outline: 0;
                        color: #273229;
                        font-size: 12px;
                    }

                    .equipment-search input::placeholder {
                        color: #a1aaa3;
                    }

                    .equipment-toolbar-count {
                        color: #89948c;
                        font-size: 11px;
                    }

                    .equipment-toolbar-count strong {
                        color: #29352d;
                    }

                    /* TABLE */

                    .equipment-table-wrapper {
                        overflow-x: auto;
                    }

                    .equipment-table {
                        width: 100%;
                        min-width: 1050px;
                        border-collapse: collapse;
                    }

                    .equipment-table th {
                        padding: 15px 18px;
                        border-bottom: 1px solid #e9eee7;
                        background: #fafcf9;
                        color: #8a958d;
                        font-size: 9px;
                        font-weight: 900;
                        letter-spacing: 1px;
                        text-align: left;
                        white-space: nowrap;
                    }

                    .equipment-table td {
                        padding: 16px 18px;
                        border-bottom: 1px solid #edf0ec;
                        color: #39453d;
                        font-size: 12px;
                        vertical-align: middle;
                    }

                    .equipment-table tr:hover td {
                        background: #fbfdf9;
                    }

                    .equipment-table tr:last-child td {
                        border-bottom: 0;
                    }

                    .equipment-product {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        min-width: 245px;
                    }

                    .equipment-icon {
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

                    .equipment-name strong {
                        display: block;
                        color: #1f2b23;
                        font-size: 13px;
                        font-weight: 850;
                    }

                    .equipment-name small {
                        display: block;
                        max-width: 270px;
                        margin-top: 4px;
                        overflow: hidden;
                        color: #99a39c;
                        font-size: 10px;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .equipment-number {
                        color: #344139;
                        font-size: 12px;
                        font-weight: 800;
                        white-space: nowrap;
                    }

                    .equipment-number-sub {
                        display: block;
                        margin-top: 4px;
                        color: #a0aaa2;
                        font-size: 9px;
                    }

                    .equipment-factor {
                        display: inline-flex;
                        align-items: center;
                        padding: 7px 10px;
                        border: 1px solid #e1e8de;
                        border-radius: 9px;
                        background: #f8faf7;
                        color: #536057;
                        font-size: 10px;
                        font-weight: 900;
                    }

                    .calculation-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 7px 10px;
                        border-radius: 9px;
                        font-size: 10px;
                        font-weight: 900;
                    }

                    .calculation-badge.quantity {
                        border: 1px solid #dcebd7;
                        background: #f1f9ee;
                        color: #4c8b3c;
                    }

                    .calculation-badge.power {
                        border: 1px solid #d5e4f0;
                        background: #eef6fb;
                        color: #4e82a7;
                    }

                    .equipment-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 7px 10px;
                        border-radius: 9px;
                        font-size: 9px;
                        font-weight: 900;
                        white-space: nowrap;
                    }

                    .equipment-status.active {
                        border: 1px solid #d7ead2;
                        background: #f0f9ed;
                        color: #4c8e3c;
                    }

                    .equipment-status.inactive {
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

                    /* ACTIONS */

                    .equipment-actions {
                        display: flex;
                        align-items: center;
                        gap: 7px;
                    }

                    .equipment-action {
                        width: 35px;
                        height: 35px;
                        display: grid;
                        place-items: center;
                        border-radius: 9px;
                        cursor: pointer;
                        font-size: 14px;
                        transition:
                            transform .15s ease,
                            background .15s ease,
                            border-color .15s ease;
                    }

                    .equipment-action:hover:not(:disabled) {
                        transform: translateY(-1px);
                    }

                    .equipment-action:disabled {
                        opacity: .5;
                        cursor: not-allowed;
                    }

                    .equipment-action.edit {
                        border: 1px solid #dce8d8;
                        background: #f4f9f2;
                    }

                    .equipment-action.edit:hover:not(:disabled) {
                        background: #eaf5e6;
                        border-color: #c9ddc3;
                    }

                    .equipment-action.delete {
                        border: 1px solid #efd9d4;
                        background: #fff6f4;
                    }

                    .equipment-action.delete:hover:not(:disabled) {
                        background: #ffebe7;
                        border-color: #e5bfb7;
                    }

                    /* EMPTY */

                    .equipment-empty {
                        min-height: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        color: #8b968e;
                        text-align: center;
                    }

                    .equipment-empty-icon {
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

                    .equipment-empty h3 {
                        margin: 0;
                        color: #2b362f;
                        font-size: 17px;
                    }

                    .equipment-empty p {
                        margin: 7px 0 0;
                        font-size: 11px;
                    }

                    /* MODAL */

                    .equipment-overlay {
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

                    .equipment-modal {
                        width: min(760px,100%);
                        max-height: 92vh;
                        overflow-y: auto;
                        border: 1px solid #dfe8db;
                        border-radius: 24px;
                        background: #fbfdf9;
                        box-shadow:
                            0 35px 100px
                            rgba(0,0,0,.32);
                    }

                    .equipment-modal-header {
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

                    .equipment-modal-header h2 {
                        margin: 0;
                        color: #202b24;
                        font-size: 22px;
                    }

                    .equipment-modal-header p {
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

                    .equipment-form {
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
                            repeat(2,minmax(0,1fr));
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
                    .form-field select,
                    .form-field textarea {
                        width: 100%;
                        border: 1px solid #dce5d9;
                        border-radius: 11px;
                        outline: none;
                        background: white;
                        color: #29342d;
                        font-size: 12px;
                    }

                    .form-field input,
                    .form-field select {
                        height: 43px;
                        padding: 0 12px;
                    }

                    .form-field textarea {
                        min-height: 95px;
                        padding: 12px;
                        resize: vertical;
                    }

                    .form-field input:focus,
                    .form-field select:focus,
                    .form-field textarea:focus {
                        border-color: #77a967;
                        box-shadow:
                            0 0 0 3px
                            rgba(91,153,67,.08);
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

                    /* RESPONSIVE */

                    @media (max-width:1100px) {
                        .equipment-stats {
                            grid-template-columns:
                                repeat(2,minmax(0,1fr));
                        }
                    }

                    @media (max-width:760px) {
                        .equipment-page {
                            padding: 20px 14px 40px;
                        }

                        .equipment-header {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .equipment-primary {
                            width: 100%;
                        }

                        .equipment-toolbar {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .equipment-search {
                            width: 100%;
                        }

                        .equipment-toolbar-count {
                            text-align: right;
                        }

                        .equipment-modal {
                            max-height: 96vh;
                            border-radius: 19px;
                        }

                        .equipment-form {
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
                        .equipment-stats {
                            grid-template-columns: 1fr;
                        }

                        .equipment-heading h1 {
                            font-size: 26px;
                        }

                        .equipment-heading-icon {
                            width: 50px;
                            height: 50px;
                        }
                    }
                `}</style>

                <div className="equipment-container">

                    {/* HEADER */}

                    <div className="equipment-header">
                        <div className="equipment-heading">
                            <div className="equipment-heading-icon">
                                ⚡
                            </div>

                            <div>
                                <span className="equipment-eyebrow">
                                    SOLARTECH ENERGY / ADMIN
                                </span>

                                <h1>
                                    Типы техники
                                </h1>

                                <p>
                                    Электроприборы для
                                    расчёта солнечной
                                    системы
                                </p>
                            </div>
                        </div>

                        <button
                            className="equipment-primary"
                            onClick={openCreate}
                        >
                            ＋ Добавить технику
                        </button>
                    </div>

                    {/* ALERT */}

                    {error && !showModal && (
                        <div className="equipment-alert equipment-error">
                            ⚠ {error}
                        </div>
                    )}

                    {success && (
                        <div className="equipment-alert equipment-success">
                            ✓ {success}
                        </div>
                    )}

                    {/* STATS */}

                    <div className="equipment-stats">

                        <div className="equipment-stat">
                            <div className="equipment-stat-icon">
                                ⚡
                            </div>

                            <span className="equipment-stat-label">
                                Всего техники
                            </span>

                            <strong className="equipment-stat-value">
                                {items.length}
                            </strong>
                        </div>

                        <div className="equipment-stat">
                            <div className="equipment-stat-icon">
                                ✓
                            </div>

                            <span className="equipment-stat-label">
                                Активные
                            </span>

                            <strong className="equipment-stat-value">
                                {activeCount}
                            </strong>
                        </div>

                        <div className="equipment-stat">
                            <div className="equipment-stat-icon">
                                ⚙
                            </div>

                            <span className="equipment-stat-label">
                                Расчёт по мощности
                            </span>

                            <strong className="equipment-stat-value">
                                {powerCount}
                            </strong>
                        </div>

                        <div className="equipment-stat">
                            <div className="equipment-stat-icon">
                                W
                            </div>

                            <span className="equipment-stat-label">
                                Средняя мощность
                            </span>

                            <strong className="equipment-stat-value">
                                {averagePower.toLocaleString(
                                    "ru-RU",
                                )}{" "}
                                W
                            </strong>
                        </div>

                    </div>

                    {/* TABLE */}

                    <div className="equipment-card">

                        <div className="equipment-toolbar">

                            <div className="equipment-search">
                                <span>⌕</span>

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="Поиск техники..."
                                />
                            </div>

                            <div className="equipment-toolbar-count">
                                Показано{" "}
                                <strong>
                                    {
                                        filteredItems.length
                                    }
                                </strong>{" "}
                                из{" "}
                                <strong>
                                    {items.length}
                                </strong>
                            </div>

                        </div>

                        {loading ? (
                            <div className="equipment-empty">
                                <div className="equipment-empty-icon">
                                    ⟳
                                </div>

                                <h3>
                                    Загружаем технику...
                                </h3>
                            </div>
                        ) : filteredItems.length ===
                        0 ? (
                            <div className="equipment-empty">
                                <div className="equipment-empty-icon">
                                    ⌕
                                </div>

                                <h3>
                                    Техника не найдена
                                </h3>

                                <p>
                                    Измените поисковый
                                    запрос.
                                </p>
                            </div>
                        ) : (
                            <div className="equipment-table-wrapper">

                                <table className="equipment-table">

                                    <thead>
                                    <tr>
                                        <th>
                                            Техника
                                        </th>

                                        <th>
                                            Мощность
                                        </th>

                                        <th>
                                            Средняя
                                        </th>

                                        <th>
                                            Часы / день
                                        </th>

                                        <th>
                                            Коэффициент
                                        </th>

                                        <th>
                                            Расчёт
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
                                    {filteredItems.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td>
                                                    <div className="equipment-product">

                                                        <EquipmentIcon
                                                            type={
                                                                item
                                                            }
                                                        />

                                                        <div className="equipment-name">
                                                            <strong>
                                                                {
                                                                    item.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                {item.description ||
                                                                    `ID #${item.id}`}
                                                            </small>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                        <span className="equipment-number">
                                                            {item.default_power_w.toLocaleString(
                                                                "ru-RU",
                                                            )}{" "}
                                                            W
                                                        </span>
                                                </td>

                                                <td>
                                                        <span className="equipment-number">
                                                            {item.average_power_w.toLocaleString(
                                                                "ru-RU",
                                                            )}{" "}
                                                            W
                                                        </span>
                                                </td>

                                                <td>
                                                        <span className="equipment-number">
                                                            {
                                                                item.default_hours_per_day
                                                            }{" "}
                                                            ч
                                                        </span>
                                                </td>

                                                <td>
                                                        <span className="equipment-factor">
                                                            {item.power_factor.toFixed(
                                                                2,
                                                            )}
                                                        </span>
                                                </td>

                                                <td>
                                                        <span
                                                            className={
                                                                item.calculation_type ===
                                                                "power"
                                                                    ? "calculation-badge power"
                                                                    : "calculation-badge quantity"
                                                            }
                                                        >
                                                            {item.calculation_type ===
                                                            "power"
                                                                ? "По мощности"
                                                                : "По количеству"}
                                                        </span>
                                                </td>

                                                <td>
                                                    {item.is_active ? (
                                                        <span className="equipment-status active">
                                                                <span className="status-dot" />
                                                                Активен
                                                            </span>
                                                    ) : (
                                                        <span className="equipment-status inactive">
                                                                <span className="status-dot" />
                                                                Выключен
                                                            </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="equipment-actions">
                                                        <button
                                                            type="button"
                                                            className="equipment-action edit"
                                                            onClick={() =>
                                                                openEdit(item)
                                                            }
                                                            title="Редактировать"
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="equipment-action delete"
                                                            onClick={() =>
                                                                deleteEquipmentType(item)
                                                            }
                                                            title="Удалить"
                                                            disabled={saving}
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
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

                {/* MODAL */}

                {showModal && (
                    <div
                        className="equipment-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeModal();
                            }
                        }}
                    >
                        <div className="equipment-modal">

                            <div className="equipment-modal-header">

                                <div>
                                    <span className="modal-label">
                                        SOLARTECH / EQUIPMENT
                                    </span>

                                    <h2>
                                        {editingItem
                                            ? "Редактировать технику"
                                            : "Добавить технику"}
                                    </h2>

                                    <p>
                                        {editingItem
                                            ? `Изменение прибора #${editingItem.id}`
                                            : "Новый прибор для калькулятора"}
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
                                className="equipment-form"
                                onSubmit={
                                    updateEquipmentType
                                }
                            >

                                <div className="form-title">
                                    Основная информация
                                </div>

                                <div className="form-grid">

                                    <div className="form-field full">
                                        <label>
                                            Название техники *
                                        </label>

                                        <input
                                            value={
                                                form.name
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "name",
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            placeholder="Например: Кондиционер"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Мощность, Вт *
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={
                                                form.default_power_w
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "default_power_w",
                                                    Number(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Средняя мощность, Вт
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                form.average_power_w
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "average_power_w",
                                                    Number(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Часов в день
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={
                                                form.default_hours_per_day
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "default_hours_per_day",
                                                    Number(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Коэффициент нагрузки
                                        </label>

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={
                                                form.power_factor
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "power_factor",
                                                    Number(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Тип расчёта
                                        </label>

                                        <select
                                            value={
                                                form.calculation_type
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "calculation_type",
                                                    event.target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="quantity">
                                                По количеству
                                            </option>

                                            <option value="power">
                                                По мощности
                                            </option>
                                        </select>
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
                                            placeholder="Краткое описание прибора..."
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

                                    Показывать эту технику
                                    клиенту в калькуляторе
                                </label>

                                {error && (
                                    <div className="equipment-alert equipment-error">
                                        ⚠ {error}
                                    </div>
                                )}

                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="modal-button modal-cancel"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Отмена
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-button modal-save"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving
                                            ? "Сохраняем..."
                                            : editingItem
                                                ? "Сохранить изменения"
                                                : "Добавить технику"}
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

// =============================================================
// ОСТАЛЬНЫЕ РАЗДЕЛЫ — ПОКА СТАРАЯ ЗАГЛУШКА
// =============================================================

function SimpleAdminSection({
                                path,
                            }: {
    path: string;
}) {
    const pages: Record<
        string,
        {
            title: string;
            subtitle: string;
            icon: string;
            description: string;
        }
    > = {
        "/admin/customers": {
            title: "Клиенты",
            subtitle:
                "Управление клиентами SolarTech",
            icon: "👥",
            description:
                "Здесь будут отображаться клиенты, их телефоны, заявки и история заказов.",
        },

        "/admin/inventory": {
            title: "Склад",
            subtitle:
                "Управление остатками SolarTech",
            icon: "📦",
            description:
                "Здесь будет управление товарами, остатками и количеством на складе.",
        },

        "/admin/products": {
            title: "Товары",
            subtitle:
                "Каталог оборудования SolarTech",
            icon: "🛒",
            description:
                "Здесь будут солнечные панели, инверторы, аккумуляторы и другое оборудование.",
        },

        "/admin/packages": {
            title: "Системы SolarTech",
            subtitle:
                "Готовые солнечные системы",
            icon: "☀️",
            description:
                "Здесь будут пакеты 3.5 kW, 5 kW, 10 kW, 15 kW, 20 kW и 25 kW.",
        },
    };

    const page =
        pages[path] || {
            title: "Раздел",
            subtitle: "SolarTech Admin",
            icon: "☀️",
            description:
                "Раздел панели управления SolarTech.",
        };

    function navigate(pageName: string) {
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

        if (routes[pageName]) {
            window.location.href =
                routes[pageName];
        }
    }

    return (
        <AdminLayout
            activePage={getActivePage(path)}
            onNavigate={navigate}
        >
            <div className="admin-section-page">
                <div className="admin-section-header">
                    <div>
                        <div className="admin-section-icon">
                            {page.icon}
                        </div>

                        <h1>{page.title}</h1>

                        <p>{page.subtitle}</p>
                    </div>
                </div>

                <div className="admin-section-card">
                    <div className="admin-section-card-icon">
                        {page.icon}
                    </div>

                    <h2>{page.title}</h2>

                    <p>
                        {page.description}
                    </p>

                    <div className="admin-section-info">
                        <span>
                            SolarTech Energy
                        </span>

                        <span>
                            Панель администратора
                        </span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function getActivePage(path: string) {
    switch (path) {
        case "/admin/customers":
            return "customers";

        case "/admin/inventory":
            return "inventory";

        case "/admin/products":
            return "products";

        case "/admin/equipment-types":
            return "equipment-types";

        case "/admin/packages":
            return "packages";

        default:
            return "dashboard";
    }
}

export default function AdminSection() {
    const path = window.location.pathname;

    if (path === "/admin/equipment-types") {
        return <EquipmentTypesPage />;
    }

    if (path === "/admin/packages") {
        return <AdminPackagesPage />;
    }

    return <SimpleAdminSection path={path} />;
}