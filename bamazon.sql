DROP DATABASE IF EXISTS storefront_db;
CREATE DATABASE storefront_db;

USE storefront_db;

CREATE TABLE products(
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price INT default 0,
  stock_quantity INT default 0,
  PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("black-ink ballpoint pens", "office supplies", 2.5, 50);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("scissors", "office supplies", 5, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("oven mitt", "kitchen goods", 10, 30);