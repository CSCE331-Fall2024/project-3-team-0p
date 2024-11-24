// https://project-3-team-0p.onrender.com

// Import statements
const {Pool} = require("pg");
const express = require("express");
const path = require("path");
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { userInfo } = require("os");

// Connects to the database
const app = express();
app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());
app.use(express.text());

const pool = new Pool ({
    "host": "csce-315-db.engr.tamu.edu",
    "user": "team_0p",
    "database": "team_0p_db",
    "password": "jolteon82",
    "port": 5432
});

// Configure Passport with Google OAuth strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: '810621067928-6a9e9jkp7gokoo7b2d62249jf3nj5aju.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            // Process the user profile here
            console.log('Google profile:', profile);
            // Pass the profile and tokens to the next middleware
            return done(null, { profile, accessToken, refreshToken });
        }
    )
);

// Initialize Passport
app.use(passport.initialize());

// Sets the starting page when web page loads
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "employee-mealsize.html"));
});

// Launches the web page
app.listen(8080, () => console.log("app listening at http://localhost:8080"));

// Start the Google login process
app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle the callback from Google
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Successful authentication
        res.redirect('/employee-mealsize.html');
    }
);

app.get("/meal-size", async (req, res) => {
    // Get data from the database
    const rows = await readMealSizes();
    
    // Send response as a JSON object
    res.json(rows);
});

app.get("/entrees", async (req, res) => {
    // Get data from the database
    const rows = await readMenuItems();

    // Filter values to just entrees
    const entrees = rows.filter(item => item.category === "Entree").map(item => item.name);

    // Send response as a JSON object
    res.json(entrees);
});

app.get("/sides", async (req, res) => {
    // Get data from the database
    const rows = await readMenuItems();

    // Filter values to just sides
    const sides = rows.filter(item => item.category === "Side").map(item => item.name);

    // Send response as a JSON object
    res.json(sides);
});

app.post("/login", async (req, res) => {
const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      "SELECT position FROM employees WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      const position = result.rows[0].position;
      res.json({ success: true, position: position });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get cost of current order
app.get("/get-order-price", async (req, res) => {
    try{
        const orderData = req.query.orderData;
        price = await getOrderPrice(JSON.parse(orderData));
        res.json(price);
    } catch(e) {
        console.error(`HTTP request failed: ${e}`);
    }
});

// http request to place order data into database
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

app.get('/last-order-id', async (req, res) => {
    try {
        const result = await pool.query("select max(id) as max_id from orders");
        const orderID = result.rows[0].max_id;
        res.json({ order_id: orderID });
    } catch (error) {
        console.error('Error fetching order ID:', error);
        res.status(500).json({ error: 'Failed to fetch order ID' });
    }
});

// login page 
app.get("/employees", async (req, res) => {
    // Get data from the database
    const rows = await readEmployees();
    
    res.json(rows);
});

app.get("/prices", async (req, res) => {
    // Get data from the database
    const rows = await readMealPrices();
    
    res.json(rows);
});

app.post("/add-employee", async (req, res) => {
    try {
        const employeeData = req.body;
        console.log("Received new employee data:", employeeData);
        await addEmployee(employeeData);
        res.status(200).json({ message: "Employee added" });
    } catch(e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/remove-employee", async (req, res) => {
    try {
        const username = req.body;
        console.log("Received employee username:", username);
        let returnMessage = await removeEmployee(username);
        console.log(returnMessage);
        res.status(200).json({ message: returnMessage });
    } catch (e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/change-employee-position", async (req, res) => {
    try {
        const employeeData = req.body;
        console.log("Received employee username and new position:", employeeData);
        let returnMessage = await changeEmployeePosition(employeeData);
        console.log(returnMessage);
        res.status(200).json({ message: returnMessage });
    } catch (e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

async function readMealSizes() {
    try {
        const results = await pool.query("SELECT mealname FROM mealsizes");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

async function readMenuItems() {
    try {
        const results = await pool.query("SELECT name, category FROM menuitems");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
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
        const numItems = orderData.length;
        let orderPrice = 0;
        let itemPrices = [];

        // Get total price of the order
        for(let i = 0; i < numItems; ++i) {
            const priceResult = await pool.query("select price from mealsizes where mealname = $1", [orderData[i][0]]);
            itemPrices.push(priceResult.rows[0].price);
            orderPrice += itemPrices[i];
        }
        
        console.log(`Current order data: (${orderID}, ${orderDate}, ${orderTime}, ${numItems}, ${orderPrice})`);
        
        // Insert into orders
        await pool.query("INSERT INTO orders VALUES ($1, $2, $3, $4, $5)", [orderID, orderDate, orderTime, numItems, orderPrice]);

        // INFORMATION FOR ORDER ITEM
        for(let i = 0; i < numItems; ++i) {
            // Get id for this item in the order
            const orderItemsResult = await pool.query("select max(id) as max_id from orderitems");
            const orderItemsID = orderItemsResult.rows[0].max_id + 1;
            
            // Get price of this order item
            const orderItemPrice = itemPrices[i];
            
            console.log(`Current orderitems data: (${orderItemsID}, ${orderID}, ${orderItemPrice}, ${orderData[i][0]}, ${orderData[i][1]}, ${orderData[i][2]}, ${orderData[i][3]}, ${orderData[i][4]}})`);
            
            // Insert into orderitems table
            await pool.query("INSERT INTO orderitems VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [orderItemsID, orderID, orderItemPrice, orderData[i][0], orderData[i][1], orderData[i][2], orderData[i][3], orderData[i][4]]);
        }
    } catch(e) {
        console.error(`Query failed: ${e}`);
    }
}

async function getOrderPrice(orderData) {
    try {
        let orderPrice = 0;
        for(let i = 0; i < orderData.length; ++i) {
            temp = await pool.query("select price from mealsizes where mealname = $1", [orderData[i][0]]);
            orderPrice += temp.rows[0].price;
        }
        
        return orderPrice;  
    } catch(e) {
        console.error(`Price fetch failed with error: ${e}`);
    }
}

// Functions for manager-employee page
async function readEmployees() {
    try {
        const results = await pool.query("SELECT name, username, password, position FROM employees");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

async function addEmployee(employeeData) {
    try {
        const name = employeeData[0];
        const username = employeeData[1];
        const password = employeeData[2];
        const position = employeeData[3];
    
        await pool.query("INSERT INTO employees VALUES ($1, $2, $3, $4)", [name, username, password, position]);
    } catch (e) {
        console.log("Query failed to add employee:", e);
    }
}

async function removeEmployee(username) {
    try {
        let result = await pool.query("DELETE FROM employees WHERE username = $1", [username]);

        if (result.rowCount === 0) {
            return "Employee not found.";
        } else {
            return "Employee removed!";
        }
    } catch (e) {
        console.log("Query failed to add employee:", e);
    }
}

async function changeEmployeePosition(employeeData) {
    try {
        const username = employeeData[0];
        const newPosition = employeeData[1];

        const result = await pool.query("UPDATE employees SET position = $1 WHERE username = $2", [newPosition, username]);

        if (result.rowCount === 0) {
            return "Employee not found."
        } else {
            return `${username}'s position has successfully been changed to ${newPosition}!`;
        }
    } catch (e) {
        console.log("Query failed to change employee's position:", e);
    }
}

async function readMealPrices() {
    try {
        const results = await pool.query("SELECT mealname, price FROM mealsizes");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

// Close the client when the application exits
process.on('exit', async () => {
    await pool.end();
    console.log("Database client disconnected");
});