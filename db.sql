-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: b9keq8dku891z0lpth11-mysql.services.clever-cloud.com    Database: b9keq8dku891z0lpth11
-- ------------------------------------------------------
-- Server version	8.0.22-13

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'a05a675a-1414-11e9-9c82-cecd01b08c7e:1-491550428,
a38a16d0-767a-11eb-abe2-cecd029e558e:1-607286612';

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `student_id` int NOT NULL,
  `is_absent` tinyint(1) DEFAULT '0',
  `reason` text COLLATE utf8mb4_general_ci,
  `proof_image_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`),
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=207 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (83,2,1,1,'',NULL,'2026-01-02 11:10:13'),(84,2,2,0,'',NULL,'2026-01-02 11:10:13'),(85,2,3,0,'',NULL,'2026-01-02 11:10:13'),(86,2,4,0,'',NULL,'2026-01-02 11:10:14'),(87,2,5,0,'',NULL,'2026-01-02 11:10:14'),(88,2,6,0,'',NULL,'2026-01-02 11:10:14'),(89,2,7,0,'',NULL,'2026-01-02 11:10:15'),(90,2,8,0,'',NULL,'2026-01-02 11:10:15'),(91,2,9,0,'',NULL,'2026-01-02 11:10:15'),(92,2,10,0,'',NULL,'2026-01-02 11:10:15'),(93,2,11,0,'',NULL,'2026-01-02 11:10:16'),(94,2,12,0,'',NULL,'2026-01-02 11:10:16'),(95,2,13,0,'',NULL,'2026-01-02 11:10:16'),(96,2,14,0,'',NULL,'2026-01-02 11:10:17'),(97,2,15,0,'',NULL,'2026-01-02 11:10:17'),(98,2,16,0,'',NULL,'2026-01-02 11:10:17'),(99,2,17,0,'',NULL,'2026-01-02 11:10:18'),(100,2,18,0,'',NULL,'2026-01-02 11:10:18'),(101,2,19,0,'',NULL,'2026-01-02 11:10:18'),(102,2,21,0,'',NULL,'2026-01-02 11:10:18'),(103,2,22,0,'',NULL,'2026-01-02 11:10:19'),(105,2,23,0,'',NULL,'2026-01-02 11:10:19'),(106,2,24,0,'',NULL,'2026-01-02 11:10:19'),(107,2,25,0,'',NULL,'2026-01-02 11:10:20'),(108,2,26,0,'',NULL,'2026-01-02 11:10:20'),(109,2,27,0,'',NULL,'2026-01-02 11:10:20'),(110,2,28,0,'',NULL,'2026-01-02 11:10:21'),(111,2,29,0,'',NULL,'2026-01-02 11:10:21'),(112,2,30,0,'',NULL,'2026-01-02 11:10:21'),(113,2,31,0,'',NULL,'2026-01-02 11:10:21'),(114,2,32,0,'',NULL,'2026-01-02 11:10:22'),(115,2,33,0,'',NULL,'2026-01-02 11:10:22'),(116,2,34,0,'',NULL,'2026-01-02 11:10:22'),(117,2,35,0,'',NULL,'2026-01-02 11:10:23'),(118,2,36,0,'',NULL,'2026-01-02 11:10:23'),(119,2,37,0,'',NULL,'2026-01-02 11:10:23'),(120,2,38,0,'',NULL,'2026-01-02 11:10:24'),(121,2,39,0,'',NULL,'2026-01-02 11:10:24'),(122,2,40,0,'',NULL,'2026-01-02 11:10:24'),(123,2,41,0,'',NULL,'2026-01-02 11:10:24'),(124,2,42,0,'',NULL,'2026-01-02 11:10:25'),(166,1,1,1,'',NULL,'2026-01-02 11:35:50'),(167,1,2,0,'',NULL,'2026-01-02 11:35:50'),(168,1,3,0,'',NULL,'2026-01-02 11:35:50'),(169,1,4,0,'',NULL,'2026-01-02 11:35:50'),(170,1,5,0,'',NULL,'2026-01-02 11:35:51'),(171,1,6,0,'',NULL,'2026-01-02 11:35:51'),(172,1,7,0,'',NULL,'2026-01-02 11:35:51'),(173,1,8,0,'',NULL,'2026-01-02 11:35:52'),(174,1,9,0,'',NULL,'2026-01-02 11:35:52'),(175,1,10,0,'',NULL,'2026-01-02 11:35:52'),(176,1,11,0,'',NULL,'2026-01-02 11:35:53'),(177,1,12,0,'',NULL,'2026-01-02 11:35:53'),(178,1,13,0,'',NULL,'2026-01-02 11:35:53'),(179,1,14,0,'',NULL,'2026-01-02 11:35:53'),(180,1,15,0,'',NULL,'2026-01-02 11:35:54'),(181,1,16,0,'',NULL,'2026-01-02 11:35:54'),(182,1,17,0,'',NULL,'2026-01-02 11:35:54'),(183,1,18,0,'',NULL,'2026-01-02 11:35:55'),(184,1,19,0,'',NULL,'2026-01-02 11:35:55'),(185,1,21,0,'',NULL,'2026-01-02 11:35:55'),(186,1,22,0,'',NULL,'2026-01-02 11:35:56'),(187,1,23,0,'',NULL,'2026-01-02 11:35:56'),(188,1,24,0,'',NULL,'2026-01-02 11:35:56'),(189,1,25,0,'',NULL,'2026-01-02 11:35:57'),(190,1,26,0,'',NULL,'2026-01-02 11:35:57'),(191,1,27,0,'',NULL,'2026-01-02 11:35:57'),(192,1,28,0,'',NULL,'2026-01-02 11:35:57'),(193,1,29,0,'',NULL,'2026-01-02 11:35:58'),(194,1,30,0,'',NULL,'2026-01-02 11:35:58'),(195,1,31,0,'',NULL,'2026-01-02 11:35:58'),(196,1,32,0,'',NULL,'2026-01-02 11:35:59'),(197,1,33,0,'',NULL,'2026-01-02 11:35:59'),(198,1,34,0,'',NULL,'2026-01-02 11:35:59'),(199,1,35,0,'',NULL,'2026-01-02 11:36:00'),(200,1,36,0,'',NULL,'2026-01-02 11:36:00'),(201,1,37,0,'',NULL,'2026-01-02 11:36:00'),(202,1,38,0,'',NULL,'2026-01-02 11:36:00'),(203,1,39,0,'',NULL,'2026-01-02 11:36:01'),(204,1,40,0,'',NULL,'2026-01-02 11:36:01'),(205,1,41,0,'',NULL,'2026-01-02 11:36:01'),(206,1,42,0,'',NULL,'2026-01-02 11:36:02');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` int NOT NULL,
  `session_date` date NOT NULL,
  `session_time` enum('Sáng','Chiều','Tối') COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `attendance_sessions_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` VALUES (1,3,'2026-01-02','Sáng','2026-01-02 08:55:16'),(2,3,'2026-01-02','Chiều','2026-01-02 11:10:12');
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `subject_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`,`subject_id`),
  KEY `subject_id` (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,1,3),(2,2,3),(3,3,3),(4,4,3),(5,5,3),(6,6,3),(7,7,3),(8,8,3),(9,9,3),(10,10,3),(11,11,3),(12,12,3),(13,13,3),(14,14,3),(15,15,3),(16,16,3),(17,17,3),(18,18,3),(19,19,3),(20,21,3),(21,22,3),(22,23,3),(23,24,3),(24,25,3),(25,26,3),(26,27,3),(27,28,3),(28,29,3),(29,30,3),(30,31,3),(31,32,3),(32,33,3),(33,34,3),(34,35,3),(35,36,3),(36,37,3),(37,38,3),(38,39,3),(39,40,3),(40,41,3),(41,42,3);
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mssv` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `class_name` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mssv` (`mssv`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'22050002','Nguyễn Quốc Thái','25TH02',NULL,'2026-01-02 09:14:41'),(2,'22050004','Phạm Huỳnh Nhật Ý','25TH02',NULL,'2026-01-02 09:14:41'),(3,'22050030','Vy Ngọc Nhân','25TH02',NULL,'2026-01-02 09:14:42'),(4,'22050081','Nguyễn Đức Duy','25TH02',NULL,'2026-01-02 09:14:43'),(5,'22050094','Đặng Ngọc Phong','25TH02',NULL,'2026-01-02 09:14:43'),(6,'23050047','Lê Quang Hải','26TH01',NULL,'2026-01-02 09:14:44'),(7,'23050053','Hoàng Anh Dũng','26TH01',NULL,'2026-01-02 09:14:44'),(8,'23050062','Nguyễn Tài Nhân','26TH02',NULL,'2026-01-02 09:14:45'),(9,'23050064','Trần Thị Trúc Lan','26TH02',NULL,'2026-01-02 09:14:46'),(10,'23050067','Châu Khang Duy','26TH02',NULL,'2026-01-02 09:14:46'),(11,'23050070','Nguyễn Đặng Đức Duy','26TH02',NULL,'2026-01-02 09:14:47'),(12,'23050071','Huỳnh Nguyễn Tú','26TH02',NULL,'2026-01-02 09:14:47'),(13,'23050075','Nguyễn Thị Hồng Nhung','26TH02',NULL,'2026-01-02 09:14:48'),(14,'23050077','Lê Trường Thịnh','26TH02',NULL,'2026-01-02 09:14:49'),(15,'23050079','Nguyễn Đức Long','26TH02',NULL,'2026-01-02 09:14:49'),(16,'23050083','Huỳnh Thái Khoa','26TH02',NULL,'2026-01-02 09:14:50'),(17,'23050084','Lê Ngọc Sang','26TH02',NULL,'2026-01-02 09:14:50'),(18,'23050087','Ong Tuấn Lộc','26TH02',NULL,'2026-01-02 09:14:51'),(19,'23050090','Nguyễn Đăng Thảo','26TH02',NULL,'2026-01-02 09:14:52'),(21,'23050091','Lưu Hồng Phương','26TH02',NULL,'2026-01-02 09:14:52'),(22,'23050093','Hoàng Quốc Huy','26TH02',NULL,'2026-01-02 09:14:53'),(23,'23050095','Nguyễn Tấn Phước','26TH02',NULL,'2026-01-02 09:14:53'),(24,'23050097','Mai Thanh Phong','26TH02',NULL,'2026-01-02 09:14:54'),(25,'23050098','Lê Duy Tuấn Anh','26TH02',NULL,'2026-01-02 09:14:55'),(26,'23050099','Nguyễn Mạnh Phát','26TH02',NULL,'2026-01-02 09:14:55'),(27,'23050100','Lê Đình Tuyển','26TH02',NULL,'2026-01-02 09:14:56'),(28,'23050102','Lý Lâm Vũ','26TH02',NULL,'2026-01-02 09:14:56'),(29,'23050103','Phạm Nguyễn Thành Tài','26TH02',NULL,'2026-01-02 09:14:57'),(30,'23050104','Phạm Đức Nhân','26TH02',NULL,'2026-01-02 09:14:58'),(31,'23050105','Nguyễn Thị Tuyết Băng','26TH02',NULL,'2026-01-02 09:14:58'),(32,'23050106','Nguyễn Hoài Nam','26TH02',NULL,'2026-01-02 09:14:59'),(33,'23050109','Nguyễn Cao Thiện Phú','26TH02',NULL,'2026-01-02 09:14:59'),(34,'23050110','Lê Gia Bảo','26TH02',NULL,'2026-01-02 09:15:00'),(35,'23050111','Lê Thanh Dũng','26TH02',NULL,'2026-01-02 09:15:01'),(36,'23050112','Nguyễn Đức Tường','26TH02',NULL,'2026-01-02 09:15:01'),(37,'23050115','Trần Thị Ngọc Hằng','26TH02',NULL,'2026-01-02 09:15:02'),(38,'23050116','Lê Tuấn Hải','26TH02',NULL,'2026-01-02 09:15:02'),(39,'23050117','Hạ Chí Tiền','26TH02',NULL,'2026-01-02 09:15:03'),(40,'23050118','Nguyễn Tuấn Anh','26TH02',NULL,'2026-01-02 09:15:04'),(41,'23050119','Trần Thành Long','26TH02',NULL,'2026-01-02 09:15:04'),(42,'23050120','Nguyễn Minh Cang','26TH02',NULL,'2026-01-02 09:15:05');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subject_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `semester` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `teacher_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,NULL,'NHẬP MÔN KHOA HỌC DỮ LIỆU','HK1',NULL,'2026-01-10','2026-04-25',''),(2,NULL,'AN NINH CƠ SỞ DỮ LIỆU','HK1',NULL,'2026-01-05','2026-04-20',''),(3,NULL,'ĐỒ ÁN NGÀNH','HK1',NULL,'2026-01-05','2026-04-05','Nguyễn Quân');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('admin','teacher') COLLATE utf8mb4_general_ci DEFAULT 'teacher',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','@123456','Quản Trị Viên','admin','2026-01-01 19:34:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-02 20:32:32
