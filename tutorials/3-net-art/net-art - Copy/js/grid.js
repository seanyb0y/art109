const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

const grids = [];

class Grid {
    constructor() {

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.cols = Math.floor(Math.random() * 5) + 2;
        this.rows = Math.floor(Math.random() * 10) + 1;

        this.cellSize = 25 + Math.random() * 60;

        this.rotation = Math.random() * Math.PI * 2;

        this.totalLines = this.cols + this.rows + 2;

        this.visibleLines = 0;

        this.phase = "draw";

        this.holdTimer = 0;

        this.alpha = 1;

        this.hue = Math.floor(Math.random() * 360);

    }

    update() {
        if (this.phase === "draw") {
            this.visibleLines += 0.05;

            if (this.visibleLines >= this.totalLines) {
                this.visibleLines = this.totalLines;
                this.phase = "hold";
            }

        } else if (this.phase === "hold") {
            
            this.holdTimer++;

            if (this.holdTimer > 1000) {
                this.phase = "erase";
            }

        } else if (this.phase === "erase") {
            this.visibleLines -= 0.09;

            if (this.visibleLines <= 0) {
                this.dead = true;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // ctx.strokeStyle = `rgba(0, 255, 0,${this.alpha})`;
        ctx.strokeStyle = `hsla(${this.hue}, 60%, 40%, ${this.alpha})`;
        ctx.lineWidth = 3;
        

        let count = 0;

        for (let i = 0; i <= this.cols; i++) {
            if (count < this.visibleLines) {

                let x = i * this.cellSize;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x,this.rows * this.cellSize);
                ctx.stroke();
            }

            count++;
        }

        for(let j = 0; j <= this.rows; j++) {

            if (count < this.visibleLines) {
                let  y = j * this.cellSize;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.cols * this.cellSize, y);
                ctx.stroke();
            }

            count++;
        }

        ctx.restore();
    }
}

setInterval( () => {
    if (grids.length < 60) {
        grids.push(new Grid());
    }
}, 300);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = grids.length - 1; i >= 0; i--) {
        grids[i].update();
        grids[i].draw();

        if (grids[i].dead) {
            grids.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

animate();