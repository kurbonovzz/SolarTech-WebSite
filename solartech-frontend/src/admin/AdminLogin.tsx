import { useState } from "react";

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
            // Если VITE_API_URL неправильный,
            // используем адрес компьютера, с которого открыт сайт.
        }
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
})();

function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        setError("");

        if (!username.trim()) {
            setError("Введите логин.");
            return;
        }

        if (!password) {
            setError("Введите пароль.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password,
                    }),
                },
            );

            // Сначала читаем ответ как текст.
            // Это защищает от ошибки:
            // "Unexpected end of JSON input"
            const responseText = await response.text();

            let data: {
                token?: string;
                error?: string;
                message?: string;
            } = {};

            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    throw new Error(
                        `Сервер вернул некорректный ответ (${response.status}).`,
                    );
                }
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    `Ошибка авторизации: ${response.status}`,
                );
            }

            if (!data.token) {
                throw new Error(
                    "Сервер не вернул JWT токен.",
                );
            }

            localStorage.setItem(
                "solartech_admin_token",
                data.token,
            );

            window.location.href = "/admin/orders";
        } catch (err) {
            console.error("LOGIN ERROR:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Ошибка авторизации.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f7f2",
                padding: "20px",
                boxSizing: "border-box",
                fontFamily:
                    "Arial, Helvetica, sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "#fff",
                    padding: "35px",
                    borderRadius: "16px",
                    boxShadow:
                        "0 5px 25px rgba(0,0,0,0.08)",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "42px",
                            marginBottom: "10px",
                        }}
                    >
                        ☀️
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "28px",
                        }}
                    >
                        SolarTech
                    </h1>

                    <p
                        style={{
                            color: "#777",
                            marginTop: "8px",
                        }}
                    >
                        Вход в панель администратора
                    </p>
                </div>

                <form onSubmit={login}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 600,
                        }}
                    >
                        Логин
                    </label>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Введите логин"
                        autoComplete="username"
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginBottom: "18px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            fontSize: "15px",
                            boxSizing: "border-box",
                        }}
                    />

                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 600,
                        }}
                    >
                        Пароль
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Введите пароль"
                        autoComplete="current-password"
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginBottom: "20px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            fontSize: "15px",
                            boxSizing: "border-box",
                        }}
                    />

                    {error && (
                        <div
                            style={{
                                background: "#ffe5e5",
                                color: "#c62828",
                                padding: "12px",
                                borderRadius: "8px",
                                marginBottom: "18px",
                                fontSize: "14px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#6aa832",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: loading
                                ? "default"
                                : "pointer",
                        }}
                    >
                        {loading
                            ? "Входим..."
                            : "Войти"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;