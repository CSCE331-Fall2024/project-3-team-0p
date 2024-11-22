
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
        console.log(person);
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

