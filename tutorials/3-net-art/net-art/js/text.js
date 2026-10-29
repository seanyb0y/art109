
const messages = [
    "We replace things because there's something better.. this is something better",
    "This is the next step of our evolution",
    "Welcome to the human network",
    "Human systems now interfaced with the digital. Only good things can come from this",
    "Pierced the border between man and machine, they become one now.",
    "Organic and synthetic fusion, a new breed of human.",
    "This is the true meaning of technological progression",
    "The human body can now be explored like action figures.. customized with different parts that make it better.",
    "We share the strengths of body and machine, canceling out the weaknesses in both.",
    "Digital space will blossom with the exponential increase of users, populating the infinitude of our new reality.",
    "The birth of an era where there are no limits. We can only go higher",
    
];

function typeText(element, text, speed = 75) {
    let index = 0;

    const interval = setInterval(() => {
        element.textContent += text[index];
        index++;

        if (index >= text.length) {
            clearInterval(interval);
        }
    }, speed);
}

function spawnText() {
    const text = document.createElement("p"); 

    text.classList.add("random-text");

    const message = 
        messages[Math.floor(Math.random() * messages.length)];

    const x = Math.random() * (window.innerWidth - 300);
    const y = Math.random() * (window.innerHeight - 100);

    text.style.left = `${x}px`;
    text.style.top = `${y}px`;

    document.body.appendChild(text);

    typeText(text, message);

    setTimeout(() => {
        text.style.opacity = "0";

        setTimeout(() => {
            text.remove();
        }, 4000);
    }, 15000);
}

setInterval(spawnText, 2000);