const brain = document.getElementById("brainImage");

const images = [
    document.getElementById("image1"),
    document.getElementById("image2"),
    document.getElementById("image3"),
    document.getElementById("image4"),
];

let currentImage = 0;

brain.addEventListener("click", () => {
    if (currentImage < images.length) {
        images[currentImage].style.display = "block";
        currentImage++;
    }
});