"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  tileScale?: number;
  gapX?: number;
  gapY?: number;
  offsetX?: number;
  offsetY?: number;
  noiseScale?: number;
  noiseSpeed?: number;
  blurRadius?: number;
  blurMaskStrength?: number;
  noiseContrast?: number;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  noiseOctaves?: number;
  noiseLacunarity?: number;
  noiseGain?: number;
  showNoise?: boolean;
};

const VERT_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = (aPos + 1.0) * 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_SHADER = `
precision mediump float;

uniform sampler2D uTex;
uniform vec2  uRes;
uniform vec2  uTileSize;
uniform vec2  uTileStep;
uniform vec2  uOffset;
uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uNoiseContrast;
uniform float uBlurRadius;
uniform float uBlurMaskStrength;
uniform float uNoiseFrequency;
uniform float uNoiseAmplitude;
uniform float uNoiseOctaves;
uniform float uNoiseLacunarity;
uniform float uNoiseGain;
uniform float uShowNoise;
varying vec2 vUv;

const float PI = 3.14159265358979323846;

// Perlin-style helpers adapted from the provided snippet
// Simple hash used by blurPattern for random rotation
float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float rand(vec2 co, float l){
  return rand(vec2(rand(co), l));
}
float rand(vec2 co, float l, float t){
  return rand(vec2(rand(co, l), t));
}

// Value noise (IQ-style), returns 0..1
float valueNoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
#if 1
  // cubic interpolant
  vec2 u = f*f*(3.0 - 2.0*f);
#else
  // quintic interpolant
  vec2 u = f*f*f*(f*(f*6.0 - 15.0) + 10.0);
#endif
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float fbmCustom(vec2 p){
  float freq = max(uNoiseFrequency, 0.0001);
  float amp = uNoiseAmplitude;
  float sum = 0.0;
  float norm = 0.0;
  for(int i=0;i<8;i++){
    if(float(i) >= uNoiseOctaves) {
      break;
    }
    // Fractal value noise: increase frequency, decrease amplitude
    float n = valueNoise(p * freq);
    sum += amp * n;
    norm += amp;
    freq *= uNoiseLacunarity;
    amp *= uNoiseGain;
  }
  if(norm > 1e-4){
    sum /= norm;
  }
  return sum;
}

float gaussian(float dist, float sigma){
  float r = dist / max(sigma, 1e-3);
  return exp(-0.5 * r * r);
}

vec2 repeatCoord(vec2 coord, vec2 period){
  vec2 frac = fract(coord / period);
  return frac * period;
}

vec4 samplePattern(vec2 coordPx){
  vec2 cell = repeatCoord(coordPx + uOffset, uTileStep);
  if(cell.x > uTileSize.x || cell.y > uTileSize.y){
    return vec4(0.0);
  }
  vec2 uv = cell / uTileSize;
  return texture2D(uTex, uv);
}

vec4 blurPattern(vec2 coordPx, float radiusPx){
  if(radiusPx <= 0.001){
    return samplePattern(coordPx);
  }
  float sigma = max(radiusPx * 0.55, 1.0);
  vec4 acc = vec4(0.0);
  float total = 0.0;

  float centerW = gaussian(0.0, sigma);
  acc += samplePattern(coordPx) * centerW;
  total += centerW;

  const int TAP = 16;
  vec2 poisson[TAP];
  poisson[0] = vec2(-0.326, -0.406);
  poisson[1] = vec2(-0.840, -0.074);
  poisson[2] = vec2(-0.696, 0.457);
  poisson[3] = vec2(-0.203, 0.621);
  poisson[4] = vec2(0.962, -0.195);
  poisson[5] = vec2(0.473, -0.480);
  poisson[6] = vec2(0.519, 0.767);
  poisson[7] = vec2(0.185, -0.893);
  poisson[8] = vec2(0.507, 0.064);
  poisson[9] = vec2(0.896, 0.412);
  poisson[10] = vec2(-0.322, -0.932);
  poisson[11] = vec2(-0.792, -0.598);
  poisson[12] = vec2(-0.198, -0.218);
  poisson[13] = vec2(-0.054, -0.040);
  poisson[14] = vec2(0.421, -0.193);
  poisson[15] = vec2(-0.459, 0.436);

  float angle = hash(coordPx * 0.01) * 6.2831853;
  float cs = cos(angle);
  float sn = sin(angle);
  mat2 rot = mat2(cs, -sn, sn, cs);

  for(int i=0;i<TAP;i++){
    vec2 offsetUnit = rot * poisson[i];
    vec2 offset = offsetUnit * radiusPx;
    float dist = length(offset);
    float w = gaussian(dist, sigma);
    acc += samplePattern(coordPx + offset) * w;
    total += w;
  }

  return acc / max(total, 1e-5);
}

void main(){
  vec2 coord = vUv * uRes;
  float t = uTime * uNoiseSpeed;
  vec2 offsetAnim = vec2(
    sin(t * 0.7) * 0.5 + 0.5,
    cos(t * 0.43) * 0.5 + 0.5
  );
  vec2 noiseCoord = coord * uNoiseScale + offsetAnim * 20.0;
  float n = fbmCustom(noiseCoord);
  float contrasted = clamp((n - 0.5) * uNoiseContrast + 0.5, 0.0, 1.0);
  // Sharpen separation using logistic S-curve (highs get higher, lows get lower)
  float k = 10.0;
  float shaped = 1.0 / (1.0 + exp(-k * (contrasted - 0.5)));
  float mask = clamp(shaped * uBlurMaskStrength, 0.0, 1.0);
  // Bias towards stronger blur in high-mask zones
  float radius = uBlurRadius * pow(mask, 1.5);
  vec4 base = samplePattern(coord);
  vec4 blurred = blurPattern(coord, radius);
  vec4 color = mix(base, blurred, mask);
  // widen grayscale range and keep visualization monochrome (no green/purple tint)
  float wide = clamp((contrasted - 0.5) * 1.8 + 0.5, 0.0, 1.0);
  float brightness = clamp(wide + 0.10 * sin(t * 2.0), 0.0, 1.0);
  vec3 noiseVis = vec3(brightness);
  gl_FragColor = mix(color, vec4(noiseVis, 1.0), uShowNoise);
}
`;

export default function NoisyBlurText({
  src,
  className,
  tileScale = 0.9,
  gapX = 160,
  gapY = 150,
  offsetX = 250,
  offsetY = 220,
  noiseScale = 0.003,
  noiseSpeed = 0.1,
  blurRadius = 4,
  blurMaskStrength = 4,
  noiseContrast = 1, // 노이즈 대비(contrast) 강도. 높일수록 어두움/밝음 차이가 커짐
  noiseFrequency = 1, // fBm 기본 주파수. 높일수록 패턴이 촘촘하고 세밀해짐
  noiseAmplitude = 2, // fBm 기본 진폭. 높일수록 노이즈 영향(세기)이 커짐
  noiseOctaves = 0.1, // fBm 옥타브 수. 높일수록 계층이 늘어나 복잡도가 증가(연산량 증가)
  noiseLacunarity = 1, // 옥타브마다 주파수가 증가하는 비율. 클수록 상위 옥타브가 더 촘촘
  noiseGain = 5, // 옥타브마다 진폭이 변하는 비율. 클수록 상위 옥타브 영향이 큼
  showNoise = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTex = gl.getUniformLocation(program, "uTex");
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTileSize = gl.getUniformLocation(program, "uTileSize");
    const uTileStep = gl.getUniformLocation(program, "uTileStep");
    const uOffset = gl.getUniformLocation(program, "uOffset");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uNoiseScale = gl.getUniformLocation(program, "uNoiseScale");
    const uNoiseSpeed = gl.getUniformLocation(program, "uNoiseSpeed");
    const uNoiseContrast = gl.getUniformLocation(program, "uNoiseContrast");
    const uBlurRadius = gl.getUniformLocation(program, "uBlurRadius");
    const uBlurMaskStrength = gl.getUniformLocation(
      program,
      "uBlurMaskStrength"
    );
    const uNoiseFrequency = gl.getUniformLocation(program, "uNoiseFrequency");
    const uNoiseAmplitude = gl.getUniformLocation(program, "uNoiseAmplitude");
    const uNoiseOctaves = gl.getUniformLocation(program, "uNoiseOctaves");
    const uNoiseLacunarity = gl.getUniformLocation(program, "uNoiseLacunarity");
    const uNoiseGain = gl.getUniformLocation(program, "uNoiseGain");
    const uShowNoise = gl.getUniformLocation(program, "uShowNoise");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let imgWidth = 1;
    let imgHeight = 1;
    let textureReady = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgWidth = img.naturalWidth;
      imgHeight = img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      textureReady = true;
    };
    img.src = src;

    gl.uniform1i(uTex, 0);
    gl.uniform1f(uNoiseScale, noiseScale);
    gl.uniform1f(uNoiseSpeed, noiseSpeed);
    gl.uniform1f(uNoiseContrast, noiseContrast);
    gl.uniform1f(uBlurRadius, blurRadius);
    gl.uniform1f(uBlurMaskStrength, blurMaskStrength);
    gl.uniform1f(uNoiseFrequency, noiseFrequency);
    gl.uniform1f(uNoiseAmplitude, noiseAmplitude);
    gl.uniform1f(uNoiseOctaves, noiseOctaves);
    gl.uniform1f(uNoiseLacunarity, noiseLacunarity);
    gl.uniform1f(uNoiseGain, noiseGain);
    gl.uniform1f(uShowNoise, showNoise ? 1 : 0);

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);

      if (textureReady) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const tileW = Math.max(1, imgWidth * tileScale * dpr);
        const tileH = Math.max(1, imgHeight * tileScale * dpr);
        const stepX = tileW + Math.max(0, gapX) * dpr;
        const stepY = tileH + Math.max(0, gapY) * dpr;
        const offX = offsetX * dpr;
        const offY = offsetY * dpr;
        gl.uniform2f(uTileSize, tileW, tileH);
        gl.uniform2f(uTileStep, stepX, stepY);
        // keep PNG tiles static (no animated offset)
        gl.uniform2f(uOffset, offX, offY);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [
    src,
    tileScale,
    gapX,
    gapY,
    offsetX,
    offsetY,
    noiseScale,
    noiseSpeed,
    blurRadius,
    blurMaskStrength,
    noiseContrast,
    showNoise,
    noiseFrequency,
    noiseAmplitude,
    noiseOctaves,
    noiseLacunarity,
    noiseGain,
  ]);

  return (
    <div
      className={className ?? ""}
      style={{ width: "100vw", height: "100vh" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}

export type { Props as NoisyBlurTextProps };