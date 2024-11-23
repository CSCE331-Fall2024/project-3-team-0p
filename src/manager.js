
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
