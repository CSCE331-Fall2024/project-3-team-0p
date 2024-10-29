var currentOrder = [];

let currentPrice = 0.0;

// for meal size page: gets the text of each button and adds it to the array.
const buttons = document.querySelectorAll(".sizeButton");
buttons.forEach(button =>{
    button.addEventListener("click", function() {
        const buttonText = this.textContent.toLowerCase();

        if (buttonText.includes("side")) {
            console.log("Redirecting to sides page");
            window.location.href = "employee-sides.html";
        } else {
            console.log("Redirecting to entrees page");
            window.location.href = "employee-entrees.html";
        }
    });
});