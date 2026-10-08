CREATE TABLE system_packages (
                                 id BIGSERIAL PRIMARY KEY,

                                 name VARCHAR(150) NOT NULL,

                                 system_power_kw NUMERIC(10, 2) NOT NULL,

                                 description TEXT,

                                 total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,

                                 is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                 CONSTRAINT chk_system_package_power
                                     CHECK (system_power_kw > 0),

                                 CONSTRAINT chk_system_package_price
                                     CHECK (total_price >= 0)
);