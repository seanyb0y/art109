const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//////////////////////////////////////////////////
// CANVAS
//////////////////////////////////////////////////

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

//////////////////////////////////////////////////
// WORLD
//////////////////////////////////////////////////

const CITY_WIDTH = 50000;

const camera = {
    x: 0
};

const structures = [];
const corporations = [];
const dataFragments = [];
let nextDataFragmentAt = performance.now() + 300;

//////////////////////////////////////////////////
// UTILITIES
//////////////////////////////////////////////////

function rand(min, max) {
    return min + Math.random() * (max - min);
}

function pick(arr) {
    return arr[
        Math.floor(
            Math.random() * arr.length
        )
    ];
}

function shuffle(arr) {

    const clone = [...arr];

    for(let i=clone.length-1; i>0; i--){

        const j =
            Math.floor(
                Math.random()*(i+1)
            );

        [clone[i], clone[j]] =
        [clone[j], clone[i]];
    }

    return clone;
}

//////////////////////////////////////////////////
// STRUCTURE GENERATORS
//////////////////////////////////////////////////

const structureTypes = [
    "grid",
    "signal",
    "constellation",
    "branch",
    "glyph",
    "mesh"
];

function generateGrid(w,h){

    const lines = [];

    for(let x=0;x<w;x+=20){

        lines.push({
            x1:x,
            y1:0,
            x2:x,
            y2:h
        });
    }

    for(let y=0;y<h;y+=20){

        lines.push({
            x1:0,
            y1:y,
            x2:w,
            y2:y
        });
    }

    return shuffle(lines);
}

function generateSignal(w,h){

    const lines = [];

    let currentX = w/2;

    for(let y=h;y>0;y-=20){

        const nextX =
            currentX +
            rand(-50,50);

        lines.push({
            x1:currentX,
            y1:y,
            x2:nextX,
            y2:y-20
        });

        currentX = nextX;
    }

    return lines;
}

function generateConstellation(w,h){

    const lines = [];
    const pts = [];

    for(let i=0;i<30;i++){

        pts.push({

            x:rand(0,w),
            y:rand(0,h)
        });
    }

    for(let i=0;i<pts.length-1;i++){

        lines.push({

            x1:pts[i].x,
            y1:pts[i].y,

            x2:pts[i+1].x,
            y2:pts[i+1].y
        });
    }

    return shuffle(lines);
}

function generateGlyph(w,h){

    const lines = [];

    for(let i=0;i<50;i++){

        const x =
            rand(0,w);

        const y =
            rand(0,h);

        const len =
            rand(20,100);

        const a =
            rand(
                0,
                Math.PI*2
            );

        lines.push({

            x1:x,
            y1:y,

            x2:x +
                Math.cos(a)*len,

            y2:y +
                Math.sin(a)*len
        });
    }

    return shuffle(lines);
}

function generateMesh(w,h){

    const lines = [];
    const pts = [];

    for(let i=0;i<25;i++){

        pts.push({

            x:rand(0,w),
            y:rand(0,h)
        });
    }

    for(let i=0;i<40;i++){

        const a =
            pick(pts);

        const b =
            pick(pts);

        lines.push({

            x1:a.x,
            y1:a.y,

            x2:b.x,
            y2:b.y
        });
    }

    return shuffle(lines);
}

function generateBranch(w,h){

    const lines = [];

    function recurse(
        x,
        y,
        len,
        angle,
        depth
    ){

        if(depth <= 0){
            return;
        }

        const nx =
            x +
            Math.cos(angle)*len;

        const ny =
            y +
            Math.sin(angle)*len;

        lines.push({

            x1:x,
            y1:y,

            x2:nx,
            y2:ny
        });

        recurse(
            nx,
            ny,
            len*.75,
            angle+.6,
            depth-1
        );

        recurse(
            nx,
            ny,
            len*.75,
            angle-.6,
            depth-1
        );
    }

    recurse(
        w/2,
        h/2,
        120,
        rand(0,Math.PI*2),
        5
    );

    return shuffle(lines);
}

function generatePolygon() {

    const segments = [];
    const points = [];

    const count =
        Math.floor(rand(6, 12));

    const radius =
        rand(300, 1000);

    for(let i = 0; i < count; i++){

        const angle =
            (Math.PI * 2 / count) * i;

        const r =
            radius * rand(0.6, 1.2);

        points.push({

            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        });
    }

    for(let i = 0; i < points.length; i++){

        const a = points[i];

        const b =
            points[
                (i + 1) % points.length
            ];

        segments.push({

            x1: a.x,
            y1: a.y,

            x2: b.x,
            y2: b.y
        });
    }

    return shuffle(segments);
}

function generateCircuit(){

    const segs = [];

    let x = 0;
    let y = 0;

    for(let i=0;i<60;i++){

        const horizontal =
            Math.random() > .5;

        const dist =
            rand(
                50,
                250
            );

        const nx =
            horizontal ?
            x+dist : x;

        const ny =
            horizontal ?
            y : y+dist;

        segs.push({

            x1:x,
            y1:y,

            x2:nx,
            y2:ny
        });

        x = nx;
        y = ny;
    }

    return shuffle(segs);
}

function generateTerritory(){

    const segments = [];
    const points = [];

    const count =
        Math.floor(rand(8, 18));

    const radius =
        rand(300, 800);

    for(let i = 0; i < count; i++){

        const angle =
            (Math.PI * 2 / count) * i;

        const r =
            radius *
            rand(0.5, 1.3);

        points.push({

            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
        });
    }

    for(let i = 0; i < points.length; i++){

        const a = points[i];
        const b =
            points[
                (i + 1) % points.length
            ];

        segments.push({

            x1: a.x,
            y1: a.y,

            x2: b.x,
            y2: b.y
        });
    }

    return shuffle(segments);
}

function generateNetwork(){

    const segs = [];

    const points = [];

    for(let i=0;i<40;i++){

        points.push({

            x:rand(
                -500,
                500
            ),

            y:rand(
                -500,
                500
            )
        });
    }

    for(let i=0;i<60;i++){

        const a =
            pick(points);

        const b =
            pick(points);

        segs.push({

            x1:a.x,
            y1:a.y,

            x2:b.x,
            y2:b.y
        });
    }

    return shuffle(segs);
}

function generateFortress(){

    const segs = [];

    const size =
        rand(
            300,
            800
        );

    for(let i=0;i<8;i++){

        const s =
            size*(1-i*0.12);

        segs.push({
            x1:-s,
            y1:-s,
            x2:s,
            y2:-s
        });

        segs.push({
            x1:s,
            y1:-s,
            x2:s,
            y2:s
        });

        segs.push({
            x1:s,
            y1:s,
            x2:-s,
            y2:s
        });

        segs.push({
            x1:-s,
            y1:s,
            x2:-s,
            y2:-s
        });
    }

    return shuffle(segs);
}
//////////////////////////////////////////////////
// CREATE STRUCTURE
//////////////////////////////////////////////////

function createStructure(x){

    const width =
        rand(150,350);

    const height =
        rand(150,500);

    const type =
        pick(
            structureTypes
        );

    let blueprint = [];

    switch(type){

        case "grid":
            blueprint =
                generateGrid(
                    width,
                    height
                );
            break;

        case "signal":
            blueprint =
                generateSignal(
                    width,
                    height
                );
            break;

        case "constellation":
            blueprint =
                generateConstellation(
                    width,
                    height
                );
            break;

        case "glyph":
            blueprint =
                generateGlyph(
                    width,
                    height
                );
            break;

        case "mesh":
            blueprint =
                generateMesh(
                    width,
                    height
                );
            break;

        case "branch":
            blueprint =
                generateBranch(
                    width,
                    height
                );
            break;
    }

    return {

        x,

        y:
            rand(
                -200,
                canvas.height
            ),

        blueprint,

        buildProgress:0,
        destroyProgress:0,

        timer:0,

        lifetime:
            rand(
                400,
                1200
            ),

        state:"build"
    };
}

//////////////////////////////////////////////////
// CORPORATIONS
//////////////////////////////////////////////////

function createCorporation(x){

    const type = pick([
        "territory",
        "circuit",
        "polygon",
        "fortress",
        "network"
    ]);

    let geometry = [];

    switch(type){

        case "territory":
            geometry =
                generateTerritory();
            break;

        case "circuit":
            geometry =
                generateCircuit();
            break;

        case "polygon":
            geometry =
                generatePolygon();
            break;

        case "fortress":
            geometry =
                generateFortress();
            break;

        case "network":
            geometry =
                generateNetwork();
            break;
    }

    return {

        x,

        y: rand(
            -300,
            canvas.height + 300
        ),

        geometry,

        build:0,

        type,

        rotation:
            rand(
                0,
                Math.PI*2
            )
    };
}

let p = 0;

while(p < CITY_WIDTH){

    structures.push(
        createStructure(p)
    );

    p += rand(30,90);
}

for(let i=0;i<100;i++){

    corporations.push(

        createCorporation(

            rand(
                0,
                CITY_WIDTH
            )
        )
    );
}

//////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////

function update(){

    corporations.forEach(c => {

        c.build += 0.002;

        if(c.build > 1){
            c.build = 1;
        }
    });

    structures.forEach(s => {

        if(s.state === "build"){

            s.buildProgress += 0.04;

            if(
                s.buildProgress >=
                s.blueprint.length
            ){

                s.state =
                    "live";
            }
        }

        else if(
            s.state === "live"
        ){

            s.timer++;

            if(
                s.timer >
                s.lifetime
            ){

                s.state =
                    "destroy";
            }
        }

        else if(
            s.state === "destroy"
        ){

            s.destroyProgress += 0.05;

            if(
                s.destroyProgress >=
                s.blueprint.length
            ){

                Object.assign(
                    s,
                    createStructure(
                        s.x
                    )
                );
            }
        }
    });
}

//////////////////////////////////////////////////
// DRAW CORPORATIONS
//////////////////////////////////////////////////

function drawCorporations(){

    corporations.forEach(c => {

        const x =
            c.x -
            camera.x;

        if(
            x < -2500 ||
            x > canvas.width + 2500
        ){
            return;
        }

        const visible =
            Math.floor(
                c.geometry.length *
                c.build
            );

        ctx.save();

        ctx.translate(
            x,
            c.y
        );

        ctx.rotate(
            c.rotation
        );

        ctx.strokeStyle =
            "rgba(255,0,0,1)";

        for(let i=0;i<visible;i++){

            const seg =
                c.geometry[i];

            const glitch =
                Math.sin(
                    performance.now()
                    *0.0005 +
                    i
                ) * 15;

            ctx.beginPath();

            ctx.moveTo(
                seg.x1 + glitch,
                seg.y1
            );

            ctx.lineTo(
                seg.x2 - glitch,
                seg.y2
            );

            ctx.stroke();

            ctx.lineWidth = 4;
        }

        ctx.restore();
    });
}

//////////////////////////////////////////////////
// DRAW STRUCTURES
//////////////////////////////////////////////////

function drawStructure(s){

    const worldX =
        s.x -
        camera.x;

    const visible =
        s.state === "destroy"
        ? s.blueprint.length -
          Math.floor(
            s.destroyProgress
          )
        : Math.floor(
            s.buildProgress
          );

    ctx.strokeStyle =
        "rgba(0,255,136,.9)";

    for(
        let i=0;
        i<visible;
        i++
    ){

        const seg =
            s.blueprint[i];

        ctx.beginPath();

        ctx.moveTo(
            worldX +
            seg.x1,

            s.y +
            seg.y1
        );

        ctx.lineTo(
            worldX +
            seg.x2,

            s.y +
            seg.y2
        );

        ctx.stroke();
    }

    if(
        s.state === "build"
    ){

        const idx =
            Math.floor(
                s.buildProgress
            );

        const seg =
            s.blueprint[idx];

        if(seg){

            const t =
                s.buildProgress -
                idx;

            const px =
                seg.x1 +
                (seg.x2-seg.x1)*t;

            const py =
                seg.y1 +
                (seg.y2-seg.y1)*t;

            ctx.fillStyle =
                "#fff";

            ctx.beginPath();

            ctx.arc(
                worldX + px,
                s.y + py,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}



function drawDataFragments(){

    const now = performance.now();

    if(now >= nextDataFragmentAt){

        let text = "";

        if(Math.random() < 0.55){

            const length =
                Math.floor(
                    rand(5,15)
                );

            for(let i=0;i<length;i++){
                text += Math.random() < 0.5 ? "0" : "1";
            }
        }
        else{
            text = pick([
                "SIGNAL_LOST",
                "ROOT_ACCESS",
                "ECO.exe",
                "NOISE//DATA",
                "WILD_SYSTEM"
            ]);
        }

        const typingDuration =
            text.length * rand(65, 95);
        const holdDuration =
            rand(200, 400);
        const eraseDuration =
            text.length * rand(45, 70);

        dataFragments.push({
            text,
            x: rand(12, Math.max(12, canvas.width - 140)),
            y: rand(50, Math.max(51, canvas.height - 16)),
            createdAt: now,
            typingDuration,
            holdDuration,
            eraseDuration,
            duration:
                typingDuration +
                holdDuration +
                eraseDuration +
                160,
            drift: rand(-12, 12),
            size: rand(12, 18),
            color: pick(["#00ff88", "#54ffd2", "#a4ff68"])
        });

        if(dataFragments.length > 24){
            dataFragments.shift();
        }

        nextDataFragmentAt =
            now + rand(300, 900);
    }

    for(let i=dataFragments.length-1;i>=0;i--){

        if(
            now - dataFragments[i].createdAt >=
            dataFragments[i].duration
        ){
            dataFragments.splice(i, 1);
        }
    }

    ctx.save();

    dataFragments.forEach(fragment => {

        const age =
            now - fragment.createdAt;

        const textLength = fragment.text.length;
        const holdStartsAt =
            fragment.typingDuration;
        const eraseStartsAt =
            holdStartsAt + fragment.holdDuration;
        let visibleCharacters;

        if(age < holdStartsAt){
            visibleCharacters =
                Math.floor(
                    age / fragment.typingDuration *
                    textLength
                );
        }
        else if(age < eraseStartsAt){
            visibleCharacters = textLength;
        }
        else{
            const eraseProgress =
                Math.min(
                    1,
                    (age - eraseStartsAt) /
                    fragment.eraseDuration
                );

            visibleCharacters =
                Math.ceil(
                    textLength * (1 - eraseProgress)
                );
        }

        const showCursor =
            age < holdStartsAt ||
            age >= eraseStartsAt;
        const displayText =
            fragment.text.slice(0, visibleCharacters) +
            (showCursor ? "_" : "");

        if(!displayText){
            return;
        }

        const fadeIn = age / 120;
        const fadeOut =
            (fragment.duration - age) / 100;

        ctx.globalAlpha =
            Math.max(
                0,
                Math.min(1, fadeIn, fadeOut)
            );
        ctx.fillStyle = fragment.color;
        ctx.font = `${fragment.size}px monospace`;
        ctx.shadowColor = fragment.color;
        ctx.shadowBlur = 6;
        ctx.fillText(
            displayText,
            fragment.x + fragment.drift * age / fragment.duration,
            fragment.y - age * 0.012
        );
    });

    ctx.restore();
}



function draw(){

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawCorporations();

    shuffle(
        structures
    ).forEach(
        drawStructure
    );

    drawDataFragments();
}

window.addEventListener(
    "wheel",
    e => {

        camera.x +=
            e.deltaY * 2;

        camera.x =
            Math.max(
                0,

                Math.min(
                    CITY_WIDTH -
                    canvas.width,

                    camera.x
                )
            );
    }
);

function animate(){

    update();
    draw();

    requestAnimationFrame(
        animate
    );
}

animate();