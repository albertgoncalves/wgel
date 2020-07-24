"use strict";

var GL;

function getCompiledShader(id, type) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader,
                    document.getElementById(id).firstChild.textContent);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        console.error(GL.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    GL = canvas.getContext("webgl");
    GL.clearColor(0.25, 0.875, 0.65, 1.0);
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
    var vertexShader = getCompiledShader("vertex", GL.VERTEX_SHADER);
    if (vertexShader === null) {
        return;
    }
    var fragmentShader = getCompiledShader("fragment", GL.FRAGMENT_SHADER);
    if (fragmentShader === null) {
        return;
    }
    var program = GL.createProgram();
    GL.attachShader(program, vertexShader);
    GL.attachShader(program, fragmentShader);
    GL.linkProgram(program);
    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) {
        console.error(GL.getProgramInfoLog(program));
        return;
    }
    var positionAttribute = GL.getAttribLocation(program, "position");
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.vertexAttribPointer(positionAttribute, 3, GL.FLOAT, false, 0, 0);
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.useProgram(program);
    GL.enableVertexAttribArray(positionAttribute);
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    console.log("Done!");
};
