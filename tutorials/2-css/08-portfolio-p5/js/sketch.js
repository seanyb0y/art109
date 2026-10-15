
let canvas; 

let squares = [];
let strings = []; 
let forms = [];





function setup(){
    canvas = createCanvas(windowWidth, windowHeight,);
    canvas.position(0, 0);
    canvas.style("z-index", -2);
    rectMode(CENTER);
    noFill();

    for (let i = 0; i < 50; i++)  {
        forms.push(new SineForm());
    }
    // angleMode(DEGREES)
    // background(225);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background( 10, 10, 20);

    if (frameCount % 2 === 0) {
        squares.push(new Square());
        strings.push(new GlitchString());
    }

    for (let i = squares.length - 1; i >= 0; i--) {
        squares[i].update();
        squares[i].display();

        if (squares[i].isDead()) {
            squares.splice(i, 1);
        }
    }


    for (let i = strings.length - 1; i >= 0; i--) {
        strings[i].update();
        strings[i].display();

        if (strings[i].life <= 0) {
            strings.splice(i, 1);
        }
    }

    for (let form of forms) {
        form.update();
        form.display();
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

class GlitchString {
    constructor() {
        this.x = random(width);
        this.y = random(height);

        this.life = 255; 
        
        this.points = [];

        for (let i = 0; i < 50; i++) {
            let px = i * 12;

            let py = sin(i * 0.3) * 20 + random(-5, 5)

            this.points.push({ x: px, y: py});
        }
    }

    update() {
        this.life -= 4;

        for (let p of this.points) {
            if (random() < 0.05) {
                p.y += random(-15, 15);
            }
        }
    }

    display() {
        push();

        translate(this.x, this.y);
        
        noFill();
        stroke(255, 0, 0, this.life);
        strokeWeight(2);

        beginShape();
        for (let p of this.points) {
            vertex(p.x, p.y);
        }

        endShape();

        pop();
    }

    // isDead() {
    //     return this.life <= 0;
    // }
}

class SineForm {
    constructor() {
        this.x = random(-width, width);
        this.y = random(-height, height);
        this.z = random(-300, 300);

        this.phase = random(TWO_PI);
        this.size = random(50, 200);
    }

    update() {
        this.phase += 0.01;
    }

    display() {
        push();
        translate(this.x, this.y, this.z);
        stroke(100);

        beginShape();

        for (let t = 0; t < TWO_PI * 4; t += 0.1) {
            let x = sin(t * 3 + this.phase) * this.size;
            let y = sin(t * 5 + this.phase) * this.size;
            let z = sin(t * -10 + this.phase) * this.size;

            vertex(x, y, z);
        }

        endShape();

        pop();
    }
}



