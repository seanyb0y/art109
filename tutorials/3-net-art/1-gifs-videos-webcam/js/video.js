const hoverVideos = document.querySelectorAll(".hover-video");
const clickVideos = document.querySelectorAll(".click-video");


hoverVideos.forEach(video => {
    video.addEventListener("mouseenter", () => {
        video.play();
    })

    video.addEventListener("mouseleave", () => {
        video.pause();
    })

})

clickVideos.forEach(video => {
    video.addEventListener("click", () => {
        video.play();
    })

})