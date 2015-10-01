
var Buildings = {};

(function() {

  var shader;

  Buildings.initShader = function(options) {
    shader = new glx.Shader({
      vertexShader: SHADERS.buildings.vertex,
      fragmentShader: SHADERS.buildings.fragment,
      attributes: ["aPosition", "aColor", "aNormal", "aIDColor"],
      uniforms: ["uMMatrix", "vpMatrix", "tMatrix", "pMatrix", "uMatrix", "uNormalTransform", "uAlpha", "uLightColor", "uLightDirection", "uFogRadius", "uFogColor", "uRadius", "uDistance", "uHighlightColor", "uHighlightID"]
    });

    this.showBackfaces = options.showBackfaces;
    return this;
  };

  Buildings.render = function(vpMatrix, tMatrix, pMatrix, radius, distance) {
    if (Map.zoom < MIN_ZOOM) {
      return;
    }

//  GL.enable(GL.BLEND);
//  GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
//  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
//  GL.disable(GL.DEPTH_TEST);

    shader.enable();

    if (this.showBackfaces) {
      GL.disable(GL.CULL_FACE);
    }

    // TODO: suncalc
    
    // increased brightness
    GL.uniform3fv(shader.uniforms.uLightColor, [0.65, 0.65, 0.6]);
    
    // adjusted light direction to make shadows more distinct
    GL.uniform3fv(shader.uniforms.uLightDirection, unit(0, 0.5, 1));

    var normalMatrix = glx.Matrix.invert3(new glx.Matrix().data);
    GL.uniformMatrix3fv(shader.uniforms.uNormalTransform, false, glx.Matrix.transpose(normalMatrix));

    GL.uniform1f(shader.uniforms.uFogRadius, 1000);
    //GL.uniform1f(shader.uniforms.uFogRadius, SkyDome.radius);
    
    GL.uniform3fv(shader.uniforms.uFogColor, [Renderer.fogColor.r, Renderer.fogColor.g, Renderer.fogColor.b]);
    
    GL.uniform1f(shader.uniforms.uRadius, radius);
    GL.uniform1f(shader.uniforms.uDistance, distance);
    
    if (!this.highlightColor) {
      this.highlightColor = DEFAULT_HIGHLIGHT_COLOR;
    }
    GL.uniform3fv(shader.uniforms.uHighlightColor, [this.highlightColor.r, this.highlightColor.g, this.highlightColor.b]);

    if (!this.highlightID) {
      this.highlightID = { r:0, g:0, b:0 };
    }
    GL.uniform3fv(shader.uniforms.uHighlightID, [this.highlightID.r, this.highlightID.g, this.highlightID.b]);

    var
      dataItems = data.Index.items,
      item,
      mMatrix, mvp;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      item = dataItems[i];

      if (!(mMatrix = item.getMatrix())) {
        continue;
      }

      GL.uniformMatrix4fv(shader.uniforms.uMMatrix, false, mMatrix.data);
      GL.uniformMatrix4fv(shader.uniforms.vpMatrix, false, vpMatrix.data);
      GL.uniformMatrix4fv(shader.uniforms.tMatrix, false, tMatrix.data);
      GL.uniformMatrix4fv(shader.uniforms.pMatrix, false, pMatrix.data);

      mvp = glx.Matrix.multiply(mMatrix, vpMatrix);
      GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, mvp);

      item.vertexBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aPosition, item.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.normalBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aNormal, item.normalBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.colorBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aColor, item.colorBuffer.itemSize, GL.FLOAT, false, 0, 0);

      item.idColorBuffer.enable();
      GL.vertexAttribPointer(shader.attributes.aIDColor, item.idColorBuffer.itemSize, GL.FLOAT, false, 0, 0);

//      item.visibilityBuffer.enable();
//      GL.vertexAttribPointer(shader.attributes.aHidden, item.visibilityBuffer.itemSize, GL.FLOAT, false, 0, 0);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    }

    if (this.showBackfaces) {
      GL.enable(GL.CULL_FACE);
    }

    shader.disable();
  };

}());
