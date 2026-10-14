
let canvas; 

let squares = [];





function setup(){
    canvas = createCanvas(windowWidth, windowHeight,);
    canvas.position(0, 0);
    canvas.style("z-index", -2);
    rectMode(CENTER);
    noFill();
    // angleMode(DEGREES)
    // background(225);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background( 10, 10, 20);

    if (frameCount % 8 === 0) {
        squares.push(new Square());
    }

    for (let i = squares.length - 1; i >= 0; i--) {
        squares[i].update();
        squares[i].display();

        if (squares[i].isDead()) {
            squares.splice(i, 1);
        }
    }
}

class Square {
    constructor() {
        this.x = random(width); 
        this.y = random(height);
        this.size = random(20, 200);
        this.life = 255;

        this.r = ([90, 0, 0]);
        this.g = random ([255, 0, 0]);
        this.b = random ([255, 0, 0]);

        this.copies = int(random(5,8));

        this.growth = random (10, 10);
    }

    update() {
        this.life -= .5;

        this.h += this.growth;
    }

    display() {
        stroke(this.r, this.g, this.b, this.life);
        strokeWeight(2);
        rect(this.x, this.y, this.size, this.size);
    }

    isDead() {
        return this.life <= 0;
    }
}














// function draw(){ 

//     background(30)

//     rotateX(60)


//     noFill()
//     stroke(255)

//     for (var i = 0; i < 50; i++) {

//         var r = map(sin(frameCount), -1, 1, 200, 255)
//         var g = map(i, 0, 50, 100, 200)
//         var b = map(cos(frameCount), -1, 1, 255, 100)

//         stroke(r, g, b)






//         beginShape()
//         for (var j = 0; j < 360; j += 10) {
//             var rad = i * 10
//             var x = rad * cos(j)
//             var y = rad * sin(j)
//             var z = sin(frameCount + i * 10) * 50

//             vertex(x,y, z)
//         }
//         endShape(CLOSE)
//     }
// }

// function mouseMoved(){
//     drawThing(mouseX, mouseY);
// }

// function drawThing(_x, _y){
//     strokeWeight(3);
//     stroke(50);
//     noFill();
//     // fill(random(200, 255, 255), random(200, 255), random(200, 255));
//     square(_x, _y, 100);
// }