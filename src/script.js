var currentOrder = [];
let currentMeal = ["N/A", "N/A", "N/A", "N/A", "N/A"];
let numEntrees = 0;
let numSides = 1;
let selectedEntrees = 0;
let selectedSides = 0;
let currentPrice = 0.0;

numEntrees = parseInt(sessionStorage.getItem("numEntrees")) || 0;
numSides = parseInt(sessionStorage.getItem("numSides"));
selectedSides = parseInt(sessionStorage.getItem("selectedSides")) || 0;
selectedEntrees = parseInt(sessionStorage.getItem("selectedEntrees")) || 0;

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
            const buttonText = this.textContent.toLowerCase();
            currentMeal[0] = buttonText;

            if (buttonText.includes("side")) {
                // saving the items for a single session
                sessionStorage.setItem("numEntrees", numEntrees);
                sessionStorage.setItem("numSides", numSides);
                sessionStorage.setItem("selectedEntrees", selectedEntrees);
                sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

                console.log("Redirecting to sides page");
                window.location.href = "employee-sides.html";
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

                console.log("Redirecting to entrees page");
                window.location.href = "employee-entrees.html";
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
            const buttonText = this.textContent.toLowerCase();
            selectedEntrees += 1;
            currentMeal[selectedEntrees] = buttonText;
            sessionStorage.setItem("selectedEntrees", selectedEntrees);
            sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

            if(numSides != 0 && selectedEntrees == numEntrees){
                console.log("Redirecting to sides page");
                window.location.href = "employee-sides.html";
            }
            else if(numSides == 0 && selectedEntrees == numEntrees){
                console.log("Redirecting to review order page");
                window.location.href = "employee-review.html";
            }
        }
    });
});

// for entrees page: gets the text of each button and adds it to the array. Allows 1-3 entrees to be selected depending on the type of meal.
// Redirects to either the sides page or review page if we finish selecting entrees.
const sideButtons = document.querySelectorAll(".sideButton");
sideButtons.forEach(button =>{
    button.addEventListener("click", function() {
        alert("miao")
        if(selectedSides >= numSides || numSides == 0){
            alert("You cannot add any more sides.")
        }
        else if(currentMeal[0] == "N/A"){
            alert("Please select a meal size first.")
        }
        else{
            const buttonText = this.textContent.toLowerCase();
            selectedSides += 1;
            currentMeal[4] = buttonText;
            sessionStorage.setItem("selectedSides", selectedSides);
            sessionStorage.setItem("currentMeal", JSON.stringify(currentMeal));

            console.log("Redirecting to review order page");
            window.location.href = "employee-review.html";
        }
    });
});