let canvas;
let gl;
let program;
let points = [];
let subdivisionCount = 2;
let vBuffer;
let uColor;

const a = [-0.8,  0.8];
const b = [ 0.8,  0.8];
const c = [ 0.8, -0.8];
const d = [-0.8, -0.8];

window.onload = async function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext("webgl");

    if (!gl) {
        alert("WebGL을 사용할 수 없습니다.");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    const vertexShaderSource =
        await loadShaderSource("vertex.glsl");

    const fragmentShaderSource =
        await loadShaderSource("fragment.glsl");

    const vertexShader =
        createShader(gl.VERTEX_SHADER, vertexShaderSource);

    const fragmentShader =
        createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader){
        return;
    }

    program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(points.flat()),
        gl.STATIC_DRAW
    );

    const divisionSlider = document.getElementById("divisionSlider");
    const divisionvalue = document.getElementById("divisionValue");

    divisionSlider.addEventListener("input", function() {
        subdivisionCount =  Number(divisionSlider.value);

        divisionvalue.textContent = subdivisionCount;

        updateCarpet();
        render();
    });

    const colorMenu = document.getElementById("colorMenu");

    colorMenu.addEventListener("change", function(){
        
        const selectedColor = colorMenu.value;

        if (selectedColor === "red"){
            gl.uniform4f(uColor, 1.0, 0.0 ,0.0, 1.0);
        }
        else if (selectedColor === "green"){
            gl.uniform4f(uColor, 0.0, 1.0 ,0.0, 1.0);
            
        }
        else if (selectedColor === "blue"){
            gl.uniform4f(uColor, 0.0, 0.0 ,1.0, 1.0);
            
        }
        else if (selectedColor === "yellow"){
            gl.uniform4f(uColor, 1.0, 1.0 ,0.0, 1.0);
            
        }

        render();
    });

    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", function() {
        subdivisionCount = 2;

        divisionSlider.value = 2;
        divisionvalue.textContent = 2;

        colorMenu.value = "red";

        gl.uniform4f(
            uColor,
            1.0, 0.0, 0.0, 1.0
        );

        updateCarpet();
        render();
    });

    const vPosition = gl.getAttribLocation(program, "vPosition");

    gl.vertexAttribPointer(
        vPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(vPosition);

    uColor = gl.getUniformLocation(program, "uColor");

    gl.uniform4f(
        uColor,
        1.0, 0.0, 0.0, 1.0
    );

};


async function loadShaderSource(fileName) {

    const response = await fetch(fileName);

    const source = await response.text();

    return source;
}


function createShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function square(a,b,c,d){
    points.push(a);
    points.push(b);
    points.push(c);

    points.push(a);
    points.push(c);
    points.push(d);
}

function divideSquare(a,b,c,d,count){
    if(count === 0){
        square(a,b,c,d);
        return;
    }
    const dx = (b[0] - a[0]) / 3;
    const dy = (a[1] - d[1]) / 3;

    for (let row = 0; row < 3; row++){
        for(let col = 0; col<3 ; col++){
            if(row === 1 && col === 1){
                continue;
            }
                const left = a[0] + col * dx;
                const top = a[1] - row * dy;

                const p1 = [left,      top];
                const p2 = [left + dx, top];
                const p3 = [left + dx, top- dy];
                const p4 = [left, top - dy];


                divideSquare(p1,p2,p3,p4,count-1);
            
        }
    }
}
function updateCarpet(){
    points = [];

    divideSquare(
        a,
        b,
        c,
        d,
        subdivisionCount
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(points.flat()),
        gl.STATIC_DRAW
    )
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        points.length
    );
}