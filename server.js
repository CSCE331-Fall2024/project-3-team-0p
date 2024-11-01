const {Pool} = require("pg");
const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());

const pool = new Pool ({
    "host": "csce-315-db.engr.tamu.edu",
    "user": "team_0p",
    "database": "team_0p_db",
    "password": "jolteon82",
    "port": 5432
});

// Stes the starting page when web page loads
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "employee-mealsize.html"));
});

// Launches the web page
app.listen(8080, () => console.log("app listening at http://localhost:8080"));


app.post("/submit", async (req, res) => {
    try{
        const orderData = req.body;
        console.log("Received order data", orderData);
        await addOrder(orderData);
        res.status(200).json({ message: "Order received" });
    } catch(e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

start();
async function start() {
    // await connect();
    try {
        await pool.connect()
        console.log("Connected to database successfully")
    } catch(e) {
        console.log(`Failed to connect to database: ${e}`);
    }
}

async function addOrder(orderData) {
    try{
        // INFORMATION FOR ORDER
        // Get order id for this order
        const orderResult = await pool.query("select max(id) as max_id from orders");
        const orderID = orderResult.rows[0].max_id + 1;
        
        const currentDate = new Date();
        // Get the current date components
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(currentDate.getDate()).padStart(2, '0');
        const orderDate = `${year}-${month}-${day}`;
        
        // Get the current time components
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        const orderTime = `${hours}:${minutes}:${seconds}`;
        
        // Get number of items in order
        const numItems = 1;
        
        // Get total price of the order
        const priceResult = await pool.query("select price from mealsizes where mealname = $1", [orderData[0]]);
        const orderPrice = priceResult.rows[0].price;
        
        console.log(`Current order data: (${orderID}, ${orderDate}, ${orderTime}, ${numItems}, ${orderPrice})`);
        
        // INFORMATION FOR ORDER ITEM
        // Get id for this item in the order
        const orderItemsResult = await pool.query("select max(id) as max_id from orderitems");
        const orderItemsID = orderItemsResult.rows[0].max_id + 1;
        
        // Get price of this order item
        const orderItemPrice = orderPrice;
        
        console.log(`Current orderitems data: (${orderItemsID}, ${orderID}, ${orderItemPrice}, ${orderData[0]}, ${orderData[1]}, ${orderData[2]}, ${orderData[3]}, ${orderData[4]}})`);
        
        // Insert into orders and orderitems tables
        await pool.query("INSERT INTO orders VALUES ($1, $2, $3, $4, $5)", [orderID, orderDate, orderTime, numItems, orderPrice]);
        await pool.query("INSERT INTO orderitems VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [orderItemsID, orderID, orderItemPrice, orderData[0], orderData[1], orderData[2], orderData[3], orderData[4]]);
    } catch(e) {
        console.error(`Query failed: ${e}`);
    }
}

// Close the client when the application exits
process.on('exit', async () => {
    await pool.end();
    console.log("Database client disconnected");
});

// CAN BE USED IN LATER SPRINT
// app.get("/employees", async (req, res) => {
//     const rows = await readEmployees();
//     res.setHeader("content-type", "application/json");
//     res.send(JSON.stringify(rows));
// });

// async function readEmployees() {
    //     try {
        //         const results = await client.query("SELECT name, username, position FROM employees");
        //         return results.rows;
//     } catch(e) {
//         console.log("Query failed: ", e);
//     }
// }