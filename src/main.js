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

function setGl(gl, shaders) {
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    /* NOTE: `viewport` -> `560` by `400` */
    gl.viewport(40.0, 40.0, 560.0, 400.0);
    gl.scissor(40.0, 40.0, 560.0, 400.0);
    gl.enable(gl.SCISSOR_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(shaders.program);
    var lookAt = mat4.create();
    mat4.lookAt(lookAt,             // NOTE:
                [20.0, 60.0, 10.0], //  camera position
                [20.0, 60.0, 0.0],  //  look-at position
                [0.0, 1.0, 0.0]);   //  orientation
    var ortho = mat4.create();
    /* NOTE: `World Space` -> `14` by `10` */
    mat4.ortho(ortho,   // NOTE:
               -7.0,    //  distance to left of `World Space`
               7.0,     //  distance to right of `World Space`
               -5.0,    //  distance to bottom of `World Space`
               5.0,     //  distance to top of `World Space`
               0.0,     //  z-distance to near plane
               1000.0); //  z-distance to far plane
    var projection = mat4.create();
    mat4.multiply(projection, ortho, lookAt);
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
    mat4.translate(transform, transform, vec3.fromValues(20.0, 60.0, 0.0));
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
    mat4.translate(transform, transform, vec3.fromValues(20.0, 60.0, 0.0));
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
    var gl = document.getElementById("canvas").getContext("webgl");
    var shaders = getShaders(gl, getVertexBuffer(gl));
    setGl(gl, shaders);
    drawRect1(gl, shaders);
    drawRect2(gl, shaders);
    console.log("Done!");
};
