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

function getColorArray(red, green, blue, alpha) {
    return new Float32Array([red, green, blue, alpha]);
}

function getTransform(x, y, width, height, rotate) {
    var transform = mat4.create();
    mat4.translate(transform, transform, vec3.fromValues(x, y, 0.0));
    mat4.scale(transform, transform, vec3.fromValues(width, height, 1.0));
    mat4.rotateZ(transform, transform, rotate);
    return transform;
}

function draw(gl, shaders, transform, color) {
    gl.uniform4fv(shaders.uniform.color, color);
    gl.uniformMatrix4fv(shaders.uniform.transform, false, transform);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    setVertexBuffer(gl);
    var shaders = getShaders(gl);
    setGl(canvas, gl, shaders);
    draw(gl,
         shaders,
         getTransform(0.0, 0.0, 2.5, 2.5, 0.2),
         getColorArray(0.25, 0.875, 0.65, 1.0));
    draw(gl,
         shaders,
         getTransform(0.0, 0.0, 1.0, 1.0, -0.785),
         getColorArray(0.25, 0.65, 0.875, 1.0));
    console.log("Done!");
};
