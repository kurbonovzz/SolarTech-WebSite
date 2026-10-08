CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,

                          manufacturer_id BIGINT NOT NULL,
                          category_id BIGINT NOT NULL,

                          name VARCHAR(200) NOT NULL,
                          model VARCHAR(150),

                          description TEXT,

                          power_w INTEGER,
                          capacity_kwh NUMERIC(10, 2),

                          price NUMERIC(12, 2) NOT NULL,
                          cost_price NUMERIC(12, 2),

                          stock_quantity INTEGER NOT NULL DEFAULT 0,
                          min_stock INTEGER NOT NULL DEFAULT 0,

                          warranty_months INTEGER,

                          is_active BOOLEAN NOT NULL DEFAULT TRUE,

                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_products_manufacturer
                              FOREIGN KEY (manufacturer_id)
                                  REFERENCES manufacturers(id),

                          CONSTRAINT fk_products_category
                              FOREIGN KEY (category_id)
                                  REFERENCES categories(id)
);