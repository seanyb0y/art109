
const messages = [
    "This has been a silent path we've walked since the birth of the first computer",
    "Are we even human?",
    "Our dreams become our new reality, as we forget where we came from",
    "Our organic systems didn't bond with the digital systems, instead they were overwritten.",
    "Our bodies become vessels for 1s and 0s, we were never meant for this",
    "Technological tools meant to assist, now become a lifeline",
    "To forget how we've destroyed our bodies with circuitry, we travel deeper. Plunging into digital space for a better life. ",
    "We no longer suffer from illness, hunger, pain.. but I can't feel anymore.",
    "We're stuck in a digital fabrication of our own reality.. none of it real.. but it's comforting.",
    "We're nothing but husks of what we once were. Do we even consider ourselves to be human anymore? This went too far.",
    "Though we sink to the bottom of an ocean of code, we stay below the waves because we can no longer breathe above the surface",
    "We bury our humanity with more and more technology, suppressing what defined our species, converting it into something different.",
    "Our future is uncertain.. we prefer to live in digital realms, how will we continue.",
    "Everything we valued of material has washed away with dust. Just clutter.",
    "We wandered a forest filled with opportunity, but lost the way back home. Tangled in the vines, we became apart of its ecosystem",
    "Plugged into digital systems 24/7, we've become the device. An extension to the system.",
    "There's no point of unplugging.. everything we have is in the system. The real world provides nothing but a base to connect",
    "The real world is now a dream. Our dreams become our new fabricated reality."
    
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

function deleteText(element, speed = 30) {
    const interval = setInterval(() => {
        element.textContent = 
            element.textContent.slice(0, -1);

            if (element.textContent.length === 0) {
                clearInterval(interval);
                element.remove();
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