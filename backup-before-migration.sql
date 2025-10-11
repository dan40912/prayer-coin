-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: prayercoin_dev
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('01809441-c90a-47bf-beb0-1440b3f90e64','966c59d9aeab2e4a4dd1b29b4be904b699a0d469d183263abfe6e9c489293cd2','2025-09-27 01:50:35.318','20250927015035_add_owner_and_block_fields',NULL,NULL,'2025-09-27 01:50:35.233',1),('076fd011-4086-4805-aa97-4f1fea342f96','bb1678db52efde4430e7726655918a358eb7218bc248f648a572500217c395e9','2025-09-22 16:01:07.693','20250922160107_add_home_prayer_cards',NULL,NULL,'2025-09-22 16:01:07.668',1),('14198001-47b7-40f6-a489-f54f60621ae8','7f7fa6377cab4b65ae6266dbc273fa38dc9d613c01b465ffdd06b217ba5a4e2d','2025-09-29 02:58:34.110','20250929025833_add_prayer_response_reports',NULL,NULL,'2025-09-29 02:58:34.000',1),('18e9c6ea-ff06-4118-b22f-8a3eef5ee218','58aa68326cf39c581e45ce86c3c006de19f2a3723c35d653ed5c11669a63490c','2025-09-29 03:07:33.026','20250929030732_add_home_prayer_card_reports',NULL,NULL,'2025-09-29 03:07:32.875',1),('27e34b0c-1bab-4d45-ad9f-752ffee8bd3f','36ce80339728798f4e1327f79ff8f1529ebb5cef17defaf47a7cf6a8efa2a04d','2025-09-27 04:22:32.703','20250927042232_banner_active',NULL,NULL,'2025-09-27 04:22:32.681',1),('28e862d6-bc37-42bb-b533-f33b09e4c46e','628c7b8df253adf79ef6af9be4e37d9a7c9b34d08ed9012715d48d812a9e152b','2025-09-23 12:39:01.510','20250923123901_home_prayer_category_required',NULL,NULL,'2025-09-23 12:39:01.409',1),('3b1d3994-3107-49fe-bded-bcd397c522aa','af516a8ba11fa16389c6c31d1492fa6eb7922a715694ba1be39c8983a0abf82d','2025-09-25 18:53:00.848','20250925185300_add_is_blocked_to_user',NULL,NULL,'2025-09-25 18:53:00.832',1),('3d165cc4-3674-449a-aa2e-de2efea61447','86745805f5f2f5cd2f33bf46e68a276163a044b0d9df7b6ec8e715fbe82c88d8','2025-09-27 13:00:30.418','20250927130030_add_role_superadmin',NULL,NULL,'2025-09-27 13:00:30.391',1),('441f121c-be99-4678-b23d-c35de4c92702','f7e0a0989f25ba0fbee7536eccb3ccae7c807cdfb09cd0c658dc495e4f92c95e','2025-09-27 12:15:57.840','20250927121557_add_log_admin',NULL,NULL,'2025-09-27 12:15:57.816',1),('549a0a2f-caf3-4ae2-b65f-15d9e3fa7bf4','6949c9f30becaf8e0014c7ca0e99150eea9e36c218ab400ac6f137a6e03e663a','2025-09-21 13:32:28.558','20250921133228_init',NULL,NULL,'2025-09-21 13:32:28.319',1),('698733bc-179c-40a0-9985-6ce97e247920','0daa0aaeeac6d9f657eefbf5ef4224748a46c01e21eb64a399f6102b1748bcf7','2025-09-25 09:58:49.153','20250925095849_support_dual_requests',NULL,NULL,'2025-09-25 09:58:49.017',1),('6aa901e3-c18a-4ae1-90ba-bc1ca6c7795b','fc8c9e4d34911da77e95d750f30a2ba9a392d878335affea2a3ec6f240cee733','2025-09-26 18:24:56.075','20250926182456_add_block_report_wallet',NULL,NULL,'2025-09-26 18:24:56.016',1),('85b455fa-7670-46a3-b81d-68a0231b354d','c1e7bcde39c4d85110397f941c2fe398e40b40d2c25a76b62c99f0359559dc10','2025-09-22 15:37:29.552','20250922153729_tweak_site_banner_timestamp',NULL,NULL,'2025-09-22 15:37:29.540',1),('93e15af1-2fe2-48c1-b824-e5b662fac3a3','f64057f670a8eb8c14397ee6f18aa753e301a9968499ff8ebecbdeab1e5cf769','2025-09-27 12:36:44.967','20250927123644_add_wallet_ledge',NULL,NULL,'2025-09-27 12:36:44.782',1),('aa7ca858-a536-4b8c-ac10-2f94f36a29c1','11821cd51a7ab30bbe5efee15851cba2804c7856fea77e7b1e9026f7d6545288','2025-09-23 12:38:03.832','20250923123803_add_home_prayer_categories',NULL,NULL,'2025-09-23 12:38:03.746',1),('ad5235d1-93bc-402a-8513-ae0b0fbc3925','b04c8f3bab827ac2dd07bad8b2745f67f8249ed1c64eab0c013d8b1efa228885','2025-10-02 19:51:01.743','20251002195101_not_mandatory_for_voicehref',NULL,NULL,'2025-10-02 19:51:01.672',1),('dd0fffe3-6914-43d4-baa2-a90f59628242','03aed00fb65dc5ca4c5b2dd289cddecae4af1d257d4bec951dbdce4cf33a1df6','2025-09-25 09:25:10.873','20250925092510_add_is_anonymous_to_prayer_response',NULL,NULL,'2025-09-25 09:25:10.834',1),('e04d88fc-0ce7-413f-a369-56495c20f9c2','fa0ef838fa89e34d7f776c5442351cd4bc3237e3c1eb06d616f99cdde6bbc729','2025-09-22 15:35:31.979','20250922153531_add_site_banner',NULL,NULL,'2025-09-22 15:35:31.963',1),('ffd1f59f-3092-4c0c-98b4-13ffb9c3b067','4806dfbf3a4d1eb38218d1937de7ac53a6f1b30dff08ac9b483d21c41c4c483a','2025-09-30 16:19:07.587','20250930161907_add_reset_password',NULL,NULL,'2025-09-30 16:19:07.544',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_log`
--

DROP TABLE IF EXISTS `admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` enum('ACTION','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` enum('INFO','WARNING','ERROR','CRITICAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actorEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestPath` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `admin_log_category_createdAt_idx` (`category`,`createdAt`),
  KEY `admin_log_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_log`
--

LOCK TABLES `admin_log` WRITE;
/*!40000 ALTER TABLE `admin_log` DISABLE KEYS */;
INSERT INTO `admin_log` VALUES (1,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-09-27 13:02:41.040'),(2,'ACTION','INFO','管理員 dan40912 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6cbr0001exz4es49pn2c',NULL,'{\"role\": \"ADMIN\", \"username\": \"dan40912\"}','2025-09-27 13:02:55.813'),(3,'ACTION','INFO','管理員 dan40912 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6cbr0001exz4es49pn2c',NULL,'{\"role\": \"ADMIN\", \"username\": \"dan40912\"}','2025-09-27 13:09:49.003'),(4,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-09-28 09:56:41.401'),(5,'ACTION','INFO','調整用戶 cmfts5nug0000exb8duyewstc 狀態為 Active','user.unblock',NULL,NULL,'User','cmfts5nug0000exb8duyewstc','http://localhost:3000/api/admin/users/cmfts5nug0000exb8duyewstc/block','{\"nextState\": false, \"previousState\": true}','2025-09-28 09:56:48.134'),(6,'ACTION','INFO','更新禱告項目 9 狀態為 Active','prayer.unblock',NULL,NULL,'HomePrayerCard','9','http://localhost:3000/api/admin/prayfor','{\"block\": false}','2025-09-28 09:56:53.107'),(7,'ACTION','INFO','更新禱告項目 8 狀態為 Active','prayer.unblock',NULL,NULL,'HomePrayerCard','8','http://localhost:3000/api/admin/prayfor','{\"block\": false}','2025-09-28 09:56:54.151'),(8,'ACTION','INFO','更新禱告項目 3 狀態為 Active','prayer.unblock',NULL,NULL,'HomePrayerCard','3','http://localhost:3000/api/admin/prayfor','{\"block\": false}','2025-09-28 09:56:55.864'),(9,'ACTION','INFO','更新禱告項目 5 狀態為 Blocked','prayer.block',NULL,NULL,'HomePrayerCard','5','http://localhost:3000/api/admin/prayfor','{\"block\": true}','2025-09-28 09:56:56.486'),(10,'ACTION','INFO','更新禱告項目 6 狀態為 Active','prayer.unblock',NULL,NULL,'HomePrayerCard','6','http://localhost:3000/api/admin/prayfor','{\"block\": false}','2025-09-28 09:56:57.197'),(11,'ACTION','INFO','更新禱告項目 5 狀態為 Active','prayer.unblock',NULL,NULL,'HomePrayerCard','5','http://localhost:3000/api/admin/prayfor','{\"block\": false}','2025-09-28 09:56:57.713'),(12,'ACTION','WARNING','使用者檢舉 jawu','overcomer/report','cmfts5nug0000exb8duyewstc','dan40912@gmail.com','user','cmfzsuhap0000ex4warj8cd41','/api/overcomer/report','{\"reason\": \"sexual_explicit\", \"remarks\": \"TEST\", \"targetUserId\": \"cmfzsuhap0000ex4warj8cd41\", \"targetUsername\": \"jawu\"}','2025-09-28 17:04:21.214'),(13,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-09-29 02:20:24.567'),(14,'ACTION','WARNING','使用者檢舉禱告事項 6','prayfor/report','cmfts5nug0000exb8duyewstc','dan40912@gmail.com','home_prayer_card','6','/api/prayfor/report','{\"reason\": \"other\", \"remarks\": \"\", \"cardTitle\": \"跨文化宣教代禱串流\"}','2025-09-29 03:12:51.399'),(15,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-09-29 16:20:14.786'),(16,'ACTION','INFO','調整用戶 cmg5c50er0000exyouk7nq7hs 狀態為 Blocked','user.block',NULL,NULL,'User','cmg5c50er0000exyouk7nq7hs','https://localhost:3000/api/admin/users/cmg5c50er0000exyouk7nq7hs/block','{\"nextState\": true, \"previousState\": false}','2025-09-29 16:22:32.872'),(17,'ACTION','INFO','調整用戶 cmg5c50er0000exyouk7nq7hs 狀態為 Active','user.unblock',NULL,NULL,'User','cmg5c50er0000exyouk7nq7hs','https://localhost:3000/api/admin/users/cmg5c50er0000exyouk7nq7hs/block','{\"nextState\": false, \"previousState\": true}','2025-09-29 16:22:39.560'),(18,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-09-30 18:36:06.003'),(19,'ACTION','WARNING','使用者檢舉禱告回應 cmg5cmqrd0005exyoda7lxveh','prayer-response/report','cmfts5nug0000exb8duyewstc','dan40912@gmail.com','prayer_response','cmg5cmqrd0005exyoda7lxveh','/api/prayer-response/report','{\"reason\": \"other\", \"remarks\": \"\", \"homeCardId\": 11, \"autoBlocked\": false}','2025-09-30 18:45:17.641'),(20,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-09-30 18:45:50.470'),(21,'ACTION','INFO','更新禱告項目 12 狀態為 Blocked','prayer.block',NULL,NULL,'HomePrayerCard','12','http://localhost:3000/api/admin/prayfor','{\"block\": true}','2025-09-30 18:45:57.473'),(22,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-02 11:40:24.725'),(23,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-02 13:06:57.120'),(24,'ACTION','INFO','調整用戶 cmg5cf53m0001exyo04b63lvn 狀態為 Blocked','user.block',NULL,NULL,'User','cmg5cf53m0001exyo04b63lvn','http://localhost:3000/api/admin/users/cmg5cf53m0001exyo04b63lvn/block','{\"nextState\": true, \"previousState\": false}','2025-10-02 16:22:34.032'),(25,'ACTION','INFO','調整用戶 cmg5c50er0000exyouk7nq7hs 狀態為 Blocked','user.block',NULL,NULL,'User','cmg5c50er0000exyouk7nq7hs','http://localhost:3000/api/admin/users/cmg5c50er0000exyouk7nq7hs/block','{\"nextState\": true, \"previousState\": false}','2025-10-02 16:22:34.714'),(26,'ACTION','INFO','調整用戶 cmg7k43ds0000exu4nm4x6pk1 狀態為 Blocked','user.block',NULL,NULL,'User','cmg7k43ds0000exu4nm4x6pk1','http://localhost:3000/api/admin/users/cmg7k43ds0000exu4nm4x6pk1/block','{\"nextState\": true, \"previousState\": false}','2025-10-02 16:22:41.318'),(27,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-02 18:02:01.362'),(28,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-03 06:20:10.853'),(29,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-08 16:07:30.825'),(30,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-09 11:53:23.454'),(31,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-10 06:17:30.840'),(32,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-10 06:43:33.284'),(33,'ACTION','INFO','Enabled maintenance mode','maintenance.enable',NULL,NULL,NULL,NULL,'http://localhost:3000/api/admin/site-settings','{\"role\": \"SUPER\", \"maintenanceMode\": true}','2025-10-10 06:43:41.112'),(34,'ACTION','INFO','Disabled maintenance mode','maintenance.disable',NULL,NULL,NULL,NULL,'http://localhost:3000/api/admin/site-settings','{\"role\": \"SUPER\", \"maintenanceMode\": false}','2025-10-10 06:43:59.899'),(35,'ACTION','INFO','Enabled maintenance mode','maintenance.enable',NULL,NULL,NULL,NULL,'http://localhost:3000/api/admin/site-settings','{\"role\": \"SUPER\", \"maintenanceMode\": true}','2025-10-10 06:45:36.556'),(36,'ACTION','INFO','Disabled maintenance mode','maintenance.disable',NULL,NULL,NULL,NULL,'http://localhost:3000/api/admin/site-settings','{\"role\": \"SUPER\", \"maintenanceMode\": false}','2025-10-10 06:48:15.959'),(37,'ACTION','INFO','Enabled maintenance mode','maintenance.enable',NULL,NULL,NULL,NULL,'http://localhost:3000/api/admin/site-settings','{\"role\": \"SUPER\", \"maintenanceMode\": true}','2025-10-10 06:48:20.146'),(38,'ACTION','INFO','Disabled maintenance mode','maintenance.disable',NULL,NULL,NULL,NULL,'http://localhost:3000/api/admin/site-settings','{\"role\": \"SUPER\", \"maintenanceMode\": false}','2025-10-10 07:11:57.096'),(39,'ACTION','INFO','管理員 admin 登入後台','admin.login',NULL,NULL,'AdminAccount','cmg2a6c9y0000exz4erghjp0p',NULL,'{\"role\": \"SUPER\", \"username\": \"admin\"}','2025-10-10 08:45:35.298');
/*!40000 ALTER TABLE `admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adminaccount`
--

DROP TABLE IF EXISTS `adminaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminaccount` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ADMIN',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AdminAccount_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminaccount`
--

LOCK TABLES `adminaccount` WRITE;
/*!40000 ALTER TABLE `adminaccount` DISABLE KEYS */;
INSERT INTO `adminaccount` VALUES ('cmg2a6c9y0000exz4erghjp0p','admin','$2b$10$skNAXeMWFP8QWuRvhWTXiOZz5ztoT7VLu.B3s1ZpJtVzZQvRdQSRO','SUPER',1,'2025-10-10 08:45:35.285','2025-09-27 13:02:31.846','2025-10-10 08:45:35.286'),('cmg2a6cbr0001exz4es49pn2c','dan40912','$2b$10$Ah2ut/NURtzYf0ZEyysIwO4VowKivZ57KNRusoe250.kOOsCkPUb2','ADMIN',1,'2025-09-27 13:09:48.996','2025-09-27 13:02:31.911','2025-09-27 13:09:48.997');
/*!40000 ALTER TABLE `adminaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_prayer_card`
--

DROP TABLE IF EXISTS `home_prayer_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_prayer_card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` json NOT NULL,
  `meta` json NOT NULL,
  `detailsHref` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voiceHref` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `categoryId` int NOT NULL,
  `isBlocked` tinyint(1) NOT NULL DEFAULT '0',
  `reportCount` int NOT NULL DEFAULT '0',
  `ownerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isSettled` tinyint(1) NOT NULL DEFAULT '0',
  `settledAmount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `home_prayer_card_slug_key` (`slug`),
  KEY `home_prayer_card_categoryId_idx` (`categoryId`),
  KEY `home_prayer_card_ownerId_fkey` (`ownerId`),
  CONSTRAINT `home_prayer_card_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `home_prayer_category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `home_prayer_card_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_prayer_card`
--

LOCK TABLES `home_prayer_card` WRITE;
/*!40000 ALTER TABLE `home_prayer_card` DISABLE KEYS */;
INSERT INTO `home_prayer_card` VALUES (1,'pc-101','https://images.unsplash.com/photo-1544776193-352d25ca81a9?auto=format&fit=crop&w=900&q=80','偏鄉孩子在教室祈禱','花東偏鄉課後共學與禱告陪伴','在花東山區建立固定祈禱時段，連結教師與代禱夥伴，陪伴 40 位學童的課後學習與心靈需要。','[\"教育\", \"偏鄉\"]','[\"祈禱 ID：PC-101\", \"已回覆 12 次 · 跟進 3 名同工\"]','','/legacy/prayfor/details.html?prayer=pc-101#voice',1,'2025-09-23 00:03:14.738','2025-09-30 12:45:04.009',1,1,1,'cmfts5nug0000exb8duyewstc',0,NULL),(2,'pc-214','https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80','投資失利不想活了','投資失利不想活了','投資失利不想活了','[\"醫療\", \"救援\"]','[\"祈禱 ID：PC-214\", \"已回覆 27 次 · 跟進 8 名志工\"]','','/legacy/prayfor/details.html?prayer=pc-214#voice',2,'2025-09-23 00:03:14.738','2025-09-27 14:48:44.644',1,0,0,'cmfzsuhap0000ex4warj8cd41',0,NULL),(4,'pc-418','https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80','海上救援志工互相扶持','海上救援志工守望圈','為沿海救援志工建立禱告網，提供心理諮商連結與家屬支持補給，共同守護第一線人員。','[\"社福\", \"救援\"]','[\"祈禱 ID：PC-418\", \"已回覆 15 次 · 跟進 5 名牧者\"]','','/legacy/prayfor/details.html?prayer=pc-418#voice',4,'2025-09-23 00:03:14.738','2025-09-27 14:48:44.644',1,0,0,'cmfzsuhap0000ex4warj8cd41',0,NULL),(5,'pc-509','https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80','社區互助廚房','社區互助廚房祈禱守望','由社區教會與 NGO 共同營運的共享廚房，透過禱告名單與即時需求板提供每日守望。','[\"社區\", \"關懷\"]','[\"祈禱 ID：PC-509\", \"已回覆 6 次 · 跟進 1 位社工\"]','','/legacy/prayfor/details.html?prayer=pc-509#voice',5,'2025-09-23 00:03:14.738','2025-09-28 09:56:57.708',1,0,0,'cmfts5nug0000exb8duyewstc',0,NULL),(6,'pc-623','https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=900&q=80','宣教團隊聚集禱告','跨文化宣教代禱串流','針對跨文化宣教士建立 24/7 禱告接力，並媒合語言翻譯與文化顧問，支援前線需要。','[\"宣教\", \"跨文化\"]','[\"祈禱 ID：PC-623\", \"已回覆 21 次 · 跟進 4 名宣教士\"]','','/legacy/prayfor/details.html?prayer=pc-623#voice',6,'2025-09-23 00:03:14.738','2025-09-29 03:12:51.396',1,0,1,'cmfzsuhap0000ex4warj8cd41',0,NULL),(7,'股市失利代禱','https://tse1.mm.bing.net/th/id/OIP.65O8U0TOb74WjI5x-6C0xQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3','股票失利虧錢','為股市失利的人禱告','我覺得壓力超級大，請幫我代禱','[\"個人\"]','[]','','/legacy/prayfor/details.html?prayer=股市失利代禱#voice',7,'2025-09-23 20:21:34.124','2025-09-27 14:48:44.644',1,0,0,'cmfts5nug0000exb8duyewstc',0,NULL),(8,'card-1758632378461','https://attach.setn.com/newsimages/2020/05/26/2575643-PH.jpg','為久不聚會的聖徒禱告','為久不聚會的聖徒禱告','為久不聚會的聖徒禱告','[]','[]','','/legacy/prayfor/details.html?prayer=card-1758632378461#voice',8,'2025-09-23 20:59:38.463','2025-09-28 09:56:54.144',1,0,0,'cmfzsuhap0000ex4warj8cd41',0,NULL),(9,'為了主在全世界福音的廣傳','https://tse4.mm.bing.net/th/id/OIP.jzA1lHcSsHTrjrWL3pgS3QHaE2?rs=1&pid=ImgDetMain&o=7&rm=3','為了主在全世界福音的廣傳','為了主在全世界福音的廣傳','為了主在全世界福音的廣傳','[]','[]','','/legacy/prayfor/details.html?prayer=card-1758654742279#voice',9,'2025-09-24 03:12:22.285','2025-09-28 09:56:53.100',5,0,0,'cmfts5nug0000exb8duyewstc',0,NULL),(11,'3affa8db-1c19-429a-8401-367d10edcd06','https://img.ltn.com.tw/Upload/news/600/2025/09/29/5194319_1_1.jpg','光復','為花蓮鏟子超人','花蓮光復的堰塞湖災難，十五人死亡，無數的人流離失所。\n\n為願意前去幫忙的鏟子超人們，祝福你們有滿滿的力量。還有主做你們的平安。','[]','[]','','',0,'2025-09-29 03:43:01.126','2025-09-29 03:43:01.126',2,0,0,NULL,0,NULL),(12,'4e4f7cb3-d4d4-446e-a333-9c243dbdebea','https://unsplash.com/photos/grayscale-photo-of-concrete-houses-LheHIV3XpGM','瓦礫中吃不飽的孩童','為加薩流離失所的人民祈求庇護','祈禱戰火趕快停止，居民可以有安全的住所， 不虞匱乏的食物飲水及醫療資源','[\"和平\"]','[]','','',0,'2025-09-29 05:25:29.474','2025-09-30 18:45:57.466',1,1,0,NULL,0,NULL),(13,'08aff1db-b04b-44f7-b403-2c26d548e535','/uploads/1759432996844-pray.png','弟兄生病禱告','弟兄癌症手術禱告','弟兄癌症手術禱告','[]','[]','','',0,'2025-10-02 19:23:17.097','2025-10-02 19:23:17.097',1,0,0,NULL,0,NULL),(14,'e1bc7a4a-7c12-47a6-ad8a-1e273ee3f1ae','/uploads/1759433377314-dashboard.png','後台搭建','後台搭建','後台搭建','[]','[]','','',0,'2025-10-02 19:29:37.542','2025-10-02 19:29:37.542',2,0,0,NULL,0,NULL),(15,'e783f494-f926-4966-8188-e80c8c2864b6','/uploads/1759433597404-voice.png','前台搭建','前台搭建','前台搭建','[]','[]','','',0,'2025-10-02 19:33:17.651','2025-10-02 19:33:17.651',5,0,0,NULL,0,NULL),(16,'cde89cd5-6c13-4ea0-aa0b-cd1fd892576c','/uploads/1759435132704-world.jpg','世界動亂局勢不明','世界動亂局勢不明','世界動亂局勢不明','[]','[]','','',0,'2025-10-02 19:58:52.819','2025-10-02 19:58:52.819',1,0,0,'cmfts5nug0000exb8duyewstc',0,NULL),(17,'cdc9b22f-3852-4239-a1e3-cab312e5abdc','/uploads/1759844499660-36166f20-yankees-charlie-kirk.jpg.webp','','為Kirk的家人','<h4>202509 Kirk 遭到槍擊，為了他一生所傳揚的耶穌基督，看見弟兄為了福音竭力奮鬥，受到鼓勵。也希望不要停止於此，我們更能夠繼續將福音傳揚出去&nbsp;</h4>','[]','[]','','',0,'2025-10-07 13:44:39.044','2025-10-07 13:44:39.044',1,0,0,'cmgezetmu0000exk0zp6kq7es',0,NULL),(18,'b0669230-3f11-403d-979a-201a85a8c15d','/uploads/1760034876930-a2cce8e5-132953896_3852574794774871_781249226354902744_n.jpg.webp','','Threads網友提問串','<h4>請大家一起維護一個好平台，讓禱告不斷，水流一直在</h4>','[]','[]','','',0,'2025-10-09 18:35:20.447','2025-10-09 18:35:20.447',1,0,0,'cmgezetmu0000exk0zp6kq7es',0,NULL);
/*!40000 ALTER TABLE `home_prayer_card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_prayer_card_report`
--

DROP TABLE IF EXISTS `home_prayer_card_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_prayer_card_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cardId` int NOT NULL,
  `reporterId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `home_prayer_card_report_cardId_reporterId_key` (`cardId`,`reporterId`),
  KEY `home_prayer_card_report_cardId_idx` (`cardId`),
  KEY `home_prayer_card_report_reason_idx` (`reason`),
  KEY `home_prayer_card_report_createdAt_idx` (`createdAt`),
  KEY `home_prayer_card_report_reporterId_fkey` (`reporterId`),
  CONSTRAINT `home_prayer_card_report_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `home_prayer_card` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `home_prayer_card_report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_prayer_card_report`
--

LOCK TABLES `home_prayer_card_report` WRITE;
/*!40000 ALTER TABLE `home_prayer_card_report` DISABLE KEYS */;
INSERT INTO `home_prayer_card_report` VALUES (1,6,'cmfts5nug0000exb8duyewstc','other',NULL,'2025-09-29 03:12:51.394');
/*!40000 ALTER TABLE `home_prayer_card_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_prayer_category`
--

DROP TABLE IF EXISTS `home_prayer_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_prayer_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `home_prayer_category_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_prayer_category`
--

LOCK TABLES `home_prayer_category` WRITE;
/*!40000 ALTER TABLE `home_prayer_category` DISABLE KEYS */;
INSERT INTO `home_prayer_category` VALUES (1,'個人','personal','個人生命、信仰與家庭的禱告事項',1,1,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(2,'世界','world','為全球局勢、環境與國際事件代禱',2,1,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(3,'事業','work','職場、事業發展與財務需要',3,0,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(4,'健康','health','身心靈健康與醫療需求',4,1,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(5,'福音','gospel','宣教、福音禾場與門徒培育',5,1,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(6,'政治局勢','politics','國家與政府領袖的決策、社會公義',6,1,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(7,'感情','relationships','婚姻、家庭與人際關係',7,0,'2025-09-23 20:38:32.388','2025-09-23 20:38:32.388'),(8,'教會','church','為教會與信仰群體的需要禱告',8,1,'2025-10-02 20:15:46.422','2025-10-02 20:15:46.422'),(9,'和平','peace','和平、公義與衝突化解',9,1,'2025-10-02 20:15:46.422','2025-10-02 20:15:46.422'),(10,'祝福','blessing','為人群、社會與未來祝福',10,1,'2025-10-02 20:15:46.422','2025-10-02 20:15:46.422');
/*!40000 ALTER TABLE `home_prayer_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prayer_response_report`
--

DROP TABLE IF EXISTS `prayer_response_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prayer_response_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `responseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporterId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `prayer_response_report_responseId_reporterId_key` (`responseId`,`reporterId`),
  KEY `prayer_response_report_responseId_idx` (`responseId`),
  KEY `prayer_response_report_reason_idx` (`reason`),
  KEY `prayer_response_report_createdAt_idx` (`createdAt`),
  KEY `prayer_response_report_reporterId_fkey` (`reporterId`),
  CONSTRAINT `prayer_response_report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `prayer_response_report_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `prayerresponse` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prayer_response_report`
--

LOCK TABLES `prayer_response_report` WRITE;
/*!40000 ALTER TABLE `prayer_response_report` DISABLE KEYS */;
INSERT INTO `prayer_response_report` VALUES (1,'cmg5cmqrd0005exyoda7lxveh','cmfts5nug0000exb8duyewstc','other',NULL,'2025-09-30 18:45:17.634');
/*!40000 ALTER TABLE `prayer_response_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prayerrequest`
--

DROP TABLE IF EXISTS `prayerrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prayerrequest` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','PUBLISHED','ANSWERED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `ownerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PrayerRequest_slug_key` (`slug`),
  KEY `PrayerRequest_ownerId_fkey` (`ownerId`),
  CONSTRAINT `PrayerRequest_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prayerrequest`
--

LOCK TABLES `prayerrequest` WRITE;
/*!40000 ALTER TABLE `prayerrequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `prayerrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prayerresponse`
--

DROP TABLE IF EXISTS `prayerresponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prayerresponse` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voiceUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokensAwarded` decimal(10,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `responderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isAnonymous` tinyint(1) NOT NULL DEFAULT '0',
  `homeCardId` int DEFAULT NULL,
  `prayerRequestId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isBlocked` tinyint(1) NOT NULL DEFAULT '0',
  `reportCount` int NOT NULL DEFAULT '0',
  `isSettled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `PrayerResponse_responderId_fkey` (`responderId`),
  KEY `PrayerResponse_prayerRequestId_fkey` (`prayerRequestId`),
  KEY `PrayerResponse_homeCardId_fkey` (`homeCardId`),
  CONSTRAINT `PrayerResponse_homeCardId_fkey` FOREIGN KEY (`homeCardId`) REFERENCES `home_prayer_card` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PrayerResponse_prayerRequestId_fkey` FOREIGN KEY (`prayerRequestId`) REFERENCES `prayerrequest` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PrayerResponse_responderId_fkey` FOREIGN KEY (`responderId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prayerresponse`
--

LOCK TABLES `prayerresponse` WRITE;
/*!40000 ALTER TABLE `prayerresponse` DISABLE KEYS */;
INSERT INTO `prayerresponse` VALUES ('cmfz8t7i20005ex6ojxju1xna','SSS','blob:http://localhost:3000/c0125d25-7630-48f1-a343-12ba3a4b7fd5',0.00,'2025-09-25 10:01:00.986',NULL,1,9,NULL,0,0,0),('cmfz8znjg0007ex6oqplu4y9s','憶起加油','/voices/1758794761705-recording.mp3',0.00,'2025-09-25 10:06:01.708',NULL,1,9,NULL,0,0,0),('cmfz9g1t70009ex6o3g5vlwpi','福音船片居仁之地','/voices/1758795526695-recording.mp3',0.00,'2025-09-25 10:18:46.699',NULL,1,9,NULL,0,0,0),('cmfz9k9jk000bex6oxx9ndzrr','很棒喔!',NULL,0.00,'2025-09-25 10:22:03.344','cmfts5nug0000exb8duyewstc',0,9,NULL,0,0,0),('cmg1or5nq0001extgvf55am8i','','/voices/1758942171490-recording.mp3',0.00,'2025-09-27 03:02:51.494','cmfzsuhap0000ex4warj8cd41',0,9,NULL,0,0,0),('cmg3g3dlm0001exwgoow0iy4f','TEST','/voices/1759048557460-prayer-recording.webm',0.00,'2025-09-28 08:35:57.464','cmfzsuhap0000ex4warj8cd41',0,9,NULL,0,0,0),('cmg3gd1d30003exwg9wh1im16','GGG','/voices/1759049008164-prayer-recording.webm',0.00,'2025-09-28 08:43:28.167','cmfzsuhap0000ex4warj8cd41',0,9,NULL,0,0,0),('cmg3ixah60001ex8skcvrtgpk','can u heaR ME ?','/voices/1759053312327-prayer-recording.webm',0.00,'2025-09-28 09:55:12.330','cmfzsuhap0000ex4warj8cd41',0,9,NULL,0,0,0),('cmg3kkeiz0003ex8s2qaf50e0','test1','/voices/1759056070279-prayer-recording.webm',0.00,'2025-09-28 10:41:10.283','cmfzsuhap0000ex4warj8cd41',0,9,NULL,0,0,0),('cmg3kzl8c0005ex8stceswupc','','/voices/1759056778810-prayer-recording.webm',0.00,'2025-09-28 10:52:58.812','cmfzsuhap0000ex4warj8cd41',0,9,NULL,0,0,0),('cmg3l14520007ex8srq27igf3','hello','/voices/1759056849972-prayer-recording.webm',0.00,'2025-09-28 10:54:09.974','cmfzsuhap0000ex4warj8cd41',0,8,NULL,0,0,0),('cmg3l25il0009ex8st1zejv39','','/voices/1759056898411-prayer-recording.webm',0.00,'2025-09-28 10:54:58.413',NULL,1,8,NULL,0,0,0),('cmg3m3inh0001exlgp50xjrx9','JW','/voices/1759058641707-prayer-recording.m4a',0.00,'2025-09-28 11:24:01.709','cmfzsuhap0000ex4warj8cd41',0,8,NULL,0,0,0),('cmg3n8hjo0003exlg1azl2c3y','TEST','/voices/1759060553167-prayer-recording.m4a',0.00,'2025-09-28 11:55:53.170','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3nt00t0001exusbqdh88a7','T','/voices/1759061510233-prayer-recording.webm',0.00,'2025-09-28 12:11:50.237','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3pebda0001ex0gmkx15dri','TEST','/voices/1759064184331-prayer-recording.webm',0.00,'2025-09-28 12:56:24.334','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3plx1i0003ex0gtfdj7qyk','YRDY','/voices/1759064539011-prayer-recording.webm',0.00,'2025-09-28 13:02:19.014','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3pskyq0005ex0gcalpeo3y','ttt','/voices/1759064849951-prayer-recording.webm',0.00,'2025-09-28 13:07:29.954','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3px7tz0007ex0g6pd9ckhk','ggg','/voices/1759065066212-prayer-recording.webm',0.00,'2025-09-28 13:11:06.215','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3pxrhb0009ex0gojbo8nxb','0928','/voices/1759065091676-prayer-recording.webm',0.00,'2025-09-28 13:11:31.679','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3pyxoq000bex0gbltrqjpx','01','/voices/1759065146376-prayer-recording.webm',0.00,'2025-09-28 13:12:26.378','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3q40ov000hex0gkw5z1uh5','02','/voices/1759065383547-prayer-recording.webm',0.00,'2025-09-28 13:16:23.549','cmfzsuhap0000ex4warj8cd41',0,7,NULL,0,0,0),('cmg3qo18q000jex0gidtfpn3s','01','/voices/1759066317383-prayer-recording.webm',0.00,'2025-09-28 13:31:57.386','cmfzsuhap0000ex4warj8cd41',0,4,NULL,0,0,0),('cmg3qoej4000lex0g227hskkt','02','/voices/1759066334606-prayer-recording.webm',0.00,'2025-09-28 13:32:14.608','cmfzsuhap0000ex4warj8cd41',0,4,NULL,0,0,0),('cmg3qoqdt000nex0g02pnsula','03','/voices/1759066349967-prayer-recording.webm',0.00,'2025-09-28 13:32:29.969','cmfzsuhap0000ex4warj8cd41',0,4,NULL,0,0,0),('cmg4jvnzo0001exu4bp6wr22t','TEST','/voices/1759115382318-prayer-recording.webm',0.00,'2025-09-29 03:09:42.323','cmfts5nug0000exb8duyewstc',0,9,NULL,0,0,0),('cmg4l5k0b0001expgys13us46','大家加油!','/voices/1759117523336-prayer-recording.webm',0.00,'2025-09-29 03:45:23.339','cmfts5nug0000exb8duyewstc',0,11,NULL,0,0,0),('cmg4l8r4r0003expgrlrp5ydi','鏟子超人出發!','/voices/1759117672535-prayer-recording.webm',0.00,'2025-09-29 03:47:52.539','cmfzsuhap0000ex4warj8cd41',0,11,NULL,0,0,0),('cmg5chh720003exyoqtjdiv05','新捷，你是我的超人',NULL,0.00,'2025-09-29 16:30:29.198','cmg5cf53m0001exyo04b63lvn',0,11,NULL,1,0,0),('cmg5cmqrd0005exyoda7lxveh','Jay Wu is awesome!','/voices/1759163674867-prayer-recording.webm',0.00,'2025-09-29 16:34:34.870',NULL,1,11,NULL,1,1,0),('cmg9fqkcr0001exkovn1zgzju','注意身體驗康喔! 小心受傷了要去看醫生。返家過程要注意安全','/voices/1759410756741-prayer-recording.webm',0.00,'2025-10-02 13:12:36.745','cmfts5nug0000exb8duyewstc',0,11,NULL,0,0,0),('cmg9rwolc0001ex3ggl3t6kox','HY','/voices/1759431197563-prayer-recording.webm',0.00,'2025-10-02 18:53:17.566','cmfts5nug0000exb8duyewstc',0,9,NULL,0,0,0),('cmgaq85e00001exy4hbzxbjjb','弟兄，主祝福你，在手術後的恢復，主與你同在',NULL,0.00,'2025-10-03 10:53:59.494','cmfts5nug0000exb8duyewstc',0,13,NULL,0,0,0),('cmgaqa99p0003exy4yh7jl397','『耶和華是我的牧者；我必不至缺乏。』詩二三1\r\n『祂使我躺臥在青草地上，領我在可安歇的水邊。』詩二三2\r\n『祂使我的魂甦醒，為自己的名引導我走義路。』詩二三3\r\n『我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。』詩二三4','/voices/1759488937834-prayer-recording.webm',0.00,'2025-10-03 10:55:37.837','cmfts5nug0000exb8duyewstc',0,13,NULL,0,0,0),('cmgfdhjlu0001exzoz4ebgw9w','禱告超人! 出發',NULL,0.00,'2025-10-06 16:56:13.696','cmgezetmu0000exk0zp6kq7es',0,11,NULL,0,0,0),('cmghxiao00001exe4ojduyxv7','求主護衛你的心懷意念，有主做平安。','/voices/1759924333433-prayer-recording.webm',0.00,'2025-10-08 11:52:13.437',NULL,1,13,NULL,0,0,0),('cmgjrdp0v0001expwfj0qvxui','TEST','/voices/18/1760034973417-prayer-recording.webm',0.00,'2025-10-09 18:36:13.421','cmgezetmu0000exk0zp6kq7es',0,18,NULL,0,0,0);
/*!40000 ALTER TABLE `prayerresponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_banner`
--

DROP TABLE IF EXISTS `site_banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_banner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eyebrow` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `headline` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subheadline` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `primaryCtaLabel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `primaryCtaHref` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secondaryCtaLabel` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondaryCtaHref` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `heroImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_banner`
--

LOCK TABLES `site_banner` WRITE;
/*!40000 ALTER TABLE `site_banner` DISABLE KEYS */;
INSERT INTO `site_banner` VALUES (1,'','跟我們一起跨越時間的禱告吧','錄音，撥放，讓我們串聯在一起','同靈，同魂，同心思。','立即註冊','/signup','了解使用方式','/howto','https://tse2.mm.bing.net/th/id/OIP.EDqZ7TY-OCvhgu-HZ6CG3gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3','2025-10-02 18:03:38.581','2025-09-27 12:22:32.682',1);
/*!40000 ALTER TABLE `site_banner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_setting`
--

DROP TABLE IF EXISTS `site_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_setting` (
  `id` int NOT NULL DEFAULT '1',
  `maintenanceMode` tinyint(1) NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  `updatedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_setting`
--

LOCK TABLES `site_setting` WRITE;
/*!40000 ALTER TABLE `site_setting` DISABLE KEYS */;
INSERT INTO `site_setting` VALUES (1,0,'2025-10-10 07:11:57.085','SUPER');
/*!40000 ALTER TABLE `site_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_transaction`
--

DROP TABLE IF EXISTS `token_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_transaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('EARN_PRAYER','EARN_RESPONSE','WITHDRAW','DONATE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PROCESSING_CHAIN','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `amount` decimal(10,2) NOT NULL,
  `relatedHomeCardId` int DEFAULT NULL,
  `relatedResponseId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `txHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gasFee` decimal(10,8) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `token_transaction_userId_createdAt_idx` (`userId`,`createdAt`),
  KEY `token_transaction_type_status_idx` (`type`,`status`),
  KEY `token_transaction_relatedHomeCardId_fkey` (`relatedHomeCardId`),
  KEY `token_transaction_relatedResponseId_fkey` (`relatedResponseId`),
  CONSTRAINT `token_transaction_relatedHomeCardId_fkey` FOREIGN KEY (`relatedHomeCardId`) REFERENCES `home_prayer_card` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `token_transaction_relatedResponseId_fkey` FOREIGN KEY (`relatedResponseId`) REFERENCES `prayerresponse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `token_transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_transaction`
--

LOCK TABLES `token_transaction` WRITE;
/*!40000 ALTER TABLE `token_transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `token_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `faithTradition` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `solanaAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acceptedTerms` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `avatarUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isBlocked` tinyint(1) NOT NULL DEFAULT '0',
  `reportCount` int NOT NULL DEFAULT '0',
  `walletBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `bscAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isAddressVerified` tinyint(1) NOT NULL DEFAULT '0',
  `resetToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetTokenExpiry` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('cmfts5nug0000exb8duyewstc','dan40912@gmail.com','吳新捷','dan40912','基督教','台灣','1231231231313123123','$2b$12$ItwdaCJwH48FId0V.5odJOklkamfXv6yl.7L.92MYePxMg3jk..7K',1,'2025-09-21 14:15:57.688','2025-10-01 14:45:59.364','https://dan40912.github.io/assets/img/%E5%A4%A7%E9%A0%AD%E8%B2%BC.jpg','基督徒也是一個開發者，產品經理，前端工程師。',0,0,0.00,NULL,0,NULL,NULL),('cmfzsuhap0000ex4warj8cd41','jay.wu@zerologix.com','HSIN CHIEH WU','jawu','基督教','台灣','No. 146, Wuquan W. 5th St., West Dist.403','$2b$12$2PdzhGH7DS.xKaTncVW9.egPn3YiXJ26EZ7akAS.omvUsFCP/QyMq',1,'2025-09-25 19:21:52.658','2025-09-29 03:46:54.917','https://s.yimg.com/ny/api/res/1.2/iOmE40BHnPl7PO1aejGtWQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTgxNg--/https://media.zenfs.com/zh-tw/ftnn_com_tw_939/d668f8953c2e32c04ee1471f3725202d','鏟子超人',0,1,0.00,NULL,0,NULL,NULL),('cmg4o8mmg0004expgjrggaklx','intellienv@gmail.com','Hen-I Yang','hiyang','其他（請於禱告內容補充）','台灣','6hF4ql','$2b$12$WTZ9LU.Vpz/Z.Wy4VbdtEuezHhdbhARW4OMppXHnA5xiNkwo75PJK',1,'2025-09-29 05:11:45.544','2025-09-29 05:11:45.544',NULL,NULL,0,0,0.00,NULL,0,NULL,NULL),('cmg5c50er0000exyouk7nq7hs','chensuper0202@gmail.com','蘇柏丞','superchen','其他（請於禱告內容補充）','台灣','23245232','$2b$12$MRa.nEXrLJtZuQ5rZDO63.ihFk/cKQEEobCYc2SsdKHing.85lKeS',1,'2025-09-29 16:20:47.571','2025-10-02 16:22:34.708',NULL,NULL,1,0,0.00,NULL,0,NULL,NULL),('cmg5cf53m0001exyo04b63lvn','chensuper0204@mail.com','蘇柏丞','danielsu','其他（請於禱告內容補充）','台灣','23245232','$2b$12$x.1oUKBMVErKtQY.HaDq/.Ip0SvAsvrL6VyjEZt/XjQ1ZbeKmIkma',1,'2025-09-29 16:28:40.211','2025-10-02 16:22:34.024',NULL,NULL,1,0,0.00,NULL,0,NULL,NULL),('cmg6wechq0000exgctl9hvpos','123@test.com','encouger','encougers',NULL,'台灣',NULL,'$2b$12$B6uBeLJRidUxNRUmeUwhwOie8UdvvNppNs9Zvbxakxg8HA5G4gvne',1,'2025-09-30 18:35:41.630','2025-09-30 18:35:41.630',NULL,NULL,0,0,0.00,NULL,0,NULL,NULL),('cmg7k43ds0000exu4nm4x6pk1','jaywu@testnet.com','JAXWU','jaywucom',NULL,'台灣',NULL,'$2b$12$YQjmGeBafqHt4VTvlzttq.lSnioNPcPVIUel9I1gj/PhB7qeStSZm',1,'2025-10-01 05:39:34.048','2025-10-02 16:22:41.314',NULL,NULL,1,0,0.00,NULL,0,NULL,NULL),('cmgezetmu0000exk0zp6kq7es','treeoflifeabc@gmail.com','禱告超人','pray-superman',NULL,'台灣',NULL,'$2b$12$I0uTPO.nrgx4aDJJs55m2.iFu.q0Q0azWzKBGxoux5VXjj2Fq4in2',1,'2025-10-06 10:22:12.102','2025-10-10 07:26:10.109','/uploads/1759769699501-9c6ea1b0-politics.jpg.webp','永遠做一個溫暖的人，替你們警醒禱告',0,0,0.00,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10 17:12:05
