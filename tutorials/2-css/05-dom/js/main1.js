console.log("hellooooo");


// select html elements // 
const header = document.querySelector("#header");
const changeHeaderButton = document.querySelector("#changeHeaderButton");
const changeThemeButton = document.querySelector("#changeThemeButton");

// change header with button click //

changeHeaderButton.addEventListener("click", () => {
    header.innerHTML = "BLINGG";
})


// toggle color theme // 

//create function for changing button text//

function changeButtonText(){
    if (document.body.classList.contains("dark")) {
        changeThemeButton.textContent = "Switch to Light Theme";
    } else {
        changeThemeButton.textContent = "Switch to Dark Theme";
    }
}


// click event on button //

changeThemeButton.addEventListener("click", () => {
    //add/remove dark class to body//
    document.body.classList.toggle("dark");
    changeButtonText();
})

