var PIXI;

if(typeof require === 'function') {
  PIXI = require('pixi.js');
} else {
  PIXI = window.PIXI;
}

var PaletteFilter = function(palette) {
  var fragmentShader = [
    'precision lowp float;',

    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',

    'uniform sampler2D uSampler;',

    'const int TOTAL_COLORS = ' + palette.length + ';',
    'uniform vec3 palette[' + palette.length + '];',

    'vec4 nearestColor(vec4 color) {',
    '  float bestDot = 1.1;',
    '  float currentDot = 0.0;',
    '  vec3 colorDelta = vec3(0.0, 0.0, 0.0);',
    '  vec3 nearest = vec3(0.0, 0.0, 0.0);',
    '  for(int i = 0; i < TOTAL_COLORS; i++) {',
    '    colorDelta = color.xyz - palette[i];',
    '    currentDot = dot(colorDelta, colorDelta);',
    '    if(currentDot < bestDot) {',
    '      bestDot = currentDot;',
    '      nearest = palette[i];',
    '    }',
    '  }',
    '  return vec4(nearest, color.w);',
    '}',

    'void main(void){',
    '   vec4 rawColor = texture2D(uSampler, vTextureCoord) * vColor ;',
    '   gl_FragColor = nearestColor(rawColor);',
    '}'
  ].join('\n');


  var uniforms = {
    palette: {
      type: 'v3v',
      value: palette.map(this._cssColorToVector) 
    }
  };

  PIXI.AbstractFilter.call(this, null, fragmentShader, uniforms);
};

PaletteFilter.prototype = Object.create(PIXI.AbstractFilter.prototype); 
PaletteFilter.prototype.constructor = PaletteFilter;
PaletteFilter.prototype._cssColorToVector = function(color) {
  return {
    x: parseInt(color.substring(1, 3), 16) / 256,
    y: parseInt(color.substring(3, 5), 16) / 256,
    z: parseInt(color.substring(5, 7), 16) / 256
  };
};

Object.defineProperties(PaletteFilter.prototype, {
  palette: {
    get: function() {
      return this.uniforms.palette.value;
    },
    set: function(palette) {
      this.uniforms.palette.value = palette.map(this._cssColorToVector);
    }
  }
});

// Some palettes to play with
PaletteFilter.BLUE = ['#000', '#F8F8F8', '#F8D878', '#0078F8', '#81BEFF'];
PaletteFilter.PINK = ['#000', '#F8F8F8', '#F8D878', '#F80099', '#FF81FB'];

if(typeof module === 'undefined') {
  window.PaletteFilter = PaletteFilter;
} else {
  module.exports = PaletteFilter;
}
