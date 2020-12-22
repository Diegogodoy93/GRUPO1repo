
CREATE DATABASE IF NOT EXISTS GRUPO1DB;
USE GRUPO1DB;


--users: 

CREATE TABLE IF NOT EXISTS users(
`id` INT NOT NULL AUTO_INCREMENT,
`tel` varchar(45) NULL,
`created_at` BIGINT NOT NULL,
`birthday` DATE NULL, 
`user_name` varchar (40),
`name` varchar (40),
`family_name` varchar(40),
`email` varchar (100) NULL,
`apicultor` INT,
PRIMARY KEY(id, user_name)
);

--coolmenaUsers

CREATE TABLE IF NOT EXISTS coolmenaUsers (
`id_users` INT NOT NULL,
`passw` varchar(45),
`SALT` varchar(200),
FOREIGN KEY (id_users)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--googleUsers

CREATE TABLE IF NOT EXISTS googleUsers (
`id_users` INT NOT NULL, 
`id_google` varchar (100),
PRIMARY KEY (id_users, id_google),
FOREIGN KEY (id_users)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);

--facebookUsers

CREATE TABLE IF NOT EXISTS facebookUsers (
`id_users` INT NOT NULL, 
`id_facebook` varchar (100),
PRIMARY KEY (id_users, id_facebook),
FOREIGN KEY (id_users)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);




--follows:

CREATE TABLE IF NOT EXISTS follows(
`id_users` INT NOT NULL,
`id_followed_apic` INT NOT NULL,
PRIMARY KEY (id_users, id_followed_apic),
FOREIGN KEY (id_users) 
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY (id_followed_apic)
REFERENCES apicultores(id_apicultor)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--apicultores: 

CREATE TABLE IF NOT EXISTS apicultores (
`id_apicultor` INT NOT NULL AUTO_INCREMENT,
`id_users` INT NOT NULL,
`web` varchar (45) NULL,
`num_reg_ganadero` varchar (30),
`tipo_org` varchar(30),
PRIMARY KEY(id_apicultor),
FOREIGN KEY(id_users) REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--products: 

CREATE TABLE IF NOT EXISTS products(
`id` INT NOT NULL AUTO_INCREMENT,
`id_apicultor` INT NOT NULL,
`product_name` varchar(45) NOT NULL,
`product_type` varchar(30) NOT NULL,
`price_kg_euro` INT NOT NULL, 
`picture` varchar(45),
`rating` INT,
`description` TINYTEXT,
`long_lat` varchar(45),
PRIMARY KEY (id),
FOREIGN KEY (id_apicultor)
REFERENCES apicultores(id_apicultor)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--users_productsFAV:

CREATE TABLE IF NOT EXISTS users_productsFAV(
`id_product` INT NOT NULL,	
`id_users` INT NOT NULL,
PRIMARY KEY (id_product, id_users),
FOREIGN KEY(id_product) 
REFERENCES products(id)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(id_users) 
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--filters:

CREATE TABLE IF NOT EXISTS filters (
`id_users` INT NOT NULL,
`mil_flores` INT DEFAULT 0,
`mono_flores` INT DEFAULT 0,
`bosque` INT DEFAULT 0,
`cruda` INT DEFAULT 0,
`procesada` INT DEFAULT 0,
PRIMARY KEY (id_users),
FOREIGN KEY (id_users) 
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--chats:

CREATE TABLE IF NOT EXISTS chats(
`id` INT NOT NULL AUTO_INCREMENT,
`created_at` INT NOT NULL,
PRIMARY KEY(id)
);


--chats_users:

CREATE TABLE IF NOT EXISTS chats_users (
`id_users` INT NOT NULL,
`id_chats` INT NOT NULL,
PRIMARY KEY(id_users, id_chats),
FOREIGN KEY (id_users) 
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY (id_chats) 
REFERENCES chats(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);


--log_out_history:

CREATE TABLE IF NOT EXISTS log_out_history(
`id` INT NOT NULL AUTO_INCREMENT, 
`at_time` INT NOT NULL,
`id_users` INT NOT NULL,
PRIMARY KEY(id),
FOREIGN KEY(id_users) 
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);

--log_in_history:

CREATE TABLE IF NOT EXISTS log_in_history(
`id` INT NOT NULL AUTO_INCREMENT, 
`at_time` INT NOT NULL,
`id_users` INT NOT NULL,
PRIMARY KEY(id),
FOREIGN KEY(id_users) 
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE CASCADE
);

--selling_points: 

CREATE TABLE IF NOT EXISTS users_selling_points(
`long_lat` varchar(45),
`id_apicultor` INT NOT NULL,
`location` varchar(60) NULL,
PRIMARY KEY(id_apicultor),
FOREIGN KEY(id_apicultor) 
REFERENCES apicultores(id_apicultor)
ON UPDATE CASCADE
ON DELETE CASCADE
);
