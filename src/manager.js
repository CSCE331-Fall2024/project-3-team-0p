// manager-employees.html
/**
 * Fetches the employee data (name, username, password, and position) from the
 * server by sending a get request.
 * @async
 * @function getEmployeeData
 * @returns {Promise<Object|null} returns a json object
 */
async function getEmployeeData() {
    try {
        // Send request to the server
        let result = await fetch("/employees", {
            method: "GET",
        });
    
        // Check to make sure data is good
        if (result.ok) {
            const employeeData = result.json();
            return employeeData;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get employee data from the server: ", error);
        alert("Failed to get employee data. Please try again.");
    }
}

/**
 * Makes all the rows and fills them with data for all the
 * employee data that is retrieved from getEmployeeData().
 * @async
 * @function populateEmployeeTable
 */
async function populateEmployeeTable() {
    let employeeData = await getEmployeeData();

    const employeeTable = document.getElementById("employee-data-table");
    // Creates the row element for the headers and adds it to the table
    let tr = document.createElement("tr");
    employeeTable.append(tr);

    // Sets the header for the employee table
    const tableHeaders = ["Name", "Username", "Password", "Position"];
    for (let i = 0; i < 4; ++i) {
        const td = document.createElement("td");
        td.textContent = tableHeaders[i];
        td.className = "bg-red-500 text-white border-2 border-black";
        tr.appendChild(td);
    }

    // Populates a row for each employee with all their data
    employeeData.forEach(person => {
        const personInfo = [person.name, person.username, person.password, person.position];
        tr = document.createElement("tr");
        tr.id = person.username;

        personInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-3/12 border-2 border-black";
            tr.appendChild(td);
        });

        employeeTable.appendChild(tr);
    });
}

/**
 * Adds an event listener to the "Add" employee button.
 * When the button is clicked, the addEmployee function is called.
 */
const addEmployeeButton = document.getElementById("add-employee-button");
if (addEmployeeButton) {
    addEmployeeButton.addEventListener("click", addEmployee);
}

/**
 * Adds an event listener to the "Remove" employee button.
 * When the button is clicked, the removeEmployee function is called.
 */
const removeEmployeeButton = document.getElementById("remove-employee-button");
if (removeEmployeeButton) {
    removeEmployeeButton.addEventListener("click", removeEmployee);
}

/**
 * Adds an event listener to the "Change" employee button.
 * When the button is clicked, the changeEmployee function is called.
 */
const changeEmployeeButton = document.getElementById("change-employee-button");
if (changeEmployeeButton) {
    changeEmployeeButton.addEventListener("click", changeEmployee);
}

/**
 * Adds a new employee to the database via post request to the server and
 * will update the table on the interface with the appropriate data.
 * @async
 * @function addEmployee
 * @returns {void} Nothing is returned.
 */
async function addEmployee() {
    // Retrieve the input data for the new employee
    const newName = document.getElementById("add-name-input").value;
    const newUsername = document.getElementById("add-username-input").value;
    const newPassword = document.getElementById("add-password-input").value;
    const newPosition = document.getElementById("add-position-drop-down").value;

    const addEmployeeInfo = [newName, newUsername, newPassword, newPosition];

    // Ensure there is input for all fields and alert if not
    if (!newName || !newUsername || !newPassword || !newPosition) {
        alert("Missing new employee info. Try again.");
        return;
    } else {
        console.log(newName, newUsername, newPassword, newPosition);
    }

    try {
        // Request to server to add to the database the new employee
        const addEmployeeData = JSON.stringify(addEmployeeInfo);
        let result = await fetch("/add-employee", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: addEmployeeData
        });

        // Ensure the employee was added successfully
        if (result.ok) {
            alert("Employee added!");
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
            return;
        }

        // Update the table display
        const newUserInfo = [newName, newUsername, newPassword, newPosition];

        const employeeTable = document.getElementById("employee-data-table");
        const tr = document.createElement("tr");
        tr.id = newUsername;

        newUserInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-3/12 border-2 border-black";
            tr.appendChild(td);
        });

        employeeTable.appendChild(tr);

        // Empty input fields
        document.getElementById("add-name-input").value = "";
        document.getElementById("add-username-input").value = "";
        document.getElementById("add-password-input").value = "";
        document.getElementById("add-position-drop-down").value = "";
        
    } catch (error) {
        console.error("Failed to send employee data to add to the database:", error);
        alert("Failed to add new employee. Please try again.");
    }
}

/**
 * Removes an employee from the database via post request to the server and
 * will update the table on the interface with the removal of appropriate data.
 * @async
 * @function removeEmployee
 * @returns {void} Nothin is returned
 */
async function removeEmployee() {
    // Retrieve input data to remove employee
    const removeUsername = document.getElementById("remove-username-input").value;
    
    // Ensure there is input
    if (!removeUsername) {
        alert("Missing username to remove. Try again.");
        return;
    }

    try {
        // Send request to server to remove employee
        let result = await fetch("/remove-employee", {
            method: "POST",
            headers: {"content-type": "text/plain"},
            body: removeUsername
        });

        // Ensure employee was removed successfully
        if (result.ok) {
            const responseMessage = await result.json();
            alert(responseMessage.message);
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
            return;
        }

        // Update the table display
        const employeeTable = document.getElementById("employee-data-table");
        const tr = document.getElementById(removeUsername);
        employeeTable.deleteRow(tr.rowIndex);

        // Empty input fields
        document.getElementById("remove-username-input").value = "";

    } catch (error) {
        console.error("Failed to send employee data to remove to the database:", error);
        alert("Failed to remove employee. Please try again.");
    }
}

/**
 * Modify's an employee's position in the database via a post request to the server
 * and update the table with the new position.
 * @async
 * @function changeEmployee
 * @returns {void} Nothing is returned.
 */
async function changeEmployee() {
    // Retrieve input to modify the employee position
    const username = document.getElementById("change-username-input").value;
    const changedPosition = document.getElementById("change-position-drop-down").value;

    // Ensure there is input in all fields
    if (!username || !changedPosition) {
        alert("Missing username to remove. Try again.");
        return;
    }

    const changeEmployeePosition = [username, changedPosition];

    try {
        // Send request to modify the database
        const employeeData = JSON.stringify(changeEmployeePosition);
        let result = await fetch("/change-employee-position", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: employeeData
        })

        // Determine whether or not the data is good and alert accordingly
        const responseData = await result.json();
        const responseMessage = responseData.message;
        if (result.ok) {
            alert(responseMessage);

            if (responseMessage === "Employee not found.") {
                return;
            }
        } else {
            alert(`Error: ${responseMessage}`);
            return;
        }

        // Update the table display
        const tr = document.getElementById(username);
        tr.querySelectorAll('td')[3].textContent = changedPosition;

        // Empty input fields
        document.getElementById("change-username-input").value = "";
        document.getElementById("change-position-drop-down").value = "";

    } catch (error) {
        console.error("Failed to send employee data to change position to the database:", error);
        alert("Failed to change employee position. Please try again.");
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
// manager-meals.html
/**
 * Gets all menu items from the server and returns them as a JSON object.
 * @async
 * @function getMenuData
 * @returns {Promise<Object[]>} The menu items, or an error message if the request fails.
 */
async function getMenuData() {
    try {
        let result = await fetch("/menuitems", {
            method: "GET",
        });
    
        if (result.ok) {
            // The JSON response is an array of objects, each with keys name, category, ingredient1, ingredient2, and ingredient3.
            const menuData = await result.json();
            return menuData;
        } else {
            // The JSON response is an object with an error message.
            const errorMessage = await result.json(); 
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get menu data from the server: ", error);
        alert("Failed to get menu data. Please try again.");
    }
}


/**
 * Gets the menu data from the server and populates the menu table with it.
 * The menu table has columns for the name, category, and three ingredients.
 * The function is async, so it returns a Promise that resolves when the table is populated.
 * @async
 * @function populateMenuTable
 */
async function populateMenuTable() {
    // Get the menu data from the server
    let menuData = await getMenuData();

    // Get the menu table element
    const menuTable = document.getElementById("menu-table");

    // Create the row element for the headers and add it to the table
    let tr = document.createElement("tr");
    menuTable.append(tr);

    // Set the header for the menu item table
    const tableHeaders = ["Name", "Category", "Ingredient 1", "Ingredient 2", "Ingredient 3"];
    for (let i = 0; i < 5; ++i) {
        const td = document.createElement("td");
        td.textContent = tableHeaders[i];
        td.className = "bg-red-500 text-white border-2 border-black";
        tr.appendChild(td);
    }

    // Populate a row for each menu item with all its data
    menuData.forEach(item => {
        // Create a row element for this menu item
        tr = document.createElement("tr");
        tr.id = item.name;

        // Create table cells for each of the menu item's properties
        const itemInfo = [item.name, item.category, item.ingredient1, item.ingredient2, item.ingredient3];
        itemInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-1/5 border-2 border-black";
            tr.appendChild(td);
        });

        // Add the row to the menu table
        menuTable.appendChild(tr);
    });
}

/**
 * Adds an event listener to the "Add Menu Item" button.
 * When the button is clicked, the addMenuItem function is called.
 */
const addItemButton = document.getElementById("add-menu-item-button");
if (addItemButton) {
    addItemButton.addEventListener("click", addMenuItem);
}

/**
 * Adds an event listener to the "Delete Menu Item" button.
 * When the button is clicked, the deleteMenuItem function is called.
 */
const deleteItemButton = document.getElementById("delete-item-button");
if (deleteItemButton) {
    deleteItemButton.addEventListener("click", deleteMenuItem);
}

/**
 * Adds a new menu item to the menu table and the database.
 * This function retrieves input values from the form, sends them to the server,
 * and updates the menu table upon success.
 * @async
 * @function addMenuItem
 */
async function addMenuItem() {
    // Retrieve input values for the new menu item
    const newItem = document.getElementById("add-name-input").value;
    const newCategory = document.getElementById("add-category").value;
    const newIngredient1 = document.getElementById("add-ingredient1-input").value;
    const newIngredient2 = document.getElementById("add-ingredient2-input").value;
    const newIngredient3 = document.getElementById("add-ingredient3-input").value;

    // Create an array to hold the new menu item's data
    const addItemInfo = [newItem, newCategory, newIngredient1, newIngredient2, newIngredient3];

    // Check if all required fields are filled in
    if (!newItem || !newIngredient1 || !newIngredient2 || !newIngredient3) {
        alert("Missing new menu item info. Try again.");
        return;
    } else {
        console.log(newItem, newIngredient1, newIngredient2, newIngredient3);
    }

    try {
        // Convert the menu item data to JSON
        const addItemData = JSON.stringify(addItemInfo);

        // Send a POST request to add the new menu item to the database
        let result = await fetch("/add-menu-item", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: addItemData
        });

        // Check if the request was successful
        if (result.ok) {
            alert("Menu item added!");
        } else {
            // Get the error message from the server and display it
            const errorMessage = await result.json();
            alert(`Error: ${errorMessage.message}`);
        }

        // Update the menu table with the new menu item
        const menuTable = document.getElementById("menu-table");
        const tr = document.createElement("tr");
        tr.id = newItem;

        // Create table cells for each piece of the menu item's data
        addItemInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-1/5 border-2 border-black";
            tr.appendChild(td);
        });

        // Add the new row to the menu table
        menuTable.appendChild(tr);

        // Clear input fields after adding the menu item
        document.getElementById("add-name-input").value = "";
        document.getElementById("add-ingredient1-input").value = "";
        document.getElementById("add-ingredient2-input").value = "";
        document.getElementById("add-ingredient3-input").value = "";
        document.getElementById("add-category").value = "";

    } catch (error) {
        // Log and alert if there was a problem sending the data
        console.error("Failed to send menu item data to add to the database:", error);
        alert("Failed to add new menu item. Please try again.");
    }
}

/**
 * Deletes a menu item from the database.
 * @returns {Promise<void>}
 */
async function deleteMenuItem() {
    const deleteItem = document.getElementById("delete-item-input").value;
    
    if (!deleteItem) {
        alert("Missing item to delete. Try again.");
        return;
    }

    try {
        // Send the request to the server
        let result = await fetch("/delete-menu-item", {
            method: "POST",
            headers: {"content-type": "text/plain"},
            body: deleteItem
        });

        // Check if the request was successful
        if (result.ok) {
            const responseMessage = await result.json();
            alert(responseMessage.message);
        } else {
            // Get the error message from the server and display it
            const errorMessage = await result.json(); 
            alert(`Error: ${errorMessage.message}`);
        }

        // Update the table display
        const menuTable = document.getElementById("menu-table");      
        const tr = document.getElementById(deleteItem);
        menuTable.deleteRow(tr.rowIndex);
        
        // Clear the input field after deleting the menu item
        document.getElementById("delete-item-input").value = "";

    } catch (error) {
        // Log and alert if there was a problem sending the data
        console.error("Failed to send menu item data to delete to the database:", error);
        alert("Failed to delete menu item. Please try again.");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// manager-prices.html
/**
 * Adds an event listener to the "Change Price" button.
 * When the button is clicked, the changePrice function is called.
 */
const changePriceButton = document.getElementById("change-price-button");
if (changePriceButton) {
    changePriceButton.addEventListener("click", changePrice);
}

/**
 * gets all of the meal sizes and their prices to populate the price table
 * @returns {Promise<void>}
 */
async function getMealPriceData() {
    try {
        let result = await fetch("/prices", {
            method: "GET",
        });
    
        // Ensures the data was retrieved
        if (result.ok) {
            const mealPriceData = await result.json();
            return mealPriceData;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get inventory data from the server: ", error);
        alert("Failed to get inventory data. Please try again.");
    }
}

/**
 * Populates table containing the prices of all meal sizes
 * @returns {Promise<void>}
 */
async function populatePriceTable() {
    let mealPriceData = await getMealPriceData();

    if(!mealPriceData){
        return;
    }

    const priceTable = document.getElementById("meal-price-table");
    priceTable.innerHTML = "";
    // Creates the row element for the headers and adds it to the table
    let tr = document.createElement("tr");
    priceTable.append(tr);

    // Sets the header for the meal price table
    const tableHeaders = ["Meal Size", "Price"];
    for (let i = 0; i < 2; ++i) {
        const td = document.createElement("td");
        td.textContent = tableHeaders[i];
        td.className = "bg-red-500 text-white border-2 border-black";
        tr.appendChild(td);
    }

    // Populates a row for each meal with all their data
    mealPriceData.forEach(meal => {
        const mealInfo = [meal.mealname, parseFloat(meal.price).toFixed(2)];
        tr = document.createElement("tr");
        tr.id = meal.mealname;

        mealInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-3/12 border-2 border-black";
            tr.appendChild(td);
        });

        priceTable.appendChild(tr);
    });
}

/**
 * changes the price of the selected meal size based on what the user inputs.
 * @returns {Promise<void>}
 */
async function changePrice() {
    const mealSize = document.getElementById("meal-size-drop-down").value;
    const price = document.getElementById("new-price-input").value.trim();
    const newPrice = parseFloat(price);

    if (!mealSize || !newPrice) {
        alert("Please insert a new price for the selected meal size.");
        return;
    }
    else if (isNaN(newPrice) && !(newPrice.toString() === value)) {
        alert("Inserted invalid value for new price. Please try again.");
        return;
    }
    else{
        const changeMealPrice = [mealSize, newPrice];

        try {
            const newPriceData = JSON.stringify(changeMealPrice);
            let result = await fetch("/change-price", {
                method: "POST",
                headers: {"content-type": "application/json"},
                body: newPriceData
            })

            if (result.ok) {
                const responseMessage = await result.json();
                alert(responseMessage.message);
                populatePriceTable()
            } else {
                const errorMessage = await result.json(); // Get error message from server
                alert(`Error: ${errorMessage.message}`);
            }
        } catch (error) {
            console.error("Failed to send new price data to change position to the database:", error);
            alert("Failed to change the meal price. Please try again.");
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// manager-inventory.html
/**
 * Adds an event listener to the "Order Inventory" button.
 * When the button is clicked, the orderInventory function is called.
 */
const orderInventoryButton = document.getElementById("order-inventory-button");
if (orderInventoryButton) {
    orderInventoryButton.addEventListener("click", orderInventory);
}

/**
 * Retreives all inventory items
 * @returns {Promise<void>}
 */
async function getInventoryData() {
    try {
        let result = await fetch("/inventory", {
            method: "GET",
        });
    
        // Ensure the data was retrieved successfully
        if (result.ok) {
            const inventoryData = await result.json();
            return inventoryData;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get meal data from the server: ", error);
        alert("Failed to get meal data. Please try again.");
    }
}

/**
 * Populates the inventory table with their name and the associated quantities.
 * @returns {Promise<void>}
 */
async function populateInventoryTable() {
    let inventoryData = await getInventoryData();

    if(!inventoryData){
        return;
    }

    const inventoryTable = document.getElementById("inventory-table");
    inventoryTable.innerHTML = "";
    // Creates the row element for the headers and adds it to the table
    let tr = document.createElement("tr");
    inventoryTable.append(tr);

    // Sets the header for the meal price table
    const tableHeaders = ["Item Name", "Amount (lbs)"];
    for (let i = 0; i < 2; ++i) {
        const td = document.createElement("td");
        td.textContent = tableHeaders[i];
        td.className = "bg-red-500 text-white border-2 border-black";
        tr.appendChild(td);
    }

    // Populates a row for each meal with all their data
    inventoryData.forEach(inventory => {
        const inventoryInfo = [inventory.item_name, parseFloat(inventory.amount).toFixed(2)];
        tr = document.createElement("tr");
        tr.id = inventoryInfo.item_name;

        inventoryInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-3/12 border-2 border-black";
            tr.appendChild(td);
        });

        inventoryTable.appendChild(tr);
    });
}

/**
 * Populates the inventory dropdown.
 */
async function populateInventoryDropdown() {
    try {
        const dropdown = document.getElementById('inventory-dropdown');

        dropdown.innerHTML = '';

        const response = await fetch('/inventoryItems');
        const items = await response.json();

        items.forEach(item => {
            const option = document.createElement('option');
            option.textContent = item.item_name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

/**
 * Updates the inventory quantities based on how much the manager is trying to order.
 * @returns {Promise<void>}
 */
async function orderInventory() {
    const item_name = document.getElementById("inventory-dropdown").value;
    const amount = document.getElementById("order-inventory-input").value.trim();
    const amountToOrder = parseFloat(amount);

    // Ensure all inputs are filled
    if (!item_name || !amountToOrder) {
        alert("Please insert an amount of inventory to order.");
        return;
    }
    else if (isNaN(amountToOrder) && !(amountToOrder.toString() === value)) {
        alert("Inserted invalid value for new price. Please try again.");
        return;
    }
    else{
        const orderAmount = [item_name, amountToOrder];

        try {
            const newPriceData = JSON.stringify(orderAmount);
            let result = await fetch("/order-inventory", {
                method: "POST",
                headers: {"content-type": "application/json"},
                body: newPriceData
            })

            // Ensure the post request was successfully
            if (result.ok) {
                const responseMessage = await result.json();
                alert(responseMessage.message);
                populateInventoryTable();
                populateInventoryDropdown();
            } else {
                const errorMessage = await result.json(); // Get error message from server
                alert(`Error: ${errorMessage.message}`);
            }
        } catch (error) {
            console.error("Failed to send new price data to change position to the database:", error);
            alert("Failed to change the meal price. Please try again.");
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// manager-statistics.html
/**
 * Adds an event listener so when the page is loaded, the graph will populate.
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        //Get data from server
        const response = await fetch('/api/sales-data');
        const data = await response.json();

        // Extract labels and sales data
        const labels = data.map(item => item.month);
        const salesData = data.map(item => parseFloat(item.total_sales));

        //Make Chart
        const ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
            datasets: [{
                label: 'Sales (USD)',
                data: salesData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
            },
            options: {
            scales: {
                y: { beginAtZero: true },
            },
            },
        });
    } catch(e) {

    }
});