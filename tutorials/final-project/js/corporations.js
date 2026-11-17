
const corporations = [];


function rand(min,max){
    return min + Math.random() * (max-min);
}

function randomChoice(arr){
    return arr[
        Math.floor(
            Math.random()*arr.length
        )
    ];
}

////////////////////////////////////////////////////
// SHAPES
////////////////////////////////////////////////////

const corpTypes = [

    "hex",
    "cube",
    "triangle",
    "radial",
    "void",
    "fracture"
];

////////////////////////////////////////////////////
// BUILD GEOMETRY
////////////////////////////////////////////////////

function generateHex(size){

    const segs = [];

    const points = [];

    for(let i=0;i<6;i++){

        const angle =
            (Math.PI*2/6)*i;

        points.push({

            x:
                Math.cos(angle)*size,

            y:
                Math.sin(angle)*size
        });
    }

    for(let i=0;i<6;i++){

        const a = points[i];
        const b =
            points[
                (i+1)%6
            ];

        segs.push({

            x1:a.x,
            y1:a.y,

            x2:b.x,
            y2:b.y
        });
    }

    return segs;
}

function generateTriangle(size){

    const segs = [];

    const pts = [

        {x:0,y:-size},

        {x:size,y:size},

        {x:-size,y:size}
    ];

    for(let i=0;i<3;i++){

        const a = pts[i];
        const b =
            pts[
                (i+1)%3
            ];

        segs.push({

            x1:a.x,
            y1:a.y,

            x2:b.x,
            y2:b.y
        });
    }

    return segs;
}

function generateCube(size){

    const segs = [];

    const offset =
        size * 0.4;

    segs.push({x1:-size,y1:-size,x2:size,y2:-size});
    segs.push({x1:size,y1:-size,x2:size,y2:size});
    segs.push({x1:size,y1:size,x2:-size,y2:size});
    segs.push({x1:-size,y1:size,x2:-size,y2:-size});

    segs.push({
        x1:-size+offset,
        y1:-size-offset,
        x2:size+offset,
        y2:-size-offset
    });

    segs.push({
        x1:size+offset,
        y1:-size-offset,
        x2:size+offset,
        y2:size-offset
    });

    segs.push({
        x1:size+offset,
        y1:size-offset,
        x2:-size+offset,
        y2:size-offset
    });

    segs.push({
        x1:-size+offset,
        y1:size-offset,
        x2:-size+offset,
        y2:-size-offset
    });

    segs.push({
        x1:-size,
        y1:-size,
        x2:-size+offset,
        y2:-size-offset
    });

    segs.push({
        x1:size,
        y1:-size,
        x2:size+offset,
        y2:-size-offset
    });

    segs.push({
        x1:size,
        y1:size,
        x2:size+offset,
        y2:size-offset
    });

    segs.push({
        x1:-size,
        y1:size,
        x2:-size+offset,
        y2:size-offset
    });

    return segs;
}

function generateRadial(size){

    const segs = [];

    for(let i=0;i<16;i++){

        const angle =
            (Math.PI*2/16)*i;

        segs.push({

            x1:0,
            y1:0,

            x2:
                Math.cos(angle)
                * size,

            y2:
                Math.sin(angle)
                * size
        });
    }

    return segs;
}

function generateFracture(size){

    const segs = [];

    let x = 0;
    let y = 0;

    for(let i=0;i<25;i++){

        const nx =
            x +
            rand(
                -size,
                size
            );

        const ny =
            y +
            rand(
                -size,
                size
            );

        segs.push({

            x1:x,
            y1:y,

            x2:nx,
            y2:ny
        });

        x = nx;
        y = ny;
    }

    return segs;
}

function generateVoid(size){

    const segs = [];

    for(let i=0;i<40;i++){

        const a =
            rand(
                0,
                Math.PI*2
            );

        const r =
            rand(
                size*0.4,
                size
            );

        segs.push({

            x1:
                Math.cos(a)*r,

            y1:
                Math.sin(a)*r,

            x2:
                Math.cos(a+0.8)*r,

            y2:
                Math.sin(a+0.8)*r
        });
    }

    return segs;
}

////////////////////////////////////////////////////
// CREATE ENTITY
////////////////////////////////////////////////////

function createCorporation(x){

    const type =
        randomChoice(
            corpTypes
        );

    const size =
        rand(60,180);

    let geometry = [];

    switch(type){

        case "hex":
            geometry =
                generateHex(size);
            break;

        case "cube":
            geometry =
                generateCube(size);
            break;

        case "triangle":
            geometry =
                generateTriangle(size);
            break;

        case "radial":
            geometry =
                generateRadial(size);
            break;

        case "void":
            geometry =
                generateVoid(size);
            break;

        case "fracture":
            geometry =
                generateFracture(size);
            break;
    }

    return {

        x,

        y:
            rand(
                100,
                canvas.height-100
            ),

        type,

        geometry,

        rotation:
            rand(
                0,
                Math.PI*2
            ),

        build:0,

        corruption:
            rand(
                0.5,
                2
            )
    };
}

////////////////////////////////////////////////////
// POPULATE WORLD
////////////////////////////////////////////////////

for(
    let i=0;
    i<120;
    i++
){

    corporations.push(

        createCorporation(
            rand(
                0,
                CITY_WIDTH
            )
        )
    );
}

////////////////////////////////////////////////////
// DRAW
////////////////////////////////////////////////////

function drawCorporations(){

    corporations.forEach(c => {

        const screenX =
            c.x -
            camera.x;

        if(
            screenX < -400 ||
            screenX >
            canvas.width+400
        ){
            return;
        }

        c.build += 0.02;

        const visible =
            Math.floor(
                c.geometry.length *
                Math.min(
                    c.build,
                    1
                )
            );

        ctx.save();

        ctx.translate(
            screenX,
            c.y
        );

        ctx.rotate(
            c.rotation
        );

        ctx.strokeStyle =
            "rgba(255, 0, 0, 0.98)";

        ctx.lineWidth = 1;

        for(
            let i=0;
            i<visible;
            i++
        ){

            const seg =
                c.geometry[i];

            const glitch =
                Math.sin(
                    performance.now()
                    *0.001*
                    c.corruption
                    + i
                )*8;

            ctx.beginPath();

            ctx.moveTo(
                seg.x1+glitch,
                seg.y1
            );

            ctx.lineTo(
                seg.x2-glitch,
                seg.y2
            );

            ctx.stroke();
        }

        ctx.restore();
    });
}