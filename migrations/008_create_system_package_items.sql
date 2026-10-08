CREATE TABLE system_package_items (
                                      id BIGSERIAL PRIMARY KEY,

                                      system_package_id BIGINT NOT NULL,
                                      product_id BIGINT NOT NULL,

                                      quantity INTEGER NOT NULL DEFAULT 1,

                                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                      CONSTRAINT fk_package_items_package
                                          FOREIGN KEY (system_package_id)
                                              REFERENCES system_packages(id)
                                              ON DELETE CASCADE,

                                      CONSTRAINT fk_package_items_product
                                          FOREIGN KEY (product_id)
                                              REFERENCES products(id),

                                      CONSTRAINT chk_package_items_quantity
                                          CHECK (quantity > 0),

                                      CONSTRAINT uq_package_product
                                          UNIQUE (system_package_id, product_id)
);