const fakeCursor = document.getElementById("fakeCursor");

document.addEventListener("mousemove", (e) => {
    fakeCursor.style.left = e.clientX + "px";
    fakeCursor.style.top = e.clientY + "px";
});