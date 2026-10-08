CREATE TABLE equipment_types (
                                 id BIGSERIAL PRIMARY KEY,

                                 name VARCHAR(150) NOT NULL UNIQUE,

                                 default_power_w INTEGER NOT NULL,

                                 description TEXT,

                                 is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);