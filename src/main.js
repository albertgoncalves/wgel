/* global mat4, vec3 */

"use strict";

function getGl(color) {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(color.red, color.green, color.blue, color.alpha);
    return gl;
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

function getVertexBuffer(gl) {
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
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    return vertexBuffer;
}

function getShaders(gl, vertexBuffer) {
    var program = gl.createProgram();
    gl.attachShader(program,
                    getCompiledShader(gl, "vertex", gl.VERTEX_SHADER));
    gl.attachShader(program,
                    getCompiledShader(gl, "fragment", gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    var uniform = {
        color: gl.getUniformLocation(program, "color"),
        transform: gl.getUniformLocation(program, "transform"),
    };
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }
    var positionAttribute = gl.getAttribLocation(program, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
    return {
        positionAttribute: positionAttribute,
        program: program,
        uniform: uniform,
    };
}

function draw(gl, shaders, color, transform) {
    gl.uniform4fv(shaders.uniform.color, [
        color.red,
        color.green,
        color.blue,
        color.alpha,
    ]);
    gl.uniformMatrix4fv(shaders.uniform.transform, false, transform);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function drawRect1(gl, shaders, transform) {
    var transform = mat4.create();
    mat4.translate(transform, transform, vec3.fromValues(-0.25, 0.25, 0.0));
    mat4.rotateZ(transform, transform, 0.2);
    mat4.scale(transform, transform, vec3.fromValues(1.2, 1.2, 1.0));
    var color = {
        red: 0.25,
        green: 0.875,
        blue: 0.65,
        alpha: 1.0,
    };
    draw(gl, shaders, color, transform);
}

function drawRect2(gl, shaders) {
    var transform = mat4.create();
    mat4.translate(transform, transform, vec3.fromValues(0.25, -0.25, 0.0));
    mat4.rotateZ(transform, transform, -0.785);
    mat4.scale(transform, transform, vec3.fromValues(0.4, 0.4, 1.0));
    var color = {
        red: 0.875,
        green: 0.25,
        blue: 0.65,
        alpha: 1.0,
    };
    draw(gl, shaders, color, transform);
}

window.onload = function() {
    var gl = getGl({
        red: 0.0,
        green: 0.5,
        blue: 0.75,
        alpha: 1.0,
    });
    var shaders = getShaders(gl, getVertexBuffer(gl));
    gl.useProgram(shaders.program);
    gl.enableVertexAttribArray(shaders.positionAttribute);
    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawRect1(gl, shaders);
        drawRect2(gl, shaders);
        requestAnimationFrame(loop);
    }
    loop();
    console.log("Done!");
};
