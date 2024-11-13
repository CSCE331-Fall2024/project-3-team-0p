var currentOrder = [["N/A", "N/A", "N/A", "N/A", "N/A"]];
let currentMeal = 0;
let numEntrees = 0;
let numSides = 1;
let selectedEntrees = 0;
let selectedSides = 0;
let currentPrice = 0.0;
let currentPage = window.location.pathname;

numEntrees = parseInt(sessionStorage.getItem("numEntrees")) || 0;
numSides = parseInt(sessionStorage.getItem("numSides"));
selectedSides = parseInt(sessionStorage.getItem("selectedSides")) || 0;
selectedEntrees = parseInt(sessionStorage.getItem("selectedEntrees")) || 0;
currentPage = window.location.pathname;

const storedMeal = sessionStorage.getItem("currentOrder");
if (storedMeal) {
    currentOrder = JSON.parse(storedMeal);
    currentMeal = currentOrder.length - 1;
}

document.addEventListener("DOMContentLoaded", () => {
    const loadedWindow = window.location.pathname;
    // Loads the current order after choosing food items
    if (loadedWindow === "/employee-review.html" || loadedWindow === "/customer-review.html" || loadedWindow === "/customer-displayMeals.html") {
        updateOrderDisplay();
    } else if (loadedWindow === "/employee-mealsize.html" || loadedWindow === "/customer-mealsize.html") {
        setMealSizeButtons();
    } else if (loadedWindow === "/employee-entrees.html" || loadedWindow === "/customer-entrees.html") {
        setEntreeButton();
    } else if (loadedWindow === "/employee-sides.html" || loadedWindow === "/customer-sides.html") {
        setSideButton();
    }
});

// for login page: redirect to correct page
const loginButton = document.getElementById("login-button");
if (loginButton) {
    loginButton.addEventListener("click", function() {
        window.location.href = "employee-mealsize.html";
    });
}


// for meal size page: gets the text of each button and adds it to the array.
// Also sets the price of the current item and also establishes the number of entrees and sides.
async function getMealSizeNames() {
    try {
        // Sends GET to the server
        let result = await fetch("/meal-size", {
            method: "GET",
        });

        if (result.ok) {
            const mealSizeNames = await result.json();
            return mealSizeNames;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to place order:", error);
        alert("Failed to place order. Please try again.");
    }
}

function mealSizeButtonClick() {
    if(currentOrder[currentMeal][0] != "N/A"){
        alert("You have already selected a meal size. Please proceed with the order.")
    }
    else{
        const buttonText = this.textContent.trim().toLowerCase();
        currentOrder[currentMeal][0] = buttonText;

        if (buttonText.includes("side")) {
            // saving the items for a single session
            sessionStorage.setItem("numEntrees", numEntrees);
            sessionStorage.setItem("numSides", numSides);
            sessionStorage.setItem("selectedEntrees", selectedEntrees);
            sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));

            if(currentPage.includes("employee")){
                console.log("Redirecting to employee sides page");
                window.location.href = "employee-sides.html";
            }
            else{
                console.log("Redirecting to customer sides page");
                window.location.href = "customer-sides.html";
            }
        }
        else {
            if(buttonText.includes("bowl")){
                numEntrees = 1;
            }
            else if(buttonText.includes("bigger")){
                numEntrees = 3;
            }
            else if(buttonText.includes("plate")){
                numEntrees = 2;
            }
            else{
                numEntrees = 1;
                numSides = 0;
            }
            // saving the items for a single session
            sessionStorage.setItem("numEntrees", numEntrees);
            sessionStorage.setItem("numSides", numSides);
            sessionStorage.setItem("selectedEntrees", selectedEntrees);
            sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));

            if(currentPage.includes("employee")){
                console.log("Redirecting to employee entrees page");
                window.location.href = "employee-entrees.html";
            }
            else{
                console.log("Redirecting to customer entrees page");
                window.location.href = "customer-entrees.html";
            }
        }
    }
}

// For the customer/cashier interface: Dynamically sets the meal size buttons.
async function setMealSizeButtons() {
    let mealSizeNames = await getMealSizeNames();

    const table = document.getElementById("meal-size-table");
    let tr;

    for (let i = 0; i < mealSizeNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const dt = document.createElement("td");
        const button = document.createElement("button");
    
        const mealName = mealSizeNames[i].mealname;
        button.textContent = mealName;
        button.className = "w-5/6 py-16 bg-red-500 text-white rounded hover:bg-red-600 sizeButton";
        button.addEventListener("click", mealSizeButtonClick);
        
        dt.appendChild(button);
        tr.appendChild(dt);
    }
}

// for entrees page: gets the text of each button and adds it to the array. Allows 1-3 entrees to be selected depending on the type of meal.
// Redirects to either the sides page or review page if we finish selecting entrees.
async function getEntreeNames() {
    try {
        // Sends GET to the server
        let result = await fetch("/entrees", {
            method: "GET"
        });

        if (result.ok) {
            const entreeNames = await result.json();
            return entreeNames;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to place order:", error);
        alert("Failed to place order. Please try again.");
    }
}

function entreeButtonClick() {
    if(selectedEntrees >= numEntrees || numEntrees == 0){
        alert("You cannot add any more entrees.")
    }
    else if(currentOrder[currentMeal][0] == "N/A"){
        alert("Please select a meal size first.")
    }
    else{
        const buttonText = this.textContent.trim().toLowerCase();
        selectedEntrees += 1;
        currentOrder[currentMeal][selectedEntrees] = buttonText;
        sessionStorage.setItem("selectedEntrees", selectedEntrees);
        sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));

        if(numSides != 0 && selectedEntrees == numEntrees){
            if(currentPage.includes("employee")){
                console.log("Redirecting to employee sides page");
                window.location.href = "employee-sides.html";
            }
            else{
                console.log("Redirecting to customer sides page");
                window.location.href = "customer-sides.html";
            }
        }
        else if(numSides == 0 && selectedEntrees == numEntrees){
            if(currentPage.includes("employee")){
                console.log("Redirecting to employee review page");
                window.location.href = "employee-review.html";
            }
            else{
                console.log("Redirecting to customer display meal page");
                window.location.href = "customer-displayMeals.html";
            }
        }
    }
}

async function setEntreeButton() {
    let entreeNames = await getEntreeNames();

    const table = document.getElementById("entree-table");
    let tr;

    for (let i = 0; i < entreeNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const dt = document.createElement("td");
        const button = document.createElement("button");
    
        const entreeName = entreeNames[i];
        button.textContent = entreeName;
        button.className = "w-5/6 py-16 bg-red-500 text-white rounded hover:bg-red-600 entreeButton";
        button.addEventListener("click", entreeButtonClick);
        
        dt.appendChild(button);
        tr.appendChild(dt);
    }
}

// for sides page: gets the text of each button and adds it to the array. Allows 0-1 sides depending on the size.
// Redirects to the review order page once finished selecting.
async function getSideNames() {
    try {
        // Sends GET to the server
        let result = await fetch("/sides", {
            method: "GET"
        });

        if (result.ok) {
            const sideNames = await result.json();
            return sideNames;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to place order:", error);
        alert("Failed to place order. Please try again.");
    }
}

function sideButtonClick() {
    if(selectedSides >= numSides || numSides == 0){
        alert("You cannot add any more sides.")
    }
    else if(currentOrder[currentMeal][0] == "N/A"){
        alert("Please select a meal size first.")
    }
    else{
        const buttonText = this.textContent.trim().toLowerCase();
        selectedSides += 1;
        currentOrder[currentMeal][4] = buttonText;
        sessionStorage.setItem("selectedSides", selectedSides);
        sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));

        if(currentPage.includes("employee")){
            console.log("Redirecting to employee review page");
            window.location.href = "employee-review.html";
        }
        else{
            console.log("Redirecting to customer displayMeal page");
            window.location.href = "customer-displayMeals.html";
        }
    }
}

async function setSideButton() {
    let sideNames = await getSideNames();

    const table = document.getElementById("side-table");
    let tr;

    for (let i = 0; i < sideNames.length; ++i) {
        if (i % 4 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const dt = document.createElement("td");
        const button = document.createElement("button");
    
        const sideName = sideNames[i];
        button.textContent = sideName;
        button.className = "w-5/6 py-16 bg-red-500 text-white rounded hover:bg-red-600 entreeButton";
        button.addEventListener("click", sideButtonClick);
        
        dt.appendChild(button);
        tr.appendChild(dt);
    }
}

// gets the order id and displays it for the customer interface

async function getOrderID(){
    let orderID = 0;
    
}

// for review page: make buttons functional and display order values while also connecting and interacting with the server
// refreshes page and current order when order is placed
function updateOrderDisplay() {
    const mealDetailsElement = document.getElementById("order-display");
    const storedOrder = sessionStorage.getItem("currentOrder");

    if (storedOrder) {
        const currentOrder = JSON.parse(storedOrder);
        if(currentPage.includes("displayMeals")){
            let validFood = [];
            currentOrder[currentMeal].forEach(food => {
                if (food !== "N/A") {
                    validFood.push(food);
                }
            })
            mealDetailsElement.textContent = validFood.join("\n    ");
        }
        else{
            let prettyOrder = [];
            currentOrder.forEach(meal => {
                let validFood = [];
                meal.forEach(food => {
                    if (food !== "N/A") {
                        validFood.push(food);
                    }
                })
                prettyOrder.push(validFood.join("\n    "));
            })
            mealDetailsElement.textContent = prettyOrder.join("\n"); 

        }
    } else {
        mealDetailsElement.textContent = "No meal selected.";
    }
}

function cancelOrder() {
    const userConfirmed = confirm("Are you sure you want to proceed?");
    if (userConfirmed) {
        // User clicked "OK"
        // Resets the order and page to nothing
        currentOrder = [["N/A", "N/A", "N/A", "N/A", "N/A"]];
        currentMeal = 0;
        numEntrees = 0;
        numSides = 1;
        selectedEntrees = 0;
        selectedSides = 0;
        currentPrice = 0.0;
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}

const cancelButton = document.getElementById("cancel-order-button");
if (cancelButton) {
    cancelButton.addEventListener("click", cancelOrder);
}

const removeMealButton = document.getElementById("remove-meal-button");
if (removeMealButton) {
    removeMealButton.addEventListener("click", removeMeal);
}

const addMealButton = document.getElementById("add-to-order-button");
if (addMealButton) {
    addMealButton.addEventListener("click", addMeal);
}

// Place order into the database
const placeOrderButton = document.getElementById("place-order-button");
if (placeOrderButton) {
    placeOrderButton.addEventListener("click", placeOrder);
}

async function placeOrder() {
    const orderData = JSON.stringify(currentOrder);
    console.log("Order data being sent:", orderData);
    try {
        // Sends POST to the server
        let result = await fetch("/submit", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: orderData
        });

        if (result.ok) {
            alert("Order Placed!")
            // Resets the order and page to nothing
            currentOrder = [["N/A", "N/A", "N/A", "N/A", "N/A"]];
            currentMeal = 0;
            numEntrees = 0;
            numSides = 1;
            selectedEntrees = 0;
            selectedSides = 0;
            currentPrice = 0.0;
            sessionStorage.clear();
            updateOrderDisplay();
            if(currentPage.includes("customer")){
                window.location.href = "/customer-orderConfirmation.html";
            }
            else{
                window.location.href = "/employee-mealsize.html";
            }
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to place order:", error);
        alert("Failed to place order. Please try again.");
    }
}

const newItemButton = document.getElementById("new-item-button");
if (newItemButton) {
    console.log("adding item");
    newItemButton.addEventListener("click", newItem);
}

//save current meal into order and start new meal
function newItem() {
    currentOrder.push(["N/A", "N/A", "N/A", "N/A", "N/A"]);
    numEntrees = 0;
    numSides = 1;
    selectedEntrees = 0;
    selectedSides = 0;
    sessionStorage.setItem("numEntrees", numEntrees);
    sessionStorage.setItem("numSides", numSides);
    sessionStorage.setItem("selectedEntrees", selectedEntrees);
    sessionStorage.setItem("selectedSides", selectedSides);
    sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    if(currentPage.includes("employee")){
        window.location.href = "employee-mealsize.html";
    }
    else{
        window.location.href = "customer-mealsize.html";
    }
}

function removeMeal(){
    currentOrder.pop();
    if(currentOrder.length == 1){
        newItem();
    }
    currentMeal --;
    window.location.href = "customer-review.html";
}

function addMeal(){
    window.location.href = "customer-review.html";
}