function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

var gl; //contexte
var program;
var pointsPositions = []; 
var colorsArray = []; 
var buffer, pos, size, color, bufferColor, perspective, rotation, translation;
var canvas, canvasH, canvasW;

var perscaleMatrix = mat4.create(); //perspection
var scaleMatrix = mat4.identity(mat4.create()); //scale
var translationMatrix = mat4.identity(mat4.create()); //translation
var rMatrix = mat4.identity(mat4.create()); //rotation

var rRotateX = document.querySelector("#rotateX");
var rRotateY = document.querySelector("#rotateY");
var rRotateZ = document.querySelector("#rotateZ");

var rTranslateX = document.querySelector("#translateX");
var rTranslateY = document.querySelector("#translateY");
var rTranslateZ = document.querySelector("#translateZ");

var rangeFOV = document.querySelector("#fov");
var rangeScale = document.querySelector("#zoom");
var parts = document.querySelectorAll(".part");

var currentPos = {
    rotateX : 0.00,
    rotateY : 0.00,
    rotateZ : 0.00,
    translateX : 0.00,
    translateY : 0.00,
    translateZ : 0.00,
    fov: 75,
    scale: 1.0
};

function initContext() {
    canvas = document.getElementById('canvas');
    canvasH = canvas.clientHeight;
    canvasW = canvas.clientWidth;
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('ERREUR : echec chargement du contexte');
        return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    mat4.perspective(perscaleMatrix, currentPos.fov * Math.PI / 180, canvasW/canvasH, 0.1, 100.0);
}

//Initialisation des shaders
function initShaders() {
    var top = -0.5;
    var bot = 0.5;
    var left = -0.5;
    var right = 0.5;
    var front = 0.5;
    var back = -0.5;
    pointsPositions = [ //TRIANGLE 1 
                        top, left, back,    //haut gauche derriere
                        bot, left, back,    //bas gauche derriere
                        top, right, back,   //haut droite derriere

                        //TRIANGLE 2 
                        bot, right, back,   //bas droite derriere
                        bot, left, back,    //bas gauche derriere
                        top, right, back,   //haut droite derriere

                        //TRIANGLE 3 
                        bot, right, front,  //bas droite devant
                        top, right, front,  //haut droite devant
                        top, right, back,   //haut droite derriere

                        //TRIANGLE 4
                        bot, right, front,  //bas droite devant
                        top, right, back,   //haut droite derriere
                        bot, right, back,   //bas droite derriere

                        //TRIANGLE 5 
                        top, left, front,   //haut gauche devant
                        bot, left, front,  //bas gauche devant
                        top, left, back,   //haut gauche derriere

                        //TRIANGLE 6 
                        top, left, back,   //haut gauche derriere
                        bot, left, back,  //haut gauche devant
                        bot, left, front,  //bas gauche devant

                        //TRIANGLE 7 
                        top, left, front,  //haut gauche devant
                        top, right, back,  //haut droite fond
                        top, right, front, //haut droite devant

                        //TRIANGLE 8
                        top, left, front,  //haut gauche devant
                        top, right, back, //haut droite devant
                        top, left, back, //haut gauche fond
                        
                        //TRIANGLE 9
                        bot, right, front,  //bas droite devant
                        bot, left, front, //bas gauche devant
                        bot, right, back, //bas droite derriere

                        //TRIANGLE 10
                        bot, right, back, //bas droite derriere
                        bot, left, front, //bas gauche devant
                        bot, left, back,  //bas gauche derriere

                        //TRIANGLE 11 
                        top, left, front,   //haut gauche devant
                        bot, left, front,  //bas gauche devant
                        top, right, front,    //haut droite devant

                        //TRIANGLE 12
                        bot, right, front,   //bas droite devant
                        top, right, front,    //haut droite devant
                        bot, left, front    //bas gauche devant
    ];
   
    color1 = Math.random();
    color2 = Math.random();
    color3 = Math.random();
    color4 = Math.random();
    color5 = Math.random();
    color6 = Math.random();
    color7 = Math.random();

    colorsArray = [
                    //TRIANGLE 1 arriere
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,

                    //TRIANGLE 2 arriere 
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,
                    color1, color3, color5, 1,

                    //TRIANGLE 3 droite
                    color2, color3, color4, 1,
                    color2, color3, color4, 1,
                    color2, color3, color4, 1,

                    //TRIANGLE 4 droite
                    color2, color3, color4, 1,
                    color2, color3, color4, 1,
                    color2, color3, color4, 1,

                    //TRIANGLE 5 gauche 
                    color1, color5, color7, 1,
                    color1, color5, color7, 1,
                    color1, color5, color7, 1,

                    //TRIANGLE 6 gauche 
                    color1, color5, color7, 1,
                    color1, color5, color7, 1,
                    color1, color5, color7, 1,
                    
                    //TRIANGLE 7 haut
                    color2, color1, color6, 1,
                    color2, color1, color6, 1,
                    color2, color1, color6, 1,

                    //TRIANGLE 8 haut
                    color2, color1, color6, 1,
                    color2, color1, color6, 1,
                    color2, color1, color6, 1,

                    //TRIANGLE 9 bas
                    color3, color6, color2, 1,
                    color3, color6, color2, 1,
                    color3, color6, color2, 1,

                    //TRIANGLE 10 bas
                    color3, color6, color2, 1,
                    color3, color6, color2, 1,
                    color3, color6, color2, 1,

                    //TRIANGLE 11 devant
                    color4, color1, color7, 1,
                    color4, color1, color7, 1,
                    color4, color1, color7, 1,

                    //TRIANGLE 12 devant
                    color4, color1, color7, 1,
                    color4, color1, color7, 1,
                    color4, color1, color7, 1
    ]


    var fragmentSource = loadText('fragment.glsl');
    var vertexSource = loadText('vertex.glsl');

    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSource);
    gl.compileShader(fragment);

    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSource);
    gl.compileShader(vertex);

    gl.getShaderParameter(fragment, gl.COMPILE_STATUS);
    gl.getShaderParameter(vertex, gl.COMPILE_STATUS);

    program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, vertex);
    gl.linkProgram(program);
    gl.useProgram(program);

}

function toggleSelected(element) {
    element.target.classList.toggle("selected");
}

function initEvents() {
    parts.forEach((e) => {
        e.addEventListener("click", (elem) => {
            toggleSelected(elem);
        })
    })

    rRotateX.addEventListener("input", (e) => {
        mat4.rotateX(rMatrix, rMatrix, +(e.target.valueAsNumber - currentPos.rotateX).toFixed(2));
        currentPos.rotateX = e.target.valueAsNumber;
        refreshBuffers();
    });
    rRotateY.addEventListener("input", (e) => {
        mat4.rotateY(rMatrix, rMatrix, +(e.target.valueAsNumber - currentPos.rotateY).toFixed(2));
        currentPos.rotateY = e.target.valueAsNumber;
        refreshBuffers();
    });
    rRotateZ.addEventListener("input", (e) => {
        mat4.rotateZ(rMatrix, rMatrix, +(e.target.valueAsNumber - currentPos.rotateZ).toFixed(2));
        currentPos.rotateZ = e.target.valueAsNumber;
        refreshBuffers();
    });
    rTranslateX.addEventListener("input", (e) => {
        mat4.translate(translationMatrix, translationMatrix, [0, +(e.target.valueAsNumber - currentPos.translateX).toFixed(2), 0]);
        currentPos.translateX = e.target.valueAsNumber;
        refreshBuffers();
    });
    rTranslateY.addEventListener("input", (e) => {
        mat4.translate(translationMatrix, translationMatrix, [+(e.target.valueAsNumber - currentPos.translateY).toFixed(2), 0, 0]);
        currentPos.translateY = e.target.valueAsNumber;
        refreshBuffers();
    });
    rTranslateZ.addEventListener("input", (e) => {
        mat4.translate(translationMatrix, translationMatrix, [0, 0, +(e.target.valueAsNumber - currentPos.translateZ).toFixed(2)]);
        currentPos.translateZ = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeScale.addEventListener("input", (e) => {
        mat4.scale(scaleMatrix, scaleMatrix, [1 + (e.target.valueAsNumber - currentPos.scale), 1 + (e.target.valueAsNumber - currentPos.scale), 1 + (e.target.valueAsNumber - currentPos.scale)]);
        currentPos.scale = e.target.valueAsNumber;
        refreshBuffers();
    });

    rangeFOV.addEventListener("input", (e) => {

        mat4.perspective(perscaleMatrix, e.target.valueAsNumber * Math.PI / 180, canvasW/canvasH, 0.1, 100.0);
        mat4.translate(perscaleMatrix, perscaleMatrix, [0, 0, -2]);
        currentPos.fov = e.target.valueAsNumber;
        refreshBuffers();
    });
}
function rotationY(rotation){
    mat4.rotateY(rMatrix, rMatrix, (((rotation - 50) / 10) - currentPos).toFixed(2));
    currentPos = ((rotation - 50) / 10);
}

//TODO
//Initialisation des buffers
function initBuffers() {
    buffer = gl.createBuffer();
    bufferColor = gl.createBuffer();
    
    pos = gl.getAttribLocation(program, "position");
    color = gl.getAttribLocation(program, "color");

    perspective = gl.getUniformLocation(program, "perspective");
    translation = gl.getUniformLocation(program, "translation");
    rotation = gl.getUniformLocation(program, "rotation");
    scale = gl.getUniformLocation(program, "scale");
    size = 3;

    gl.enableVertexAttribArray(pos);
    gl.enableVertexAttribArray(color);
    mat4.translate(perscaleMatrix, perscaleMatrix, [0, 0, -2]);

    refreshBuffers()
}

//TODO
//Mise a jour des buffers : necessaire car les coordonnees des points sont ajoutees a chaque clic
function refreshBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsPositions), gl.STATIC_DRAW)
    gl.vertexAttribPointer(pos, size, gl.FLOAT, true, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsArray), gl.STATIC_DRAW)
    gl.vertexAttribPointer(color, 4, gl.FLOAT, true, 0, 0);

    gl.uniformMatrix4fv(translation, false, translationMatrix);
    gl.uniformMatrix4fv(rotation, false, rMatrix);
    gl.uniformMatrix4fv(perspective, false, perscaleMatrix);
    gl.uniformMatrix4fv(scale, false, scaleMatrix);
    draw();
}

function refreshColor(color) {

    for(i = 0; i < 24; i = i+4){
        colorsArray[120 + i] = color.r / 255;
        colorsArray[121 + i] = color.g / 255;
        colorsArray[122 + i] = color.b / 255;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsArray), gl.STATIC_DRAW);
    draw();
}

function resetPosition(){
    mat4.rotateZ(rMatrix, rMatrix, -currentPos.rotateZ)
    mat4.rotateY(rMatrix, rMatrix, -currentPos.rotateY)
    mat4.rotateX(rMatrix, rMatrix, -currentPos.rotateX)
    mat4.translate(translationMatrix, translationMatrix, [-currentPos.translateX, -currentPos.translateY, -currentPos.translateZ]);
    currentPos.rotateX = 0.0;
    currentPos.rotateY = 0.0;
    currentPos.rotateZ = 0.0;
    currentPos.translateX = 0.0;
    currentPos.translateY = 0.0;
    currentPos.translateZ = 0.0;
    updateRange();
    refreshBuffers();
}

function updateRange(){
    rRotateX.value = currentPos.rotateX;
    rRotateY.value = currentPos.rotateY;
    rRotateZ.value = currentPos.rotateZ;
    rTranslateX.value = currentPos.translateX;
    rTranslateY.value = currentPos.translateY;
    rTranslateZ.value = currentPos.translateZ;
}

//TODO
//Fonction permettant le dessin dans le canvas
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointsPositions.length/size);
}


function main() {
    initContext();
    initShaders();
    initBuffers();
    initEvents();
}
