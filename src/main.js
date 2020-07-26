/* global mat4, vec3 */

"use strict";

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
        projection: gl.getUniformLocation(program, "projection"),
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

function setGl(canvas, gl, shaders) {
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
    gl.scissor(viewport.offset.x,
               viewport.offset.y,
               viewport.width,
               viewport.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(shaders.program);
    gl.uniformMatrix4fv(shaders.uniform.projection, false, projection);
    gl.enableVertexAttribArray(shaders.positionAttribute);
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
    mat4.translate(transform, transform, vec3.fromValues(0.0, 0.0, 0.0));
    mat4.rotateZ(transform, transform, 0.2);
    mat4.scale(transform, transform, vec3.fromValues(5.0, 5.0, 1.0));
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
    mat4.translate(transform, transform, vec3.fromValues(0.0, 0.0, 0.0));
    mat4.rotateZ(transform, transform, -0.785);
    mat4.scale(transform, transform, vec3.fromValues(2.0, 2.0, 1.0));
    var color = {
        red: 0.25,
        green: 0.65,
        blue: 0.875,
        alpha: 1.0,
    };
    draw(gl, shaders, color, transform);
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    var shaders = getShaders(gl, getVertexBuffer(gl));
    setGl(canvas, gl, shaders);
    drawRect1(gl, shaders);
    drawRect2(gl, shaders);
    console.log("Done!");
};
