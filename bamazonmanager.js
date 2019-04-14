const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Yes",
    database: "storefront_db"
});

let products= [];
// let productID = 0;
// let userchoice;
let amount = 0;
let price = 0;
  
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    makeASelection();
});

function makeASelection() {
    console.log(products);
    inquirer.prompt([
        {
            type: "list",
            name: "managerchoice",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        },
        ]).then((response) => {
            if (response.managerchoice === "View Products for Sale") {
                displayProducts();
            } else if (response.managerchoice === "View Low Inventory") {
                viewLow();
            } else if (response.managerchoice === "Add to Inventory") {
                addInventory();
            } else if (response.managerchoice === "Add New Product") {
                newProduct();
            } else if (response.managerchoice === "Exit") {
                closeProgram();
            }
    })
}

function displayProducts() {
    products = []; 
    console.log("Products available: \n");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            products.push(res[i].id);
            console.log("Product: " + res[i].product_name + "\n"
            + "ID: " + res[i].id + "\n"
            + "Department: " + res[i].department_name + "\n"
            + "Price: $" + parseInt(res[i].price) +"\n" 
            + "Amount in stock: " + parseInt(res[i].stock_quantity) + "\n")
        }
        makeASelection();
    });
}

function viewLow() {
    console.log("Finding quantities with inventory count < 5");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            quantity = parseInt(res[i].stock_quantity);
            if (quantity < 5) {
                console.log("Product: " + res[i].product_name + "\n"
                + "ID: " + res[i].id + "\n"
                + "Department: " + res[i].department_name + "\n"
                + "Price: $" + parseInt(res[i].price) +"\n" 
                + "Amount in stock: " + parseInt(res[i].stock_quantity) + "\n")
            } 
        }
        makeASelection();
    })
}

function addInventory() {
    inquirer.prompt([
        {
            type: "input",
            message: "Item number: ",
            name: "product"
        },
        {
            message: "Number of items to add: ",
            name: "itemsAdded",
            validate: function(value) {
                if (isNaN(value) === true) {
                    return false
                }
            return true;
            }
        }
    ]).then((response) => {
        product = parseInt(response.product);
        amount = parseInt(response.itemsAdded);
        connection.query("SELECT * from products WHERE ?",
        [
            {
                id: product
            }
        ],
        function(err, response) {
            if (err) throw err;
            quantity = parseInt(response[0].stock_quantity);
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: (quantity + amount)
                    },
                    {
                        id: product
                    }
                ],
                function(err) {
                    if (err) throw err;
                    readAffectedRow(product);
                }
                )
        })
    })
}

function newProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "What item would you like to add?",
            name: "product"
        },
        {
            type: "input",
            message: "What department does this item belong in?",
            name: "department"
        },
        {
            message: "Cost per item: ",
            name: "price",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true
                }
            return false;
            }
        },
        {
            message: "Number of items to add: ",
            name: "itemsAdded",
            validate: function(value) {
                if (isNaN(value) === true) {
                    return false
                }
            return true;
            }
        }
    ]).then((response) => {
        amount = parseInt(response.itemsAdded);
        price = parseFloat(response.price);
        newProduct = response.product;
        connection.query(
            "INSERT INTO products SET ?",
            {
              product_name: newProduct,
              department_name: response.department,
              price: price,
              stock_quantity: amount
            },
            function(err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " product inserted!\n");
            }
        )
        connection.query("SELECT * FROM products WHERE ?",
        {
            product_name: newProduct
        }, function(err, res) {
            if (err) throw err;
            product = parseInt(res[0].id);
            readAffectedRow(product);
        })
    })
}

function readAffectedRow(product) {
    connection.query("SELECT * FROM products WHERE ?",
    {
        id: product
    }, function(err, res) {
        if (err) throw err;
        console.log("You added " + amount + " " + res[0].product_name);
        console.log("Product: " + res[0].product_name + "\n"
        + "New quantity: " + res[0].stock_quantity);
        makeASelection();
    }
    )
}

function closeProgram() {
    connection.end();
    return;
}