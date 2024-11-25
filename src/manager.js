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
        }
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
        }
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

        if (result.ok) {
            const responseMessage = await result.json();
            alert(responseMessage.message);
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to send employee data to change position to the database:", error);
        alert("Failed to change employee position. Please try again.");
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
// manager-meals.html

async function getMenuData() {
    try {
        let result = await fetch("/menuitems", {
            method: "GET",
        });
    
        if (result.ok) {
            const menuData = result.json();  // Missing await
            return menuData;
        } else {
            const errorMessage = await result.json(); 
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get menu data from the server: ", error);
        alert("Failed to get menu data. Please try again.");
    }
}


async function populateMenuTable() {
    let menuData = await getMenuData();

    const menuTable = document.getElementById("menu-table");
    // Creates the row element for the headers and adds it to the table
    let tr = document.createElement("tr");
    menuTable.append(tr);

    // Sets the header for the menu item table
    const tableHeaders = ["Name", "Category", "Ingredient 1", "Ingredient 2", "Ingredient 3"];
    for (let i = 0; i < 5; ++i) {
        const td = document.createElement("td");
        td.textContent = tableHeaders[i];
        td.className = "bg-red-500 text-white border-2 border-black";
        tr.appendChild(td);
    }

    // Populates a row for each menu item with all its data
    menuData.forEach(item => {
        const itemInfo = [item.name, item.category, item.ingredient1, item.ingredient2, item.ingredient3];
        tr = document.createElement("tr");
        tr.id = item.name;

        itemInfo.forEach(info => {
            const td = document.createElement("td");
            td.textContent = info;
            td.className = "w-1/5 border-2 border-black";
            tr.appendChild(td);
        });

        menuTable.appendChild(tr);
    });
}

const addItemButton = document.getElementById("add-menu-item-button");
if (addItemButton) {
    addItemButton.addEventListener("click", addMenuItem);
}

const deleteItemButton = document.getElementById("delete-item-button");
if (deleteItemButton) {
    deleteItemButton.addEventListener("click", deleteMenuItem);
}

async function addMenuItem() {
    const newItem = document.getElementById("add-name-input").value;
    const newIngredient1 = document.getElementById("add-ingredient1-input").value;
    const newIngredient2 = document.getElementById("add-ingredient2-input").value;
    const newIngredient3 = document.getElementById("add-ingredient3-input").value;

    const addItemInfo = [newItem, newIngredient1, newIngredient2, newIngredient3];

    if (!newItem || !newIngredient1 || !newIngredient2 || !newIngredient3) {
        alert("Missing new menu item info. Try again.");
        return;
    } else {
        console.log(newItem, newIngredient1, newIngredient2, newIngredient3);
    }

    try {
        const addItemData = JSON.stringify(addItemInfo);
        let result = await fetch("/add-menu-item", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: addItemData
        });

        if (result.ok) {
            alert("Menu item added!");
        } else {
            const errorMessage = await result.json(); 
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to send menu item data to add to the database:", error);
        alert("Failed to add new menu item. Please try again.");
    }
}

async function deleteMenuItem() {
    const deleteItem = document.getElementById("delete-item-input").value;
    
    if (!deleteItem) {
        alert("Missing item to delete. Try again.");
        return;
    }

    try {
        let result = await fetch("/delete-menu-item", {
            method: "POST",
            headers: {"content-type": "text/plain"},
            body: deleteItem
        });

        if (result.ok) {
            const responseMessage = await result.json();
            alert(responseMessage.message);
        } else {
            const errorMessage = await result.json(); 
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to send menu item data to delete to the database:", error);
        alert("Failed to delete menu item. Please try again.");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

