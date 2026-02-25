-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: townshipseats
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_item` (`user_id`,`menu_item_id`),
  KEY `menu_item_id` (`menu_item_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Shisanyama','Authentic braai meat and sides'),(2,'Kotas','The legendary township bunny chow'),(3,'Mogodu','Tripe, trotters, and hardbody chicken'),(4,'Street Food','Magwinya, Achaar, and quick bites'),(5,'Burgers','Juicy gourmet and classic burgers'),(6,'Pizza','Freshly baked, hot and cheesy pizzas'),(7,'Chicken','Fried, grilled, or stewed chicken');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `sender_role` enum('customer','vendor','driver','guest') NOT NULL,
  `sender_name` varchar(100) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `receiver_type` enum('vendor','driver','support') DEFAULT 'support',
  `receiver_id` int DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','replied') DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`,`sender_role`),
  KEY `idx_receiver` (`receiver_type`,`receiver_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_deliveries`
--

DROP TABLE IF EXISTS `driver_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_deliveries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `driver_user_id` int NOT NULL,
  `earnings_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('accepted','picked_up','delivered') NOT NULL DEFAULT 'accepted',
  `accepted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_driver_deliveries_driver_date` (`driver_user_id`,`accepted_at`),
  KEY `idx_driver_deliveries_status` (`status`),
  CONSTRAINT `fk_driver_deliveries_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_driver_deliveries_user` FOREIGN KEY (`driver_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_deliveries`
--

LOCK TABLES `driver_deliveries` WRITE;
/*!40000 ALTER TABLE `driver_deliveries` DISABLE KEYS */;
INSERT INTO `driver_deliveries` VALUES (3,1,7,25.00,'accepted','2026-02-25 19:15:47',NULL,'2026-02-25 19:15:47','2026-02-25 19:15:47'),(4,2,8,25.00,'accepted','2026-02-25 19:55:17',NULL,'2026-02-25 19:55:17','2026-02-25 19:55:17');
/*!40000 ALTER TABLE `driver_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=603 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (101,1,2,'Kota Special','Classic Kota with all the trimmings',65.00,1),(102,1,3,'Mogodu & Pap','Traditional tripe stew served with pap',75.00,1),(103,1,3,'Skop','Grilled lamb head',90.00,1),(201,2,1,'Mixed Grill Platter','Wors, chops, and brisket for 2',250.00,1),(202,2,7,'Quarter Chicken & Chips','Flame grilled chicken leg',65.00,1),(203,2,1,'Steak & Pap','Tender steak served with gravy and pap',120.00,1),(204,2,1,'Wors Roll','Boerewors in a fresh roll with relish',50.00,1),(301,3,5,'Cheese Burger','Juicy beef patty with cheddar cheese',85.00,1),(302,3,5,'Chicken Burger','Crispy chicken fillet with fresh lettuce',75.00,1),(303,3,5,'Loaded Fries','Fries topped with bacon and cheese',55.00,1),(401,4,3,'Hardbody Chicken','Slow cooked marathon chicken',85.00,1),(402,4,3,'Dombolo & Stew','Beef stew with steamed dumplings',80.00,1),(403,4,3,'Samp & Beans','Creamy samp and beans',50.00,1),(501,5,2,'The Boss Kota','Polony, viennas, russian, cheese, egg',95.00,1),(502,5,2,'Student Kota','Chips, polony and atchar',35.00,1),(503,5,4,'Russian & Chips','Fried russian sausage with chips',45.00,1),(601,6,6,'Meaty Supreme','Ham, bacon, pepperoni, chicken',130.00,1),(602,6,6,'Hawaiian','Ham and pineapple',100.00,1);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `menu_item_id` (`menu_item_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,101,1,60.00,60.00),(2,2,101,1,65.00,65.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready','delivered','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `payfast_payment_id` varchar(100) DEFAULT NULL,
  `delivery_address` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,5,1,'ORD-1772044464689-9476',60.00,25.00,85.00,'confirmed','paid',NULL,'123 Main Street, Cape Town','2026-02-25 18:34:24'),(2,5,1,'ORD-1772049152175-7322',65.00,25.00,90.00,'confirmed','paid',NULL,'123 Main Street, Cape Town','2026-02-25 19:52:32');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','vendor','driver') COLLATE utf8mb4_unicode_ci DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test_customer','customer@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.4p.orgTt6C3fYsKHGqXXYQTJ5Hq','customer','2026-02-25 18:15:21','2026-02-25 18:15:21'),(2,'test_vendor','vendor@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.4p.orgTt6C3fYsKHGqXXYQTJ5Hq','vendor','2026-02-25 18:15:21','2026-02-25 18:15:21'),(3,'test_driver','driver@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.4p.orgTt6C3fYsKHGqXXYQTJ5Hq','driver','2026-02-25 18:15:21','2026-02-25 18:15:21'),(4,'charlton','charlton@gmail.com','$2b$10$LcIB14odyMueffV67jKriuO/MNi9Z.IASCg38NrlMHvg7aUzJfOKe','vendor','2026-02-25 18:32:20','2026-02-25 18:32:20'),(5,'che','chefernandez448@gmail.com','$2b$10$xHq9vLMOUNXI/wb2KJALFOB041L5zdFhlZRTFPOMgLF8jE3lhcmIC','customer','2026-02-25 18:33:51','2026-02-25 18:33:51'),(6,'zahra','zahra@gmail.com','$2b$10$EaspCHHZWaNnB.KaWY25sOunGui0VlEh46d.UJ9BklUGlcZH2pHMC','customer','2026-02-25 18:51:51','2026-02-25 18:51:51'),(7,'nina','nina@gmail.com','$2b$10$iZHQDofmK9s9gUuMnjor2OfdqAE3WA3B7wUFyPq.Pzode10fOJgru','driver','2026-02-25 18:55:01','2026-02-25 18:55:01'),(8,'ty','ty@gmail.com','$2b$10$E4TXyMX0Gr/.JF8stZt1UO9VPj2bhUDBoP3gmSjIfm3n7jI7i8XsS','driver','2026-02-25 19:54:45','2026-02-25 19:54:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `business_name` varchar(100) NOT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT '25.00',
  `is_active` tinyint(1) DEFAULT '1',
  `rating` decimal(3,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `vendors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,4,'Kasi Flavours','Traditional SA',25.00,1,4.50,'2026-02-25 18:15:21'),(2,NULL,'Vusi\'s Shisanyama','Braai & Meat',30.00,1,4.90,'2026-02-25 18:15:21'),(3,NULL,'Gourmet Grills','Burgers & BBQ',20.00,1,4.80,'2026-02-25 18:15:21'),(4,NULL,'Mama Nandi\'s Kitchen','Home Cooked',15.00,1,4.70,'2026-02-25 18:15:21'),(5,NULL,'Kasi King Kotas','Street Food',10.00,1,4.60,'2026-02-25 18:15:21'),(6,NULL,'Pizza Zone','Italian',25.00,1,4.50,'2026-02-25 18:15:21');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-25 22:04:06
