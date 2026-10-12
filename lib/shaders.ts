const v = `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.);}`;
const p = `precision highp float;`;

type ShaderPair = [string, string];

const shaders: Record<string, ShaderPair> = {
  splat: [
    v,
    `${p}
    uniform sampler2D uTarget;
    uniform float aspectRatio, radius;
    uniform vec3 color;
    uniform vec2 point;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / radius) * color, 1.);
    }`,
  ],

  advection: [
    v,
    `${p}
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(dissipation * texture2D(uSource, vUv - dt * texture2D(uVelocity, vUv).xy * texelSize).rgb, 1.);
    }`,
  ],

  divergence: [
    v,
    `${p}
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    varying vec2 vUv;
    vec2 vel(vec2 uv) {
      vec2 e = vec2(1.);
      if (uv.x < 0.) { uv.x = 0.; e.x = -1.; }
      if (uv.x > 1.) { uv.x = 1.; e.x = -1.; }
      if (uv.y < 0.) { uv.y = 0.; e.y = -1.; }
      if (uv.y > 1.) { uv.y = 1.; e.y = -1.; }
      return e * texture2D(uVelocity, uv).xy;
    }
    void main() {
      vec2 L = vUv - vec2(texelSize.x, 0.);
      vec2 R = vUv + vec2(texelSize.x, 0.);
      vec2 T = vUv + vec2(0., texelSize.y);
      vec2 B = vUv - vec2(0., texelSize.y);
      gl_FragColor = vec4(0.5 * (vel(R).x - vel(L).x + vel(T).y - vel(B).y), 0., 0., 1.);
    }`,
  ],

  curl: [
    v,
    `${p}
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    varying vec2 vUv;
    void main() {
      vec2 L = vUv - vec2(texelSize.x, 0.);
      vec2 R = vUv + vec2(texelSize.x, 0.);
      vec2 T = vUv + vec2(0., texelSize.y);
      vec2 B = vUv - vec2(0., texelSize.y);
      gl_FragColor = vec4(
        texture2D(uVelocity, R).y - texture2D(uVelocity, L).y -
        texture2D(uVelocity, T).x + texture2D(uVelocity, B).x,
        0., 0., 1.
      );
    }`,
  ],

  vorticity: [
    v,
    `${p}
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform vec2 texelSize;
    uniform float curlStrength;
    uniform float dt;
    varying vec2 vUv;
    void main() {
      vec2 L = vUv - vec2(texelSize.x, 0.);
      vec2 R = vUv + vec2(texelSize.x, 0.);
      vec2 T = vUv + vec2(0., texelSize.y);
      vec2 B = vUv - vec2(0., texelSize.y);
      vec2 f = normalize(vec2(
        abs(texture2D(uCurl, T).x) - abs(texture2D(uCurl, B).x),
        abs(texture2D(uCurl, R).x) - abs(texture2D(uCurl, L).x)
      ) + 0.0001) * curlStrength * texture2D(uCurl, vUv).x;
      gl_FragColor = vec4(texture2D(uVelocity, vUv).xy + f * dt, 0., 1.);
    }`,
  ],

  pressure: [
    v,
    `${p}
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 texelSize;
    varying vec2 vUv;
    void main() {
      vec2 L = clamp(vUv - vec2(texelSize.x, 0.), 0., 1.);
      vec2 R = clamp(vUv + vec2(texelSize.x, 0.), 0., 1.);
      vec2 T = clamp(vUv + vec2(0., texelSize.y), 0., 1.);
      vec2 B = clamp(vUv - vec2(0., texelSize.y), 0., 1.);
      gl_FragColor = vec4(
        (texture2D(uPressure, L).x +
         texture2D(uPressure, R).x +
         texture2D(uPressure, T).x +
         texture2D(uPressure, B).x -
         texture2D(uDivergence, vUv).x) * 0.25,
        0., 0., 1.
      );
    }`,
  ],

  gradientSubtract: [
    v,
    `${p}
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    varying vec2 vUv;
    void main() {
      float pL = texture2D(uPressure, clamp(vUv - vec2(texelSize.x, 0.), 0., 1.)).x;
      float pR = texture2D(uPressure, clamp(vUv + vec2(texelSize.x, 0.), 0., 1.)).x;
      float pT = texture2D(uPressure, clamp(vUv + vec2(0., texelSize.y), 0., 1.)).x;
      float pB = texture2D(uPressure, clamp(vUv - vec2(0., texelSize.y), 0., 1.)).x;
      gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(pR - pL, pT - pB), 0., 1.);
    }`,
  ],

  clear: [
    v,
    `${p}
    uniform sampler2D uTexture;
    uniform float value;
    varying vec2 vUv;
    void main() {
      gl_FragColor = value * texture2D(uTexture, vUv);
    }`,
  ],

  display: [
    v,
    `${p}
    uniform sampler2D uTexture;
    uniform float threshold;
    uniform float edgeSoftness;
    uniform vec3 inkColor;
    varying vec2 vUv;
    void main() {
      float d = clamp(length(texture2D(uTexture, vUv).rgb), 0., 1.);
      float softness = max(edgeSoftness, 0.01);
      float a = smoothstep(threshold - softness * 0.5, threshold + softness * 0.5, d);
      gl_FragColor = vec4(inkColor, a);
    }`,
  ],
};

export default shaders;