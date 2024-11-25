// manager-employees.html
async function getEmployeeData() {
    try {
        let result = await fetch("/employees", {
            method: "GET",
        });
    
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

const addEmployeeButton = document.getElementById("add-employee-button");
if (addEmployeeButton) {
    addEmployeeButton.addEventListener("click", addEmployee);
}

const removeEmployeeButton = document.getElementById("remove-employee-button");
if (removeEmployeeButton) {
    removeEmployeeButton.addEventListener("click", removeEmployee);
}

const changeEmployeeButton = document.getElementById("change-employee-button");
if (changeEmployeeButton) {
    changeEmployeeButton.addEventListener("click", changeEmployee);
}

async function addEmployee() {
    const newName = document.getElementById("add-name-input").value;
    const newUsername = document.getElementById("add-username-input").value;
    const newPassword = document.getElementById("add-password-input").value;
    const newPosition = document.getElementById("add-position-drop-down").value;

    const addEmployeeInfo = [newName, newUsername, newPassword, newPosition];

    if (!newName || !newUsername || !newPassword || !newPosition) {
        alert("Missing new employee info. Try again.");
        return;
    } else {
        console.log(newName, newUsername, newPassword, newPosition);
    }

    try {
        const addEmployeeData = JSON.stringify(addEmployeeInfo);
        let result = await fetch("/add-employee", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: addEmployeeData
        });

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

        document.getElementById("add-name-input").value = "";
        document.getElementById("add-username-input").value = "";
        document.getElementById("add-password-input").value = "";
        document.getElementById("add-position-drop-down").value = "";
        
    } catch (error) {
        console.error("Failed to send employee data to add to the database:", error);
        alert("Failed to add new employee. Please try again.");
    }
}

async function removeEmployee() {
    const removeUsername = document.getElementById("remove-username-input").value;
    
    if (!removeUsername) {
        alert("Missing username to remove. Try again.");
        return;
    }

    try {
        let result = await fetch("/remove-employee", {
            method: "POST",
            headers: {"content-type": "text/plain"},
            body: removeUsername
        });

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

        document.getElementById("remove-username-input").value = "";

    } catch (error) {
        console.error("Failed to send employee data to remove to the database:", error);
        alert("Failed to remove employee. Please try again.");
    }
}

async function changeEmployee() {
    const username = document.getElementById("change-username-input").value;
    const changedPosition = document.getElementById("change-position-drop-down").value;

    if (!username || !changedPosition) {
        alert("Missing username to remove. Try again.");
        return;
    }

    const changeEmployeePosition = [username, changedPosition];

    try {
        const employeeData = JSON.stringify(changeEmployeePosition);
        let result = await fetch("/change-employee-position", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: employeeData
        })

        const responseData = await result.json();
        const responseMessage = responseData.message;
        if (result.ok) {
            alert(responseMessage);

            if (responseMessage === "Employee not found.") {
                return;
            }
        } else {
            // const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${responseMessage}`);
            return;
        }

        // Update the table display
        const tr = document.getElementById(username);
        tr.querySelectorAll('td')[3].textContent = changedPosition;

        document.getElementById("change-username-input").value = "";
        document.getElementById("change-position-drop-down").value = "";

    } catch (error) {
        console.error("Failed to send employee data to change position to the database:", error);
        alert("Failed to change employee position. Please try again.");
    }
}

// Manage Meal Prices Page
const changePriceButton = document.getElementById("change-price-button");
if (changePriceButton) {
    changePriceButton.addEventListener("click", changePrice);
}

// gets all of the meal sizes and their prices to populate the price table
async function getMealPriceData() {
    try {
        let result = await fetch("/prices", {
            method: "GET",
        });
    
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

// updates the price table
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

// changes the price of the selected meal size based on what the user inputs.
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

// Manage inventory page
const orderInventoryButton = document.getElementById("order-inventory-button");
if (orderInventoryButton) {
    orderInventoryButton.addEventListener("click", orderInventory);
}

// gets all of the inventory data to populate the inventory table with
async function getInventoryData() {
    try {
        let result = await fetch("/inventory", {
            method: "GET",
        });
    
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

// updates the inventory table
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

// updates the inventory dropdown
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

// updates the amount of inventory based on the amount of inventory the user is trying to order
async function orderInventory() {
    const item_name = document.getElementById("inventory-dropdown").value;
    const amount = document.getElementById("order-inventory-input").value.trim();
    const amountToOrder = parseFloat(amount);

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