CREATE TABLE customer_equipment (
                                    id BIGSERIAL PRIMARY KEY,

                                    equipment_type_id BIGINT NOT NULL,

                                    quantity INTEGER NOT NULL DEFAULT 1,

                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                    CONSTRAINT fk_customer_equipment_type
                                        FOREIGN KEY (equipment_type_id)
                                            REFERENCES equipment_types(id),

                                    CONSTRAINT chk_customer_equipment_quantity
                                        CHECK (quantity > 0)
);