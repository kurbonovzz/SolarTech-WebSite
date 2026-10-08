CREATE TABLE manufacturers (
                               id BIGSERIAL PRIMARY KEY,
                               name VARCHAR(150) NOT NULL,
                               country VARCHAR(100),
                               website VARCHAR(255),
                               description TEXT,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);