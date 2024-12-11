//Local Variables for tracking current order in progress
var currentOrder = [["N/A", "N/A", "N/A", "N/A", "N/A"]];
let currentMeal = 0;
let numEntrees = 0;
let numSides = 1;
let selectedEntrees = 0;
let selectedSides = 0;
let orderPrice = 0.0;
let currentPage = window.location.pathname;
let targetLanguage = "null";

//Get varible values from session storage if they exist
targetLanguage = sessionStorage.getItem("language") || "";
numEntrees = parseInt(sessionStorage.getItem("numEntrees")) || 0;
numSides = parseInt(sessionStorage.getItem("numSides"));
selectedSides = parseInt(sessionStorage.getItem("selectedSides")) || 0;
selectedEntrees = parseInt(sessionStorage.getItem("selectedEntrees")) || 0;
orderPrice = parseInt(sessionStorage.getItem("orderPrice")) || 0;
currentPage = currentPage = window.location.pathname;


// Get current order from session storage if it exists
const storedMeal = sessionStorage.getItem("currentOrder");
if (storedMeal) {
    currentOrder = JSON.parse(storedMeal);
    currentMeal = currentOrder.length - 1;
}

// Loads all necessary assets when each page is called.
document.addEventListener("DOMContentLoaded", () => {
    const loadedWindow = window.location.pathname;
    // Populates the pages with the data they needed whenever they are loaded
    if (loadedWindow === "/employee-review.html" || 
        loadedWindow === "/customer-review.html" || 
        loadedWindow === "/customer-displayMeals.html" ){
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
        setMealSizeButtonEmployee();
    } else if (loadedWindow === "/employee-entrees.html") {
        setEntreeButtonEmployee();
    } else if (loadedWindow === "/employee-sides.html") {
        setSideButtonEmployee();
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

// for login page: redirect to correct page after checking the credentials
const loginButton = document.getElementById("login-button");
if (loginButton) {
    loginButton.addEventListener("click", function() {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Send request to the server
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

/**
 * Gets the info (meal name, number of entrees, and number of sides) for each meal size from
 * the server by a get request.
 * @async
 * @function getMealSizeInfo
 * @returns {Promise|null}
 */
async function getMealSizeInfo() {
    try {
        // Sends GET to the server
        let result = await fetch("/meal-size", {
            method: "GET",
        });

        // Ensures the info was retrieved successfully
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

/**
 * Loads image data from the JSON file.
 * @returns {Promise<Array>} An array of objects, each containing the name and image URL of a menu item.
 */
async function loadImageData() {
    try {
        // Fetch the JSON file
        const response = await fetch('images.json');

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Return the JSON data
        return await response.json();
    } catch (error) {
        console.error('Error loading image data:', error);
        console.log('Response:', error.response);
        // Return an empty array if there was an error
        return [];
    }
}

/**
 * Sets the number of needed entrees and sides when the meal size button is selected and
 * stores the meal size into the array storing the order data and navigates to the next page.
 * @function mealSizeButtonClick
 */
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

            // Saving the items for a single session
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

/**
 * Dynamically sets the meal size buttons for the employee interface with
 * the correct name and format. Retrieves the data from requesting it
 * from the server.
 * @async
 * @function setMealSizeButtonEmployee
 */
async function setMealSizeButtonEmployee() {
    // Retrieve the info for the meal size
    let mealSizeNames = await getMealSizeInfo();

    const table = document.getElementById("meal-size-table");
    let tr;

    // Add each meal size as a button dynamically based on the info retrieved
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

        // Make the label for the buttons of the meal sizes with proper capitalization
        button.textContent = mealName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        button.setAttribute('data', button.textContent);
        button.className = "w-5/6 py-16 my-5 bg-red-500 text-white rounded hover:bg-red-600 sizeButton";
        button.addEventListener("click", mealSizeButtonClick);
        
        td.appendChild(button);
        tr.appendChild(td);
    }

    // Translates the page if that is the setting
    if(targetLanguage != "null") {
        translatePage();
    }
}

/**
 * Dynamically sets the meal size buttons with images for the customer interface.
 * Gets the image data from the JSON file and the meal size info from the server.
 * Creates a table with the meal size buttons and images.
 * Redirects to either the entrees page or review page if we finish selecting entrees.
 * @async
 * @function setMealSizeButtonCustomer
 */
async function setMealSizeButtonCustomer() {
    const mealSizeInfo = await getMealSizeInfo();

    const table = document.getElementById("meal-size-table");
    let tr;

    // Fetch image data from JSON file
    const imageData = await loadImageData();
    
    // Add the buttons to the customer interface
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

        // Add the correct image to the buttons
        if (image) {
            const img = document.createElement("img");
            img.src = `./menu_imgs/${image.image}`;
            img.alt = newItemealName;
            img.className = "w-full h-3/4 object-cover mb-2";
            
            // Add the text for what is in the meal (num of entrees and sides)
            const pre = document.createElement('pre');

            if (sideNum == 0) {
                pre.textContent = `${newItemealName}\n${entreeNum} entree`;
            } else if (entreeNum == 0) {
                pre.textContent = `${newItemealName}\n${sideNum} side`;
            } else {
                if (entreeNum == 1) {
                    pre.textContent = `${newItemealName}\n${sideNum} side & ${entreeNum} entree`;
                } else {
                    pre.textContent = `${newItemealName}\n${sideNum} side & ${entreeNum} entrees`;
                }
            }

            pre.className = "mt-2 font-sans whitespace-pre-wrap";
            
            button.appendChild(img);
            button.appendChild(pre);
        } else {
            button.textContent = newItemealName;
        }
        
        td.appendChild(button);
        tr.appendChild(td);
    }

    // Translates the page if that is the setting
    if(targetLanguage != "null") {
        translatePage();
    }
}

/**
 * Retrieves the text for each button from the server by sending a get request.
 * @async
 * @function getEntreeNames
 * @returns {Promist|null} Returns the name of the entrees
 */
async function getEntreeNames() {
    try {
        // Sends GET to the server
        let result = await fetch("/entrees", {
            method: "GET"
        });

        // Ensure the data was retrieved correctly
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

//Asks the server for the total price of the current order and returns it
/**
 * Sends a get request to the server for the total price of the current order.
 * @async
 * @function getOrderPrice
 * @returns {Promise|null} Returns the total order price
 */
async function getOrderPrice() {
    try {
        // Sends GET to the server
        const orderData = JSON.stringify(currentOrder);
        const url = new URL("/get-order-price", window.location.origin);
        url.searchParams.append("orderData", orderData);

        let result = await fetch(url, {
            method: "GET"
        });

        // Ensures the data was retrieved
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

/**
 * When an entree is selected, allows selection of more entrees until the desired number
 * of entrees is met and navigates to the next page.
 * @function entreeButtonClick
 */
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
            } else {
                this.textContent = `${this.getAttribute('data')} (${currentOrder[currentMeal].filter(item => item === buttonText).length})`;
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

/**
 * Dynamically sets all of the entree buttons for the employee interface.
 * @async
 * @function setEntreeButtonEmployee
 */
async function setEntreeButtonEmployee() {
    let entreeNames = await getEntreeNames();

    const table = document.getElementById("entree-table");
    let tr;

    // Adds all the buttons based on the number of entrees
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

/**
 * Creates entree buttons for customer with images
 * Fetches image data from the imageData.json file
 * Adds buttons to the table in the customer-entrees.html page
 * Each button has an image and a text label
 * Button is clicked, it calls the entreeButtonClick function
 * @async
 * @function setEntreeButtonCustomer
 */
async function setEntreeButtonCustomer() {
    let entreeNames = await getEntreeNames();

    const table = document.getElementById("entree-table");
    let tr;

    // Fetch image data from your JSON file
    const imageData = await loadImageData();

    // Adds all the entrees as buttons
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

        // Adds the images of the entree
        if (image) {
            // Create an img element with the image
            const img = document.createElement("img");
            img.src = `./menu_imgs/${image.image}`;
            img.alt = entreeName;
            img.className = "w-full h-3/4 object-cover mb-2";
            
            // Create a new span for text
            const textSpan = document.createElement('span');
            textSpan.textContent = entreeName;
            textSpan.className = "mt-2";
            
            // Change the order of appending
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
/**
 * Sends a get request to the server to retrieve the name of the sides.
 * @async
 * @function getSideNames
 * @returns {Promise|null} Returns the names of the sides as a json object
 */
async function getSideNames() {
    try {
        // Sends GET to the server
        let result = await fetch("/sides", {
            method: "GET"
        });

        // Esnure the data is retrieved
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

/**
 * When a side is selected, stores the side into an array and navigates to the next page.
 * @function sideButtonClick
 */
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

/**
 * Dynamically sets all side buttons for the employee interface.
 * @async
 * @function setSideButtonEmployee
 */
async function setSideButtonEmployee() {
    let sideNames = await getSideNames();

    const table = document.getElementById("side-table");
    let tr;

    // Add all the side buttons
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

/**
 * Creates side buttons for customer with images
 * Fetches image data from the imageData.json file
 * Adds buttons to the table in the customer-sides.html page
 * Each button has an image and a text label
 * Button is clicked, it calls the sideButtonClick function
 * @async
 * @function setSideButtonCustomer
 */
async function setSideButtonCustomer() {
    let sideNames = await getSideNames();

    const table = document.getElementById("side-table");
    let tr;

    // Fetch image data from your JSON file
    const imageData = await loadImageData();

    // Add the side buttons
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
        
        // Find the corresponding image for the current side name
        const image = imageData.find(entry => entry.name === sideName);

        // Add the image to the button
        if (image) {
            // Create an img element with the image
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

/**
 * Retreives the order ID and displays it at the end of the ordering process for the customer interface.
 * @async
 * @function displayOrderID
 */
async function displayOrderID(){
    let results = await fetch("/last-order-id", {
        method: "GET",
    });

    // Ensure the data was retrieved
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

/**
 * Updates the order display on the review page.
 * @async
 * @returns {Promise<void>}
 */
async function updateOrderDisplay() {
    console.log("current order: " + currentOrder);
    const mealDetailsElement = document.getElementById("order-display");
    const orderTotalElement = document.getElementById("total-display");
    const storedOrder = sessionStorage.getItem("currentOrder");
    
    try {
        if (storedOrder) {
            const currentOrder = JSON.parse(storedOrder);
            if(currentPage.includes("displayMeals") || currentPage.includes("customer-entrees") || currentPage.includes("customer-sides")){
                // If the current page is the meal selection or side selection page
                // display the food in the current meal
                let validFood = [];
                currentOrder[currentMeal].forEach(food => {
                    if (food !== "N/A") {
                        prettyFood = food.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                        validFood.push(prettyFood);
                    }
                })
                mealDetailsElement.textContent = validFood.join("\n    ");
            } else if (currentPage.includes("customer-mealsize")){
                // If the current page is the meal size selection page
                // display "No meal selected."
                mealDetailsElement.textContent = "No meal selected.";
            } else{
                // If the current page is the review order page
                // display the food in all the meals
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
            // If the current page is the meal size selection page
            // and there is no stored order
            // display "No meal selected."
            mealDetailsElement.textContent = "No meal selected.";
        }
        else {
            // If the current page is not the meal selection or side selection page
            // and there is no stored order
            // display "No meal selected."
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

/**
 * When an order is cancelled, clears the order and resets it so that a new order can be made. Redirects back to the start page
 * or back to the meal size selection page for cashiers.
 * @function cancelOrder
 */
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
        } else if (loadedWindow.includes("customer")) {
            window.location.href = "index.html";
        }
    }
}

/**
 * Adds an event listener to the "Cancel Order" employee button.
 * When the button is clicked, the cancelOrder function is called.
 */
const cancelButton = document.getElementById("cancel-order-button");
if (cancelButton) {
    cancelButton.addEventListener("click", cancelOrder);
}

/**
 * Adds an event listener to the "Add Order" employee button.
 * When the button is clicked, the addMeal function is called.
 */
const addMealButton = document.getElementById("add-to-order-button");
if (addMealButton) {
    addMealButton.addEventListener("click", addMeal);
}

/**
 * Adds an event listener to the "Place Order" employee button.
 * When the button is clicked, the placeOrder function is called.
 */
const placeOrderButton = document.getElementById("place-order-button");
if (placeOrderButton) {
    placeOrderButton.addEventListener("click", placeOrder);
}

/**
 * Adds an event listener to the "Add Item" employee button.
 * When the button is clicked, the newItem function is called.
 */
const newItemButton = document.getElementById("new-item-button");
if (newItemButton) {
    console.log("adding item");
    newItemButton.addEventListener("click", newItem);
}

/**
 * When an order is placed, submits the order to the database via sending the
 * server a post request.
 * @async
 * @function placeOrder
 */
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

/**
 * When an order is placed, decreases the amount of inventory based on the items in the order.
 * @async
 * @function decreaseInventory
 */
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

/**
 * When a new item is added to the order, sets an array so all items can be filled in.
 * @async
 * @function newItem
 */
async function newItem() {
    // For when you press new item when there is no order placed yet in review page
    if(currentOrder.length != 0){

        if (currentOrder[currentMeal][0] == "N/A") {
            window.location.href = "employee-mealsize.html";
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

/**
 * Removes the most recent meal and navigates to the next page.
 * @function removeMeal
 */
function removeMeal(){
    console.log("current order first: " + currentOrder);
    currentOrder.pop();
    console.log("current order second: " + currentOrder);
    currentMeal --;
    sessionStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    window.location.href = "customer-review.html";
}

/**
 * If no changes are added to the meal, navigate to the next page.
 * @function addMeal
 */
function addMeal(){
    window.location.href = "customer-review.html";
}
