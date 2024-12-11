// https://project-3-team-0p.onrender.com

// Import statements
const {Pool} = require("pg");
const express = require("express");
const path = require("path");
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

// Connects to the database
const app = express();
app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());
app.use(express.text());

// Connects to the data locally and privately
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

// Launches the web page at 8080
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

// Used to get the meal size info
app.get("/meal-size", async (req, res) => {
    // Get data from the database
    const rows = await readMealSizesInfo();
    
    // Send response as a JSON object
    res.json(rows);
});

// Gets the entree info
app.get("/entrees", async (req, res) => {
    // Get data from the database
    const rows = await readMenuItems();

    // Filter values to just entrees
    const entrees = rows.filter(item => item.category === "Entree").map(item => item.name);

    // Send response as a JSON object
    res.json(entrees);
});

// Gets the side info
app.get("/sides", async (req, res) => {
    // Get data from the database
    const rows = await readMenuItems();

    // Filter values to just sides
    const sides = rows.filter(item => item.category === "Side").map(item => item.name);

    // Send response as a JSON object
    res.json(sides);
});

//Tests inputed login credentials against database
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

//Returns id of the latest order in the database
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

// Gets the data for all inventory items
app.get("/inventory", async (req, res) => {
    // Get data from the database
    const rows = await readInventory();
    
    res.json(rows);
});

// Gets the data (just the names) for an inventory dropdown
app.get('/inventoryItems', async (req, res) => {
    try {
        const result = await pool.query('SELECT item_name FROM inventory');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching inventory names');
    }
});

// Gets the prices of all the meals and their prices
app.get("/prices", async (req, res) => {
    // Get data from the database
    const rows = await readMealPrices();
    
    res.json(rows);
});

// Puts new employee data sent in the database
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

// Removes the employee data sent from the database
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

// Changes the database from the employee data sent
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

// Changes the database from the price data sent
app.post("/change-price", async (req, res) => {
    try {
        const newPriceData = req.body;
        console.log("Received meal size and new price:", newPriceData);
        let returnMessage = await changePrice(newPriceData);
        console.log(returnMessage);
        res.status(200).json({ message: returnMessage });
    } catch (e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Changes the data from the inventory data sent
app.post("/order-inventory", async (req, res) => {
    try {
        const orderInventoryData = req.body;
        console.log("Received item and amount to order:", orderInventoryData);
        let returnMessage = await orderInventory(orderInventoryData);
        console.log(returnMessage);
        res.status(200).json({ message: returnMessage });
    } catch (e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Changes the data based on the inventory data sent
app.post("/decrease-inventory", async (req, res) => {
    try {
        const orderInventoryData = req.body;
        console.log("Received item and amount to order:", orderInventoryData);
        let returnMessage = await decreaseInventory(orderInventoryData);
        console.log(returnMessage);
        res.status(200).json({ message: returnMessage });
    } catch (e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Gets all menu items from the server and returns them as a JSON array of objects.
 * @async
 * @function getMenuItems
 * @returns {Promise<Object[]>} The menu items, or an error message if the request fails.
 */
app.get("/menuitems", async (req, res) => {
    try {
        // Get data from the database
        const rows = await readMenuItems();
        
        res.json(rows);
    } catch(e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Adds a new menu item to the database.
 * @async
 * @function addMenuItem
 * @param {Object} menuItemData The new menu item data.
 * @returns {Promise<void>}
 */
app.post("/add-menu-item", async (req, res) => {
    try {
        const menuItemData = req.body;
        console.log("Received new menu item data:", menuItemData);
        await addMenuItem(menuItemData);
        res.status(200).json({ message: "Menu item added" });
    } catch(e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Deletes a menu item from the database.
 * @async
 * @function deleteMenuItem
 * @param {string} name The name of the menu item to delete.
 * @returns {Promise<void>}
 */
app.post("/delete-menu-item", async (req, res) => {
    try {
        const name = req.body;
        console.log("Received menu item name:", name);
        let returnMessage = await deleteMenuItem(name);
        console.log(returnMessage);
        res.status(200).json({ message: returnMessage });
    } catch (e) {
        console.error(`HTTP request failed: ${e}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Makes query to get data from the table mealsizes.
 * @async
 * @function readMealSizesInfo
 * @returns {Promise|null} Returns the meal name, num of entrees, and num of sides
 */
async function readMealSizesInfo() {
    try {
        const results = await pool.query("SELECT mealname, numberofentrees, numberofsides FROM mealsizes");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

/**
 * Makes query to get data from the table orders.
 * @async
 * @function readMealSizesInfo
 * @param {Object} orderData The order data
 * @returns {Promise|null} Returns the id of the last order
 */
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

/**
 * Makes query to get data from the table mealsizes.
 * @async
 * @function readMealSizesInfo
 * @param {Object} orderData The for the inventory
 */
async function decreaseInventory(orderData){
    const numItems = orderData.length;
    let amountNeeded = .3;
    for(let i = 0; i < numItems; ++i){

        // get the meal size item to decrease like bowls, cartons, etc and decrease it
        let mealSizeItem = "";
        if(orderData[i][0].includes("a la carte")){
            if(orderData[i][0].includes("small")){
                mealSizeItem = "small cartons";
                amountNeeded = .6;
            }else if(orderData[i][0].includes("med")){
                mealSizeItem = "medium cartons";
                amountNeeded = .8;
            }else if(orderData[i][0].includes("large")){
                mealSizeItem = "large cartons";
                amountNeeded = 1;
            }
        }else{
            mealSizeItem = orderData[i][0] + "s";
        }

        await pool.query("UPDATE inventory SET amount = amount - 1 WHERE item_name = $1", [mealSizeItem]);
        await pool.query("UPDATE inventory SET amount = amount - 1 WHERE item_name = $1", ["plastic utensils"]);         
        await pool.query("UPDATE inventory SET amount = amount - 1 WHERE item_name = $1", ["napkins"]);  

        for(let j = 1; j < 5; ++j){
            // Capitalize the menu item so it matches the value in SQL
            const menuItem = orderData[i][j].replace(/\b\w/g, char => char.toUpperCase());
            if(!orderData[i][j].includes("N/A")){
                const ingredients = await pool.query("SELECT ingredient1, ingredient2, ingredient3 FROM menuitems WHERE name = $1", [menuItem]);
                let ingredientArray = [ingredients.rows[0].ingredient1, ingredients.rows[0].ingredient2, ingredients.rows[0].ingredient3]
                for(let k = 0; k < 3; ++k){
                    await pool.query("UPDATE inventory SET amount = amount - $1 WHERE item_name = $2", [amountNeeded, ingredientArray[k]]);
                }
            }
        }
    }
}

/**
 * Makes a query to the database for the price of a meal size
 * @async
 * @function getOrderPrice
 * @param {Object} orderData The order data that the customer chose.
 * @returns {Promise<Array} Returns price of the order passed in based on meal prices set in the database
 */
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

/**
 * Makes a query to the database for all the employee data.
 * @async
 * @function readEmployees
 * @returns {Promise<Array} Returns the name, username, password, and position of all employees
 */
async function readEmployees() {
    try {
        const results = await pool.query("SELECT name, username, password, position FROM employees");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

/**
 * Makes a query to the data to insert a new employee.
 * @async
 * @function addEmployee
 * @param {Object} employeeData The new employee data.
 */
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

/**
 * Makes a query to the database to remove an employee from the database.
 * @async
 * @function removeEmployee
 * @param {Object} username The username of the employee
 * @returns {Promise<String>} Returns a message if successful or not
 */
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

/**
 * Makes a query to the database to change the position of an employee.
 * @async
 * @function changeEmployeePosition
 * @param {Object} employeeData The employee data.
 * @returns {Promise<String>} Returns a message if successful or not
 */
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

/**
 * Gets all menu items from the database and returns them as an array of objects.
 * @async
 * @function readMenuItems
 * @returns {Promise<Object[]>} The menu items, or an error message if the request fails.
 */
async function readMenuItems() {
    try {
        const results = await pool.query("SELECT name, category, ingredient1, ingredient2, ingredient3 FROM menuitems");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

/**
 * Adds a new menu item to the database.
 * @async
 * @function addMenuItem
 * @param {Object} menuItemData The new menu item data.
 * @returns {Promise<void>}
 */
async function addMenuItem(menuItemData) {
    try {
        const name = menuItemData[0];
        const category = menuItemData[1];
        const ingredient1 = menuItemData[2];
        const ingredient2 = menuItemData[3];
        const ingredient3 = menuItemData[4];
    
        await pool.query("INSERT INTO menuitems VALUES ($1, $2, $3, $4, $5)", [name, category, ingredient1, ingredient2, ingredient3]);
    } catch (e) {
        console.log("Query failed to add menu item:", e);
    }
}

/**
 * Deletes a menu item from the database.
 * @async
 * @function deleteMenuItem
 * @param {String} name The name of the menu item to delete.
 * @returns {Promise<String>} A success or failure message.
 */
async function deleteMenuItem(name) {
    try {
        let result = await pool.query("DELETE FROM menuitems WHERE name = $1", [name]);

        if (result.rowCount === 0) {
            return "Menu item not found.";
        } else {
            return "Menu item removed!";
        }
    } catch (e) {
        console.log("Query failed to add menu item:", e);
    }
}

/**
 * Makes a query to the database to get all meal names and their prices
 * @async
 * @function readMealPrices
 * @returns {Promise<Array>} Returns the mealname and price
 */
async function readMealPrices() {
    try {
        const results = await pool.query("SELECT mealname, price FROM mealsizes");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

/**
 * Makes a query to the database for all inventoy items and their amounts
 * @async
 * @function readInventory
 * @returns {Promise<Array>} Returns all inventory items and its amount
 */
async function readInventory() {
    try {
        const results = await pool.query("SELECT item_name, amount FROM inventory");
        return results.rows;
    } catch(e) {
        console.log("Query failed: ", e);
    }
}

/**
 * Makes a query to the database that updates the price of the meal size.
 * @async
 * @function changePrice
 * @param {Object} newPriceData Object of the meal size and its new price 
 * @returns 
 */
async function changePrice(newPriceData) {
    try {
        const mealName = newPriceData[0];
        const newPrice = newPriceData[1];

        const result = await pool.query("UPDATE mealsizes SET price = $1 WHERE mealname = $2", [newPrice, mealName]);

        if (result.rowCount === 0) {
            return "Meal Size not found."
        } else {
            return `${mealName}'s price has successfully been changed to ${newPrice}!`;
        }
    } catch (e) {
        console.log("Query failed to change the meal's price:", e);
    }
}

/**
 * Makes a query to the database that adds more inventory for a specific item.
 * @async
 * @function orderInventory
 * @param {Object} orderInventoryData Inventory item name and its added amount 
 * @returns {Promise<String>} A message of if the ordering was a success or not
 */
async function orderInventory(orderInventoryData) {
    try {
        const item_name = orderInventoryData[0];
        const amount = orderInventoryData[1];

        const result = await pool.query("UPDATE inventory SET amount = amount + $1 WHERE item_name = $2", [amount, item_name]);

        if (result.rowCount === 0) {
            return "Inventory item not found."
        } else {
            return `Successfully ordered ${amount} units of ${item_name}!`;
        }
    } catch (e) {
        console.log("Query failed to order inventory:", e);
    }
}

// Gets sales data from database
app.get('/api/sales-data', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                TO_CHAR(date, 'YYYY-MM') AS month,
                SUM(price * num_of_items) AS total_sales
            FROM
                orders
            GROUP BY
                month
            ORDER BY
                month;
        `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Server Error');
    }
});

// Close the client when the application exits
process.on('exit', async () => {
    await pool.end();
    console.log("Database client disconnected");
});