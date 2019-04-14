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
let userchoice;
let amount = 0;
  
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayProducts();
});

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

function makeASelection() {
    console.log(products);
    inquirer.prompt([
        {
            type:  'input',
            name: 'userchoice',
            message: "Which item would you like to buy? (Please use the item's ID number)",
            validate: function(response) {
                if (products.indexOf(parseInt(response)) === -1) {
                    return false
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'amount',
            message: 'How many items would you like to buy?',
        },
        ]).then((response) => {
            userchoice = parseInt(response.userchoice);
            amount = parseInt(response.amount);
            evaluateStock();
    })
}

function evaluateStock() {
    connection.query("SELECT * FROM products WHERE ?",
    {
        id: userchoice
    }, function(err, data) {
        if (err) throw err;
        quantity = parseInt(data[0].stock_quantity);
        price = parseFloat(data[0].price);
        department = data[0].department_name;
        sales = parseFloat(data[0].product_sales);
        if (amount > quantity) {
            console.log("Sorry, we don't have enough for that order. Please try again" + "\n\n");
            displayProducts();
        } else {
            quantity = quantity - amount;
            console.log(quantity);
            makeAPurchase();
        }
    },
    )
}

function makeAPurchase() {
    connection.query("UPDATE products SET ? WHERE ?",
    [
        {
            stock_quantity: quantity,
            product_sales: sales + (amount * price)
        },
        {
            id: userchoice
        }
    ],
    function(err) {
        if (err) throw err;
        readAffectedRow();
    }
    )
    // connection.query("UPDATE departments SET ? WHERE ?",
    // [
    //     {
    //         overhead_costs: overhead_costs + (quantity * price),
    //     },
    //     {
    //         department_name: department
    //     }
    // ])
}

function readAffectedRow() {
    connection.query("SELECT * FROM products WHERE ?",
    {
        id: userchoice
    }, function(err, res) {
        if (err) throw err;
        console.log("You bought " + amount + " " + res[0].product_name);
        console.log("Product: " + res[0].product_name + "\n"
        + "New quantity: " + res[0].stock_quantity)
    }
    )
    connection.end();
}