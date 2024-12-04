var currentOrder = [["N/A", "N/A", "N/A", "N/A", "N/A"]];
let currentMeal = 0;
let numEntrees = 0;
let numSides = 1;
let selectedEntrees = 0;
let selectedSides = 0;
let orderPrice = 0.0;
let currentPage = window.location.pathname;
let targetLanguage = "null";

targetLanguage = sessionStorage.getItem("language") || "";
numEntrees = parseInt(sessionStorage.getItem("numEntrees")) || 0;
numSides = parseInt(sessionStorage.getItem("numSides"));
selectedSides = parseInt(sessionStorage.getItem("selectedSides")) || 0;
selectedEntrees = parseInt(sessionStorage.getItem("selectedEntrees")) || 0;
orderPrice = parseInt(sessionStorage.getItem("orderPrice")) || 0;
currentPage = currentPage = window.location.pathname;


const storedMeal = sessionStorage.getItem("currentOrder");
if (storedMeal) {
    currentOrder = JSON.parse(storedMeal);
    currentMeal = currentOrder.length - 1;
}

document.addEventListener("DOMContentLoaded", () => {
    const loadedWindow = window.location.pathname;
    // Loads the current order after choosing food items
    if (loadedWindow === "/employee-review.html" || loadedWindow === "/customer-review.html" || loadedWindow === "/customer-displayMeals.html" ){
        updateOrderDisplay();
    } else if (loadedWindow === "/customer-mealsize.html"){
        updateOrderDisplay();
        setMealSizeButtonCustomer();
    } else if (loadedWindow === "/customer-entrees.html") {
        updateOrderDisplay();
        setEntreeButtonCustomer();
    } else if (loadedWindow === "/customer-sides.html"){
        updateOrderDisplay();
        setSideButtonCustomer();
    } else if (loadedWindow === "/employee-mealsize.html") {
        setMealSizeButton();
    } else if (loadedWindow === "/employee-entrees.html") {
        setEntreeButton();
    } else if (loadedWindow === "/employee-sides.html") {
        setSideButton();
    } else if (loadedWindow === "/customer-orderConfirmation.html") {
        displayOrderID();
    } else if (loadedWindow === "/manager-employees.html") {
        populateEmployeeTable();
    } else if (loadedWindow === "/manager-meals.html") {
        populateMenuTable();
    } else if(loadedWindow === "/manager-prices.html") {
        populatePriceTable();
    } else if(loadedWindow ==="/manager-inventory.html"){
        populateInventoryTable();
        populateInventoryDropdown()
    } else {
        if(targetLanguage != "null") {
            translatePage();
        }
    }
});

// for login page: redirect to correct page
const loginButton = document.getElementById("login-button");

if (loginButton) {
    loginButton.addEventListener("click", function() {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const username = usernameInput.value;
        const password = passwordInput.value;

        fetch("/login", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })

        .then(response => response.json())

        .then(data => {
            if (data.success) {
                if (data.position === "Manager") {
                    window.location.href = "manager-statistics.html";
                } else if (data.position === "Cashier") {
                    window.location.href = "employee-mealsize.html";
                }
            } else {
                alert(data.message);
            }
        })

        .catch(error => {
            console.error("Login error:", error);
            alert("An error occurred during login");
        });
    });
}

// for meal size page: gets the text of each button and adds it to the array.
// Also sets the price of the current item and also establishes the number of entrees and sides.
async function getMealSizeInfo() {
    try {
        // Sends GET to the server
        let result = await fetch("/meal-size", {
            method: "GET",
        });

        if (result.ok) {
            const mealSizeNames = await result.json();
            console.log(mealSizeNames);
            return mealSizeNames;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get meal size names from the server: ", error);
        alert("Failed to get the meal size names. Please try again.");
    }
}

//loading image data
async function loadImageData() {
    try {
        const response = await fetch('images.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading image data:', error);
        console.log('Response:', error.response);
        return [];
    }
  }

function mealSizeButtonClick() {
    if(currentOrder[currentMeal][0] != "N/A"){
        alert("You have already selected a meal size. Please proceed with the order.")
    }
    else{
        const buttonText = this.getAttribute('data').trim().toLowerCase();
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
            if(buttonText.toLowerCase().includes("bowl")){
                numEntrees = 1;
            }
            else if(buttonText.toLowerCase().includes("bigger")){
                numEntrees = 3;
            }
            else if(buttonText.toLowerCase().includes("plate")){
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

// For the cashier interface: Dynamically sets the meal size buttons.
async function setMealSizeButton() {
    let mealSizeNames = await getMealSizeInfo();

    const table = document.getElementById("meal-size-table");
    let tr;

    for (let i = 0; i < mealSizeNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const td = document.createElement("td");
        td.className = "w-1/3";
        const button = document.createElement("button");
    
        const mealName = mealSizeNames[i].mealname;
        button.textContent = mealName;
        // Made the label for the buttons for meal sizes with capitalized words
        button.textContent = mealName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        button.setAttribute('data', button.textContent);
        button.className = "w-5/6 py-16 my-5 bg-red-500 text-white rounded hover:bg-red-600 sizeButton";
        button.addEventListener("click", mealSizeButtonClick);
        
        td.appendChild(button);
        tr.appendChild(td);
    }
    if(targetLanguage != "null") {
        translatePage();
    }
}

// For the customer interface: Dynamically sets the meal size buttons and images.
async function setMealSizeButtonCustomer() {
    let mealSizeInfo = await getMealSizeInfo();

    const table = document.getElementById("meal-size-table");
    let tr;

    // Fetch image data from JSON file
    const imageData = await loadImageData();
    
    for (let i = 0; i < mealSizeInfo.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const td = document.createElement("td");
        td.className = "w-1/3";
        const button = document.createElement("button");
    
        const mealName = mealSizeInfo[i].mealname;
        const entreeNum = mealSizeInfo[i].numberofentrees;
        const sideNum = mealSizeInfo[i].numberofsides;

        // Made the label for the buttons for meal sizes with capitalized words
        const newItemealName = mealName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        button.setAttribute('data', newItemealName);
        button.className = "w-5/6 py-16 my-5 bg-red-500 text-white rounded hover:bg-red-600 sizeButton";
        button.addEventListener("click", mealSizeButtonClick);
        
        // Find the corresponding image for the current meal name
        const image = imageData.find(entry => entry.name === mealName);

        if (image) {
            const img = document.createElement("img");
            img.src = `./menu_imgs/${image.image}`;
            img.alt = newItemealName;
            img.className = "w-full h-3/4 object-cover mb-2";
            
            const textSpan = document.createElement('span');
            // textSpan.textContent = `${newItemealName}\n${entreeNum}&${sideNum}`;

            if (sideNum == 0) {
                textSpan.innerHTML = `${newItemealName}<br>${entreeNum} entree`;
            } else if (entreeNum == 0) {
                textSpan.innerHTML = `${newItemealName}<br>${sideNum} side`;
            } else {
                if (entreeNum == 1) {
                    textSpan.innerHTML = `${newItemealName}<br>${sideNum} side & ${entreeNum} entree`;
                } else {
                    textSpan.innerHTML = `${newItemealName}<br>${sideNum} side & ${entreeNum} entrees`;
                }
            }

            textSpan.className = "mt-2";
            
            button.appendChild(img);
            button.appendChild(textSpan);
        } else {
            button.textContent = newItemealName;
        }
        
        td.appendChild(button);
        tr.appendChild(td);
    }

    if(targetLanguage != "null") {
        translatePage();
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
        console.error("Failed to get entree names from the database: ", error);
        alert("Failed to get entree names. Please try again.");
    }
}

//
async function getOrderPrice() {
    try {
        // Sends GET to the server
        const orderData = JSON.stringify(currentOrder);
        const url = new URL("/get-order-price", window.location.origin);
        url.searchParams.append("orderData", orderData);

        let result = await fetch(url, {
            method: "GET"
        });

        if (result.ok) {
            const price = await result.json();
            return price;
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to get price: ", error);
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
        const buttonText = this.getAttribute('data').trim().toLowerCase();
        selectedEntrees += 1;
        currentOrder[currentMeal][selectedEntrees] = buttonText;
        sessionStorage.setItem("selectedEntrees", selectedEntrees);
        sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));
        //add item to review order
        if (selectedEntrees < numEntrees){
            if(currentPage.includes("customer")){
                updateOrderDisplay();
            }
        }
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
//entree buttons for cashier
async function setEntreeButton() {
    let entreeNames = await getEntreeNames();

    const table = document.getElementById("entree-table");
    let tr;

    for (let i = 0; i < entreeNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const td = document.createElement("td");
        td.className = "w-1/3"
        const button = document.createElement("button");
    
        const entreeName = entreeNames[i];
        button.textContent = entreeName;
        button.setAttribute('data', button.textContent);
        button.className = "w-5/6 py-16 bg-red-500 text-white rounded hover:bg-red-600 entreeButton";
        button.addEventListener("click", entreeButtonClick);
        
        td.appendChild(button);
        tr.appendChild(td);
    }
    if(targetLanguage != "null") {
        translatePage();
    }
}

//entree buttons for customer with images
async function setEntreeButtonCustomer() {
    let entreeNames = await getEntreeNames();

    const table = document.getElementById("entree-table");
    let tr;

    // Fetch image data from your JSON file
    const imageData = await loadImageData();

    for (let i = 0; i < entreeNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const td = document.createElement("td");
        td.className = "w-1/3"
        const button = document.createElement("button");
    
        const entreeName = entreeNames[i];
        button.setAttribute('data', entreeName);
        button.className = "w-5/6 py-16 bg-red-500 text-white rounded hover:bg-red-600 entreeButton";
        button.addEventListener("click", entreeButtonClick);
        
        const image = imageData.find(entry => entry.name === entreeName);

        if (image) {
            const img = document.createElement("img");
            img.src = `./menu_imgs/${image.image}`;
            img.alt = entreeName;
            img.className = "w-full h-3/4 object-cover mb-2";
            
            // Created a new span for text
            const textSpan = document.createElement('span');
            textSpan.textContent = entreeName;
            textSpan.className = "mt-2";
            
            // Changed the order of appending
            button.appendChild(img);
            button.appendChild(textSpan);
        } else {
            // If no image, just set the text content
            button.textContent = entreeName;
        }
        
        td.appendChild(button);
        tr.appendChild(td);
    }
        
    if(targetLanguage != "null") {
        translatePage();
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
        console.error("Failed to get side names from the database: ", error);
        alert("Failed to get side names. Please try again.");
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
        const buttonText = this.getAttribute('data').trim().toLowerCase();
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
//side buttons for cashier 
async function setSideButton() {
    let sideNames = await getSideNames();

    const table = document.getElementById("side-table");
    let tr;

    for (let i = 0; i < sideNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const td = document.createElement("td");
        td.className = "w-1/3";
        const button = document.createElement("button");
    
        const sideName = sideNames[i];
        button.textContent = sideName;
        button.setAttribute('data', button.textContent);
        button.className = "w-5/6 py-16 my-5 bg-red-500 text-white rounded hover:bg-red-600 entreeButton";
        button.addEventListener("click", sideButtonClick);
        
        td.appendChild(button);
        tr.appendChild(td);
    }
    if(targetLanguage != "null") {
        translatePage();
    }
}

//side buttons for customer with images
async function setSideButtonCustomer() {
    let sideNames = await getSideNames();

    const table = document.getElementById("side-table");
    let tr;

    // Fetch image data from your JSON file
    const imageData = await loadImageData();

    for (let i = 0; i < sideNames.length; ++i) {
        if (i % 3 === 0) {
            tr = document.createElement("tr");
            table.appendChild(tr);
        }

        const td = document.createElement("td");
        td.className = "w-1/3";
        const button = document.createElement("button");
    
        const sideName = sideNames[i];
        button.setAttribute('data', sideName);
        button.className = "w-5/6 py-16 my-5 bg-red-500 text-white rounded hover:bg-red-600 entreeButton";
        button.addEventListener("click", sideButtonClick);
        
        const image = imageData.find(entry => entry.name === sideName);

        if (image) {
            const img = document.createElement("img");
            img.src = `./menu_imgs/${image.image}`;
            img.alt = sideName;
            img.className = "w-full h-3/4 object-cover mb-2";
            
            // Created a new span for text
            const textSpan = document.createElement('span');
            textSpan.textContent = sideName;
            textSpan.className = "mt-2";
            
            // Changed the order of appending
            button.appendChild(img);
            button.appendChild(textSpan);
        } else {
            // If no image, just set the text content
            button.textContent = sideName;
        }
        
        td.appendChild(button);
        tr.appendChild(td);
    }
    if(targetLanguage != "null") {
        translatePage();
    }
}

// gets the order id and displays it for the customer interface
async function displayOrderID(){
    let results = await fetch("/last-order-id", {
        method: "GET",
    });
    if (results.ok) {
        const data = await results.json();
        const orderID = data.order_id;
        const orderIDText = document.getElementById("order-id");
        orderIDText.textContent = orderID;

    } else {
        const errorMessage = await results.json();
        alert(`Error: ${errorMessage.message}`);
    }

    if(targetLanguage != "null") {
        translatePage();
    }
}

// for review page: make buttons functional and display order values while also connecting and interacting with the server
// refreshes page and current order when order is placed
async function updateOrderDisplay() {
    console.log("current order: " + currentOrder);
    const mealDetailsElement = document.getElementById("order-display");
    const orderTotalElement = document.getElementById("total-display");
    const storedOrder = sessionStorage.getItem("currentOrder");
    
    try {
        if (storedOrder) {
            const currentOrder = JSON.parse(storedOrder);
            if(currentPage.includes("displayMeals") || currentPage.includes("customer-entrees") || currentPage.includes("customer-sides")){
                let validFood = [];
                currentOrder[currentMeal].forEach(food => {
                    if (food !== "N/A") {
                        prettyFood = food.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                        validFood.push(prettyFood);
                    }
                })
                mealDetailsElement.textContent = validFood.join("\n    ");
            } else if (currentPage.includes("customer-mealsize")){
                mealDetailsElement.textContent = "No meal selected.";
            } else{
                let prettyOrder = [];
                currentOrder.forEach(meal => {
                    let validFood = [];
                    meal.forEach(food => {
                        if (food !== "N/A") {
                            prettyFood = food.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                            validFood.push(prettyFood);
                        }
                    })
                    prettyOrder.push(validFood.join("\n    "));
                })
                mealDetailsElement.textContent = prettyOrder.join("\n"); 
                gottenPrice = await getOrderPrice();
                orderTotalElement.textContent = "Order Total: $" + gottenPrice.toFixed(2);
            }
        } else if (currentPage.includes("customer-mealsize")){
            mealDetailsElement.textContent = "No meal selected.";
        }
        else {
            mealDetailsElement.textContent = "No meal selected.";
            orderTotalElement.textContent = "Order Total: $0.00";
        }
    } catch(e) {
        console.error("Error displaying the order: ", e);
        alert("Error displaying the order.");
    }
    if(targetLanguage != "null") {
        translatePage();
    }
}
function cancelOrder() {
    console.log("cancelling order");
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
        orderPrice = 0.0;
        sessionStorage.clear();

        // Redirection once order is canceled
        const loadedWindow = window.location.pathname;
        console.log(loadedWindow);
        if (loadedWindow == "/employee-review.html") {
            window.location.href = "/employee-mealsize.html";
        } else if (loadedWindow == "/customer-review.html") {
            window.location.href = "index.html";
        }
    }
}

const cancelButton = document.getElementById("cancel-order-button");
if (cancelButton) {
    cancelButton.addEventListener("click", cancelOrder);
}

const removeMealButton = document.getElementById("remove-meal-button");
// console.log(removeMealButton);
// removeMealButton.addEventListener("click", removeMeal);

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
            decreaseInventory();
            // Resets the order and page to nothing
            currentOrder = [["N/A", "N/A", "N/A", "N/A", "N/A"]];
            currentMeal = 0;
            numEntrees = 0;
            numSides = 1;
            selectedEntrees = 0;
            selectedSides = 0;
            orderPrice = 0.0;
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
        console.error("Failed to place order in the database:", error);
        alert("Failed to place order. Please try again.");
    }
}

async function decreaseInventory(){
    const orderData = JSON.stringify(currentOrder);
    console.log("Order inventory to decrease:", orderData);

    try {
        // Sends POST to the server
        let result = await fetch("/decrease-inventory", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: orderData
        });

        if (result.ok) {
            alert("Decreased inventory")
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
            console.error("Failed to decrease inventory:", error);
            alert("Failed to decrease inventory. Please try again.");
    }
}


const newItemButton = document.getElementById("new-item-button");
if (newItemButton) {
    console.log("adding item");
    newItemButton.addEventListener("click", newItem);
}

//save current meal into order and start new meal
function newItem() {
    // For when you press new item when there is no order placed yet in review page
    if(currentOrder.length != 0){

        if (currentOrder[currentMeal][0] == "N/A") {
            window.location.href = "employee-mealsize.html";
            return;
        }

    }

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
    console.log("current order first: " + currentOrder);
    currentOrder.pop();
    console.log("current order second: " + currentOrder);
    currentMeal --;
    sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    window.location.href = "customer-review.html";
}

function addMeal(){
    window.location.href = "customer-review.html";
}
