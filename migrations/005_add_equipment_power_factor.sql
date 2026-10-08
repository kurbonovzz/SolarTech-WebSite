ALTER TABLE equipment_types
    ADD COLUMN power_factor NUMERIC(5, 2) NOT NULL DEFAULT 1.00;