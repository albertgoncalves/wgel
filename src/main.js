/* global mat4, vec3 */

"use strict";

var VIEWPORT = {
    offset: {
        x: 0.0,
        y: 0.0,
    },
    width: undefined,
    height: undefined,
};
var WORLD_SPACE = {
    center: {
        x: 0.0,
        y: 0.0,
    },
    width: 10.0,
    height: undefined,
    halfWidth: undefined,
    halfHeight: undefined,
    cameraDistance: 1.0,
};
var VERTICES = new Float32Array([
    1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
]);
var BACKGROUND_COLOR = {
    red: 0.85,
    green: 0.85,
    blue: 0.85,
    alpha: 1.0,
};
var SPEED_MOVE = 0.085;
var SPEED_ROTATE = 0.005;
var FPS = 60.0;
var STATE = {
    alive: true,
    currentTime: 0.0,
    previousTime: 0.0,
    elapsedTime: 0.0,
    lagTime: 0.0,
    msPerFrame: 1000.0 / FPS,
    keyDown: new Array(MAX_KEY_CODE),
    objects: [
        {
            rect: {
                x: 0.0,
                y: 0.0,
                width: 1.0,
                height: 1.0,
                rotate: (Math.PI * 2.0) - 0.785,
            },
            color: new Float32Array([0.25, 0.65, 0.875, 1.0])
        },
        {
            rect: {
                x: 0.0,
                y: 0.0,
                width: 2.5,
                height: 2.5,
                rotate: 0.2,
            },
            color: new Float32Array([0.25, 0.875, 0.65, 1.0])
        },
    ],
    transform: mat4.create(),
};
var KEY_CODE = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
};
var MAX_KEY_CODE = 256;

function setGlobals(canvas) {
    VIEWPORT.width = canvas.width - (VIEWPORT.offset.x * 2.0);
    VIEWPORT.height = canvas.height - (VIEWPORT.offset.y * 2.0);
    WORLD_SPACE.height =
        WORLD_SPACE.width / (VIEWPORT.width / VIEWPORT.height);
    WORLD_SPACE.halfWidth = WORLD_SPACE.width / 2.0;
    WORLD_SPACE.halfHeight = WORLD_SPACE.height / 2.0;
    STATE.keyDown.fill(false);
}

function getCompiledShader(gl, id, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader,
                    document.getElementById(id).firstChild.textContent);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function setVertexBuffer(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
}

function getShaders(gl) {
    var program = gl.createProgram();
    gl.attachShader(program,
                    getCompiledShader(gl, "vertex", gl.VERTEX_SHADER));
    gl.attachShader(program,
                    getCompiledShader(gl, "fragment", gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    var uniform = {
        color: gl.getUniformLocation(program, "color"),
        transform: gl.getUniformLocation(program, "transform"),
        projection: gl.getUniformLocation(program, "projection"),
    };
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }
    var positionAttribute = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    return {
        positionAttribute: positionAttribute,
        program: program,
        uniform: uniform,
    };
}

function setGl(canvas, gl, shaders) {
    var lookAt = mat4.create();
    mat4.lookAt(lookAt,
                [
                    WORLD_SPACE.center.x,
                    WORLD_SPACE.center.y,
                    WORLD_SPACE.cameraDistance
                ],
                [WORLD_SPACE.center.x, WORLD_SPACE.center.y, 0.0],
                [0.0, 1.0, 0.0]);
    var ortho = mat4.create();
    mat4.ortho(ortho,
               -WORLD_SPACE.halfWidth,
               WORLD_SPACE.halfWidth,
               -WORLD_SPACE.halfHeight,
               WORLD_SPACE.halfHeight,
               0.0,
               WORLD_SPACE.cameraDistance);
    var projection = mat4.create();
    mat4.multiply(projection, ortho, lookAt);
    gl.viewport(VIEWPORT.offset.x,
                VIEWPORT.offset.y,
                VIEWPORT.width,
                VIEWPORT.height);
    gl.clearColor(BACKGROUND_COLOR.red,
                  BACKGROUND_COLOR.green,
                  BACKGROUND_COLOR.blue,
                  BACKGROUND_COLOR.alpha);
    gl.useProgram(shaders.program);
    gl.uniformMatrix4fv(shaders.uniform.projection, false, projection);
    gl.enableVertexAttribArray(shaders.positionAttribute);
}

function setTransform(rect) {
    mat4.identity(STATE.transform);
    mat4.translate(STATE.transform,
                   STATE.transform,
                   vec3.fromValues(rect.x, rect.y, 0.0));
    mat4.scale(STATE.transform,
               STATE.transform,
               vec3.fromValues(rect.width, rect.height, 1.0));
    mat4.rotateZ(STATE.transform, STATE.transform, rect.rotate);
}

function update() {
    for (var i = STATE.objects.length - 1; 0 <= i; --i) {
        STATE.objects[i].rect.rotate += SPEED_ROTATE * (i + 1);
        if (STATE.keyDown[KEY_CODE.up] || STATE.keyDown[KEY_CODE.i]) {
            STATE.objects[i].rect.y += SPEED_MOVE;
        }
        if (STATE.keyDown[KEY_CODE.down] || STATE.keyDown[KEY_CODE.k]) {
            STATE.objects[i].rect.y -= SPEED_MOVE;
        }
        if (STATE.keyDown[KEY_CODE.left] || STATE.keyDown[KEY_CODE.j]) {
            STATE.objects[i].rect.x -= SPEED_MOVE;
        }
        if (STATE.keyDown[KEY_CODE.right] || STATE.keyDown[KEY_CODE.l]) {
            STATE.objects[i].rect.x += SPEED_MOVE;
        }
    }
}

function draw(gl, shaders) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = STATE.objects.length - 1; 0 <= i; --i) {
        setTransform(STATE.objects[i].rect);
        gl.uniformMatrix4fv(shaders.uniform.transform, false, STATE.transform);
        gl.uniform4fv(shaders.uniform.color, STATE.objects[i].color);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function keyDown(event) {
    STATE.keyDown[event.keyCode] = true;
}

function keyUp(event) {
    STATE.keyDown[event.keyCode] = false;
}

function loop(gl, shaders) {
    return function(t) {
        if (STATE.alive) {
            STATE.currentTime = t;
            STATE.elapsedTime = STATE.currentTime - STATE.previousTime;
            STATE.previousTime = STATE.currentTime;
            STATE.lagTime += STATE.elapsedTime;
            while (STATE.alive && (STATE.msPerFrame <= STATE.lagTime)) {
                update();
                STATE.lagTime -= STATE.msPerFrame;
            }
            draw(gl, shaders);
            requestAnimationFrame(loop(gl, shaders));
        }
    };
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    setGlobals(canvas);
    var gl = canvas.getContext("webgl");
    setVertexBuffer(gl);
    var shaders = getShaders(gl);
    setGl(canvas, gl, shaders);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    requestAnimationFrame(loop(gl, shaders));
    console.log("Done!");
};
