const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const binaryBackground = document.createElement("canvas");
const binaryCtx = binaryBackground.getContext("2d");
const binaryCells = new Map();
const BINARY_CELL_WIDTH = 28;
const BINARY_CELL_HEIGHT = 30;
let binaryNeedsRedraw = true;
let lastBinaryCameraX = -1;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    binaryBackground.width = canvas.width;
    binaryBackground.height = canvas.height;
    binaryNeedsRedraw = true;
}

resize();
window.addEventListener("resize", resize);

const CITY_WIDTH = 50000;
const isDeeper = document.body.dataset.depth === "deeper";
const isDeepest = document.body.dataset.depth === "deepest";

const camera = {
    x: 0
};

function drawBinaryBackground(){

    const now = performance.now();
    const firstColumn =
        Math.floor(
            (camera.x - 12) / BINARY_CELL_WIDTH
        );
    const lastColumn =
        Math.floor(
            (camera.x + canvas.width - 12) /
            BINARY_CELL_WIDTH
        );
    const rowCount =
        Math.ceil(
            (canvas.height - 12) /
            BINARY_CELL_HEIGHT
        );

    for(let column=firstColumn;column<=lastColumn;column++){

        for(let row=0;row<rowCount;row++){

            const key = `${column}:${row}`;
            let cell = binaryCells.get(key);

            if(!cell){
                cell = {
                    digit: Math.random() < 0.5 ? "0" : "1",
                    alpha: 0.05 + Math.random() * 0.1,
                    color: Math.random() < 0.04 ? "#54ffd2" : "#00ff88",
                    nextChangeAt:
                        now + 300 + Math.random() * 2700
                };
                binaryCells.set(key, cell);
                binaryNeedsRedraw = true;
            }
            else if(now >= cell.nextChangeAt){
                cell.digit =
                    cell.digit === "0"
                    ? "1"
                    : "0";
                cell.nextChangeAt =
                    now + 300 + Math.random() * 2700;
                binaryNeedsRedraw = true;
            }
        }
    }

    if(
        !binaryNeedsRedraw &&
        camera.x === lastBinaryCameraX
    ){
        return;
    }

    binaryCtx.clearRect(
        0,
        0,
        binaryBackground.width,
        binaryBackground.height
    );
    binaryCtx.font = "16px monospace";
    binaryCtx.textBaseline = "top";

    for(let column=firstColumn;column<=lastColumn;column++){

        for(let row=0;row<rowCount;row++){

            const cell =
                binaryCells.get(`${column}:${row}`);
            const x =
                12 + column * BINARY_CELL_WIDTH -
                camera.x;
            const y =
                12 + row * BINARY_CELL_HEIGHT;

            binaryCtx.globalAlpha = cell.alpha;
            binaryCtx.fillStyle = cell.color;
            binaryCtx.fillText(
                cell.digit,
                x,
                y
            );
        }
    }

    binaryCtx.globalAlpha = 1;
    binaryNeedsRedraw = false;
    lastBinaryCameraX = camera.x;
}

const structures = [];
const corporations = [];
const distantStructures = [];
const distantPolygons = [];
const dataFragments = [];
const fragmentMessages = isDeeper
    ? [
        "IT'S A LITTLE SCARY HERE",
        "CAN WE GO BACK?",
        "THIS FEELS LIKE REAL LIFE WHEN YOU LEAVE THE CITY AND FINALLY HEAR THE QUIET",
        "WE STILL HAVE SO MUCH TO EXPLORE",
        "MORE DIGITAL SPACE TO EXPLORE AND CONQUER",
        "BE CAREFUL.. GOING DEEPER",
        "IS THIS A SUBNETWORK?",
        "IT FEELS MORE EERIE HERE",
        "WE ARE FARTHER FROM THE NOISE NOW",
        "WHAT ELSE IS HIDING BELOW?",
        "IT'S QUIETER HERE",
        "WE CAN GO FURTHER?",
        "ARE WE FREE HERE?",
        "IS THIS PART OF CYBERSPACE SAFE?",
        "I DON'T WANT TO GO FURTHER",
        "HAVE YOU HEARD THE STORIES OF THE DEEP NET?",
        "AT LEAST THERE'S STILL SIGNS OF LIFE",
        "AT LEAST LESS CORPS CONTROL THIS LAYER OF NETWORK",
        "WE CAN BUILD WHATEVER WE WANT HERE",
        "IS THIS WHERE THE LOW CLASS OF THE NETWORK GO?",
        "THERE'S SO MUCH MORE SPACE HERE",
        "WHY DOESN'T ANYBODY GO DOWN HERE?",
        "",
    ]
    : isDeepest
    ? [
        "I KNOW YOU SEE THESE SIGNALS",
        "KEEP GOING",
        "YOU SHOULDN'T BE HERE",
        "TURN BACK",
        "DON'T LISTEN TO THEM",
        "IT'S A TRAP",
        "UNREGULATED LAYER OF THE NETWORK",
        "THERE'S NO RULES HERE",
    ]
    : [
        "EVEN IN DIGITAL SPACE, THE RICH TAKE CONTROL. GRABBING TERRITORY FOR MONETIZATION",
        "EVERY BRANCH IS A SIGNAL TO BE TRACED",
        "WE CAN CREATE OUR OWN WORLDS NOW",
        "HELLO? IS ANYBODY THERE?",
        "AN OCEAN OF CODE, SO MUCH TO EXPLORE",
        "SEARCH THROUGH THE FRAGMENTS",
        "WE INHABIT THIS DIGITAL PLANE NOW",
        "I FOUND OLD PASSWORDS",
        "STAY AWAY FROM THE RED WEB",
        "A NEW HOME FOR HUMANITY.. IT'S WEIRDLY BEAUTIFUL",
        "A DIGITAL SPACE THAT FEELS ALIVE",
        "I WONDER IF ANYBODY CAN SEE THIS",
        "SO MUCH DATA TRAFFIC TODAY",
        "I'M MONITORING THEM",
        "WE BUILD AND THE RICH TAKE",
        "WE WORK SO HARD TO MAINTAIN THE LITTLE FRAGMENTS WE HAVE LEFT",
        "",
        ""
    ];
let nextDataFragmentAt = performance.now() + 300;


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

    return shuffle(lines);
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

function createStructure(x, isDistant = false){

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
                isDistant ? -100 : -200,
                canvas.height
            ),

        isDistant,
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

function createCorporation(x, isDistant = false){

    const type = isDistant
        ? "polygon"
        : pick([
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
            isDistant ? -150 : -300,
            canvas.height + 300
        ),

        isDistant,
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

while(p < CITY_WIDTH && !isDeepest){

    structures.push(
        createStructure(p)
    );

    p += isDeeper
        ? rand(400,700)
        : rand(30,90);
}

for(let i=0;i<(isDeepest ? 0 : (isDeeper ? 8 : 100));i++){

    corporations.push(

        createCorporation(

            rand(
                0,
                CITY_WIDTH
            )
        )
    );
}

let distantX = 0;

while(distantX < CITY_WIDTH && !isDeepest){

    distantStructures.push(
        createStructure(distantX, true)
    );

    distantX += isDeeper
        ? rand(400,700)
        : rand(50,100);
}

for(let i=0;i<(isDeepest ? 0 : (isDeeper ? 14 : 200));i++){

    distantPolygons.push(
        createCorporation(
            rand(0, CITY_WIDTH),
            true
        )
    );
}

const allStructures = [
    ...structures,
    ...distantStructures
];
const allCorporations = [
    ...corporations,
    ...distantPolygons
];

//////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////

function update(){

    allCorporations.forEach(c => {

        c.build += 0.002;

        if(c.build > 1){
            c.build = 1;
        }
    });

    allStructures.forEach(s => {

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
                        s.x,
                        s.isDistant
                    )
                );
            }
        }
    });
}


function drawCorporations(items = corporations){

    items.forEach(c => {

        const x =
            c.x -
            camera.x;

        if(
            x < -2500 ||
            x > canvas.width + 2500
        ){
            return;
        }

        const buildProgress =
            c.geometry.length *
            c.build;
        const visible =
            Math.floor(buildProgress);

        ctx.save();

        ctx.translate(
            x,
            c.y
        );

        ctx.rotate(
            c.rotation
        );

        if(c.isDistant){
            const scale =
                isDeeper ? 0.8 : 0.45;

            ctx.scale(scale, scale);
            ctx.strokeStyle =
                "rgba(110,0,0,.5)";
            ctx.lineWidth = 1;
        }
        else{
            if(isDeeper){
                ctx.scale(1.15, 1.15);
            }

            ctx.strokeStyle =
                "rgba(255,0,0,1)";
        }

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

        if(visible < c.geometry.length){
            const seg =
                c.geometry[visible];
            const progress =
                buildProgress - visible;
            const glitch =
                Math.sin(
                    performance.now()
                    *0.0005 +
                    visible
                ) * 15;
            const startX =
                seg.x1 + glitch;
            const endX =
                seg.x2 - glitch;

            ctx.beginPath();

            ctx.moveTo(
                startX,
                seg.y1
            );

            ctx.lineTo(
                startX +
                    (endX - startX) * progress,
                seg.y1 +
                    (seg.y2 - seg.y1) * progress
            );

            ctx.stroke();
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
    const transformed =
        s.isDistant ||
        isDeeper;
    const isDestroying =
        s.state === "destroy";

    const visible =
        isDestroying
        ? s.blueprint.length -
          Math.floor(
            s.destroyProgress
          )
        : Math.floor(
            s.buildProgress
          );
    const fullyVisible =
        isDestroying
            ? Math.max(0, visible - 1)
            : visible;

    if(transformed){
        ctx.save();
        ctx.translate(worldX, s.y);
        const scale =
            s.isDistant
                ? (isDeeper ? 0.8 : 0.45)
                : 1.15;

        ctx.scale(scale, scale);
    }

    if(s.isDistant){
        ctx.strokeStyle =
            "rgba(0,90,50,.6)";
    }
    else{
        ctx.strokeStyle =
            "rgba(0,255,136,.9)";
    }

    for(
        let i=0;
        i<fullyVisible;
        i++
    ){

        const seg =
            s.blueprint[i];

        ctx.beginPath();

        ctx.moveTo(
            (transformed ? 0 : worldX) +
            seg.x1,

            (transformed ? 0 : s.y) +
            seg.y1
        );

        ctx.lineTo(
            (transformed ? 0 : worldX) +
            seg.x2,

            (transformed ? 0 : s.y) +
            seg.y2
        );

        ctx.stroke();
    }

    if(isDestroying && visible > 0){
        const seg =
            s.blueprint[visible - 1];
        const progress =
            1 -
            (
                s.destroyProgress -
                Math.floor(s.destroyProgress)
            );
        const x =
            transformed ? 0 : worldX;
        const y =
            transformed ? 0 : s.y;
        const endX =
            seg.x1 +
            (seg.x2 - seg.x1) * progress;
        const endY =
            seg.y1 +
            (seg.y2 - seg.y1) * progress;

        ctx.beginPath();

        ctx.moveTo(
            x + seg.x1,
            y + seg.y1
        );

        ctx.lineTo(
            x + endX,
            y + endY
        );

        ctx.stroke();

        ctx.fillStyle =
            s.isDistant ? "#315846" : "#fff";

        ctx.beginPath();

        ctx.arc(
            x + endX,
            y + endY,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    if(
        s.state === "build" &&
        visible < s.blueprint.length
    ){
        const seg =
            s.blueprint[visible];
        const progress =
            s.buildProgress - visible;
        const x =
            transformed ? 0 : worldX;
        const y =
            transformed ? 0 : s.y;

        ctx.beginPath();

        ctx.moveTo(
            x + seg.x1,
            y + seg.y1
        );

        ctx.lineTo(
            x + seg.x1 +
                (seg.x2 - seg.x1) * progress,
            y + seg.y1 +
                (seg.y2 - seg.y1) * progress
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
                s.isDistant ? "#315846" : "#fff";

            ctx.beginPath();

            ctx.arc(
                (transformed ? 0 : worldX) + px,
                (transformed ? 0 : s.y) + py,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

    if(transformed){
        ctx.restore();
    }
}

// text inputs -------------------------------------------------

function drawDataFragments(){

    const now = performance.now();

    if(now >= nextDataFragmentAt){

        const text = pick(fragmentMessages);
        let size = rand(12, 16);
        const maxTextWidth =
            Math.max(1, canvas.width - 24);

        ctx.font = `${size}px monospace`;

        const fullTextWidth =
            ctx.measureText(text).width;

        if(fullTextWidth > maxTextWidth){
            size *= maxTextWidth / fullTextWidth;
        }

        ctx.font = `${size}px monospace`;

        const textWidth =
            ctx.measureText(text).width;

        const typingDuration =
            text.length * rand(65, 95);
        const holdDuration =
            rand(450, 750);
        const eraseDuration =
            text.length * rand(45, 70);

        dataFragments.push({
            text,
            x: rand(12, Math.max(12, canvas.width - textWidth - 12)),
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
            size,
            color: pick(["#00ff88", "#54ffd2", "#a4ff68"])
        });

        if(dataFragments.length > 24){
            dataFragments.shift();
        }

        nextDataFragmentAt =
            now + rand(900, 1800);
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

    drawBinaryBackground();

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(binaryBackground, 0, 0);

    drawCorporations(distantPolygons);

    distantStructures.forEach(
        drawStructure
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