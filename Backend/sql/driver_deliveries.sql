CREATE TABLE IF NOT EXISTS driver_deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  driver_user_id INT NOT NULL,
  earnings_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('accepted','picked_up','delivered') NOT NULL DEFAULT 'accepted',
  accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_driver_deliveries_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_deliveries_user FOREIGN KEY (driver_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_driver_deliveries_driver_date (driver_user_id, accepted_at),
  INDEX idx_driver_deliveries_status (status)
);
