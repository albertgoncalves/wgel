"use strict";

var CANVAS, GL;

function setGl() {
    CANVAS = document.getElementById("canvas");
    GL = CANVAS.getContext("webgl");
    GL.clearColor(0.25, 0.875, 0.65, 1.0);
}

function getCompiledShader(id, type) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader,
                    document.getElementById(id).firstChild.textContent);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        console.error(GL.getShaderInfoLog(shader));
    }
    return shader;
}

function getVertexBuffer() {
    var vertices = new Float32Array([
        0.5,
        0.5,
        0.0,
        -0.5,
        0.5,
        0.0,
        0.5,
        -0.5,
        0.0,
        -0.5,
        -0.5,
        0.0,
    ]);
    var vertexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW);
    return vertexBuffer;
}

function getShaders(vertexBuffer) {
    var program = GL.createProgram();
    GL.attachShader(program, getCompiledShader("vertex", GL.VERTEX_SHADER));
    GL.attachShader(program,
                    getCompiledShader("fragment", GL.FRAGMENT_SHADER));
    GL.linkProgram(program);
    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) {
        console.error(GL.getProgramInfoLog(program));
    }
    var positionAttribute = GL.getAttribLocation(program, "position");
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.vertexAttribPointer(positionAttribute, 3, GL.FLOAT, false, 0, 0);
    return {
        positionAttribute: positionAttribute,
        program: program,
    };
}

function draw(shaders) {
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.useProgram(shaders.program);
    GL.enableVertexAttribArray(shaders.positionAttribute);
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
}

window.onload = function() {
    setGl();
    draw(getShaders(getVertexBuffer()));
    console.log("Done!");
};
