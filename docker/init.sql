-- ============================================================
--  QuickServe — Inicialización de bases de datos
--  Se ejecuta automáticamente al crear el contenedor MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurant_users     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS restaurant_orders    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS restaurant_menu      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS restaurant_payments  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS restaurant_reports   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS restaurant_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conceder permisos al usuario root desde cualquier host (necesario para Spring Boot en Docker)
GRANT ALL PRIVILEGES ON restaurant_users.*     TO 'root'@'%';
GRANT ALL PRIVILEGES ON restaurant_orders.*    TO 'root'@'%';
GRANT ALL PRIVILEGES ON restaurant_menu.*      TO 'root'@'%';
GRANT ALL PRIVILEGES ON restaurant_payments.*  TO 'root'@'%';
GRANT ALL PRIVILEGES ON restaurant_reports.*   TO 'root'@'%';
GRANT ALL PRIVILEGES ON restaurant_inventory.* TO 'root'@'%';
FLUSH PRIVILEGES;
