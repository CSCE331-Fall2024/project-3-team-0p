var currentOrder = [];
let currentMeal = ["N/A", "N/A", "N/A", "N/A", "N/A"];
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
currentPage = currentPage = window.location.pathname;

const storedMeal = sessionStorage.getItem("currentMeal");
if (storedMeal) {
    currentMeal = JSON.parse(storedMeal);
}

// for meal size page: gets the text of each button and adds it to the array.
// Also sets the price of the current item and also establishes the number of entrees and sides.
const sizeButtons = document.querySelectorAll(".sizeButton");
sizeButtons.forEach(button =>{
    button.addEventListener("click", function() {
        if(currentMeal[0] != "N/A"){
            alert("You have already selected a meal size. Please proceed with the order.")
        }
        else{
            const buttonText = this.textContent.trim().toLowerCase();
            currentMeal[0] = buttonText;

            if (buttonText.includes("side")) {
                // saving the items for a single session
                sessionStorage.setItem("numEntrees", numEntrees);
                sessionStorage.setItem("numSides", numSides);
                sessionStorage.setItem("selectedEntrees", selectedEntrees);
                sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

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
                sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

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
    });
});

// for entrees page: gets the text of each button and adds it to the array. Allows 1-3 entrees to be selected depending on the type of meal.
// Redirects to either the sides page or review page if we finish selecting entrees.
const entreeButtons = document.querySelectorAll(".entreeButton");
entreeButtons.forEach(button =>{
    button.addEventListener("click", function() {
        if(selectedEntrees >= numEntrees || numEntrees == 0){
            alert("You cannot add any more entrees.")
        }
        else if(currentMeal[0] == "N/A"){
            alert("Please select a meal size first.")
        }
        else{
            const buttonText = this.textContent.trim().toLowerCase();
            selectedEntrees += 1;
            currentMeal[selectedEntrees] = buttonText;
            sessionStorage.setItem("selectedEntrees", selectedEntrees);
            sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

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
    });
});

// for sides page: gets the text of each button and adds it to the array. Allows 0-1 sides depending on the size.
// Redirects to the review order page once finished selecting.
const sideButtons = document.querySelectorAll(".sideButton");
sideButtons.forEach(button =>{
    button.addEventListener("click", function() {
        if(selectedSides >= numSides || numSides == 0){
            alert("You cannot add any more sides.")
        }
        else if(currentMeal[0] == "N/A"){
            alert("Please select a meal size first.")
        }
        else{
            const buttonText = this.textContent.trim().toLowerCase();
            selectedSides += 1;
            currentMeal[4] = buttonText;
            sessionStorage.setItem("selectedSides", selectedSides);
            sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

            if(currentPage.includes("employee")){
                console.log("Redirecting to employee review page");
                window.location.href = "employee-review.html";
            }
            else{
                console.log("Redirecting to customer displayMeal page");
                window.location.href = "customer-displayMeal.html";
            }
        }
    });
});

// for review page: make buttons functional and display order values while also connecting and interacting with the server
// refreshes page and current order when order is placed
document.addEventListener("DOMContentLoaded", () => {
    // Loads the current order after choosing food items
    console.log("made it here 1")
    if (window.location.pathname === "/employee-review.html") {
        updateOrderDisplay();
    }
});

function updateOrderDisplay() {
    const mealDetailsElement = document.getElementById("order-display");
    const storedMeal = sessionStorage.getItem("currentMeal");

    if (storedMeal) {
        const currentMeal = JSON.parse(storedMeal);
        let validFood = [];
        currentMeal.forEach(food => {
            if (food !== "N/A") {
                validFood.push(food);
            }
        })
        mealDetailsElement.textContent = validFood.join(", ");
    } else {
        mealDetailsElement.textContent = "No meal selected.";
    }
}

const cancelButton = document.getElementById("cancel-order-button");
cancelButton.addEventListener("click", cancelOrder);

function cancelOrder() {
    const userConfirmed = confirm("Are you sure you want to proceed?");
    if (userConfirmed) {
        // User clicked "OK"
        // Resets the order and page to nothing
        currentMeal = ["N/A", "N/A", "N/A", "N/A", "N/A"];
        numEntrees = 0;
        numSides = 1;
        selectedEntrees = 0;
        selectedSides = 0;
        currentPrice = 0.0;
        sessionStorage.clear();
        updateOrderDisplay();
    }
}

// Place order into the database
async function placeOrder() {
    const orderData = JSON.stringify(currentMeal);
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
            currentMeal = ["N/A", "N/A", "N/A", "N/A", "N/A"];
            numEntrees = 0;
            numSides = 1;
            selectedEntrees = 0;
            selectedSides = 0;
            currentPrice = 0.0;
            sessionStorage.clear();
            updateOrderDisplay();
        } else {
            const errorMessage = await result.json(); // Get error message from server
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Failed to place order:", error);
        alert("Failed to place order. Please try again.");
    }
}