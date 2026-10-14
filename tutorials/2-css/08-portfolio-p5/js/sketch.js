
let canvas; 



function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style("z-index", -2);
    // background(225);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw(){ 
    
}

function mouseMoved(){
    drawThing(mouseX, mouseY);
}

function drawThing(_x, _y){
    strokeWeight(0);
    fill(random(200, 255), random(200, 255), random(200, 255));
    ellipse(_x, _y, 30, 30);
}