/* global mat4, vec3 */

"use strict";

var TAU = Math.PI * 2.0;
var KEY_CODE = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
};
var MAX_KEY_CODE = 256;

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
    var vertices = new Float32Array([
        1.0,
        1.0,
        0.0,
        -1.0,
        1.0,
        0.0,
        1.0,
        -1.0,
        0.0,
        -1.0,
        -1.0,
        0.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
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
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
    return {
        positionAttribute: positionAttribute,
        program: program,
        uniform: uniform,
    };
}

function setGl(canvas, gl, shaders, color) {
    var viewport = {
        offset: {
            x: 20.0,
            y: 20.0,
        },
    };
    viewport.width = canvas.width - (viewport.offset.x * 2.0);
    viewport.height = canvas.height - (viewport.offset.y * 2.0);
    var worldSpace = {
        width: 10.0,
        center: {
            x: 0.0,
            y: 0.0,
        },
        cameraDistance: 1.0,
    };
    worldSpace.height = worldSpace.width / (viewport.width / viewport.height);
    worldSpace.halfWidth = worldSpace.width / 2.0;
    worldSpace.halfHeight = worldSpace.height / 2.0;
    var lookAt = mat4.create();
    mat4.lookAt(
        lookAt,
        [worldSpace.center.x, worldSpace.center.y, worldSpace.cameraDistance],
        [worldSpace.center.x, worldSpace.center.y, 0.0],
        [0.0, 1.0, 0.0]);
    var ortho = mat4.create();
    mat4.ortho(ortho,
               -worldSpace.halfWidth,
               worldSpace.halfWidth,
               -worldSpace.halfHeight,
               worldSpace.halfHeight,
               0.0,
               worldSpace.cameraDistance);
    var projection = mat4.create();
    mat4.multiply(projection, ortho, lookAt);
    gl.viewport(viewport.offset.x,
                viewport.offset.y,
                viewport.width,
                viewport.height);
    gl.clearColor(color.red, color.green, color.blue, color.alpha);
    gl.useProgram(shaders.program);
    gl.uniformMatrix4fv(shaders.uniform.projection, false, projection);
    gl.enableVertexAttribArray(shaders.positionAttribute);
}

function getColorArray(red, green, blue, alpha) {
    return new Float32Array([red, green, blue, alpha]);
}

function getTransform(rect) {
    var transform = mat4.create();
    mat4.translate(transform, transform, vec3.fromValues(rect.x, rect.y, 0.0));
    mat4.scale(transform,
               transform,
               vec3.fromValues(rect.width, rect.height, 1.0));
    mat4.rotateZ(transform, transform, rect.rotate);
    return transform;
}

function update(state, objects) {
    for (var i = objects.length - 1; 0 <= i; --i) {
        objects[i].rect.rotate += 0.005 * (i + 1);
        if (state.keyDown[KEY_CODE.up]) {
            objects[i].rect.y += 0.05;
        }
        if (state.keyDown[KEY_CODE.down]) {
            objects[i].rect.y -= 0.05;
        }
        if (state.keyDown[KEY_CODE.left]) {
            objects[i].rect.x -= 0.05;
        }
        if (state.keyDown[KEY_CODE.right]) {
            objects[i].rect.x += 0.05;
        }
    }
}

function draw(gl, shaders, objects) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = objects.length - 1; 0 <= i; --i) {
        gl.uniform4fv(shaders.uniform.color, objects[i].color);
        gl.uniformMatrix4fv(shaders.uniform.transform,
                            false,
                            getTransform(objects[i].rect));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function keyDown(state) {
    return function(event) {
        state.keyDown[event.keyCode] = true;
    };
}

function keyUp(state) {
    return function(event) {
        state.keyDown[event.keyCode] = false;
    };
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    setVertexBuffer(gl);
    var shaders = getShaders(gl);
    setGl(canvas, gl, shaders, {
        red: 0.85,
        green: 0.85,
        blue: 0.85,
        alpha: 1.0,
    });
    var state = {
        fps: 60.0,
        alive: true,
        currentTime: Date.now(),
        previousTime: Date.now(),
        elapsedTime: 0.0,
        lagTime: 0.0,
        keyDown: new Array(MAX_KEY_CODE),
    };
    state.keyDown.fill(false);
    state.msPerFrame = 1000.0 / state.fps;
    window.addEventListener("keydown", keyDown(state));
    window.addEventListener("keyup", keyUp(state));
    var objects = [
        {
            rect: {
                x: 0.0,
                y: 0.0,
                width: 1.0,
                height: 1.0,
                rotate: TAU - 0.785,
            },
            color: getColorArray(0.25, 0.65, 0.875, 1.0),
        },
        {
            rect: {
                x: 0.0,
                y: 0.0,
                width: 2.5,
                height: 2.5,
                rotate: 0.2,
            },
            color: getColorArray(0.25, 0.875, 0.65, 1.0),
        },
    ];
    function loop() {
        if (state.alive) {
            state.currentTime = Date.now();
            state.elapsedTime = state.currentTime - state.previousTime;
            state.previousTime = state.currentTime;
            state.lagTime += state.elapsedTime;
            while (state.alive && (state.msPerFrame <= state.lagTime)) {
                update(state, objects);
                state.lagTime -= state.msPerFrame;
            }
            draw(gl, shaders, objects);
            requestAnimationFrame(loop);
        }
    }
    loop();
    console.log("Done!");
};
