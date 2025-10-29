// ============================================
// BRAIN VERTEX SHADER
// Advanced morphing brain with procedural displacement
// ============================================

// ============================================
// GLSL NOISE LIBRARY
// Perlin and Simplex noise functions
// Based on Stefan Gustavson's work
// ============================================

// Permutation polynomial
vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// ============================================
// CLASSIC PERLIN NOISE 3D
// ============================================
float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

// ============================================
// SIMPLEX NOISE 3D
// ============================================
float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ============================================
// FRACTAL BROWNIAN MOTION (FBM)
// ============================================
float fbm(vec3 p, int octaves, float lacunarity, float gain) {
    float sum = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 8; i++) {
        if(i >= octaves) break;
        sum += amplitude * snoise(p * frequency);
        frequency *= lacunarity;
        amplitude *= gain;
    }
    
    return sum;
}

// ============================================
// TURBULENCE
// ============================================
float turbulence(vec3 p, int octaves) {
    float sum = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    
    for(int i = 0; i < 8; i++) {
        if(i >= octaves) break;
        sum += amplitude * abs(snoise(p * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return sum;
}

// ============================================
// VORONOI NOISE
// ============================================
vec2 voronoi(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    
    float minDist = 1.0;
    float secondMinDist = 1.0;
    
    for(int k = -1; k <= 1; k++) {
        for(int j = -1; j <= 1; j++) {
            for(int i = -1; i <= 1; i++) {
                vec3 g = vec3(float(i), float(j), float(k));
                vec3 o = vec3(
                    fract(sin(dot(n + g, vec3(12.9898, 78.233, 45.164))) * 43758.5453),
                    fract(sin(dot(n + g, vec3(39.346, 11.135, 83.155))) * 43758.5453),
                    fract(sin(dot(n + g, vec3(73.156, 52.235, 09.151))) * 43758.5453)
                );
                
                vec3 r = g - f + o;
                float d = length(r);
                
                if(d < minDist) {
                    secondMinDist = minDist;
                    minDist = d;
                } else if(d < secondMinDist) {
                    secondMinDist = d;
                }
            }
        }
    }
    
    return vec2(minDist, secondMinDist);
}

// ============================================
// CURL NOISE (for fluid-like motion)
// ============================================
vec3 curlNoise(vec3 p) {
    const float e = 0.0009765625;
    const float e2 = 2.0 * e;
    
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    
    vec3 p_x0 = snoise(p - dx) * vec3(1.0);
    vec3 p_x1 = snoise(p + dx) * vec3(1.0);
    vec3 p_y0 = snoise(p - dy) * vec3(1.0);
    vec3 p_y1 = snoise(p + dy) * vec3(1.0);
    vec3 p_z0 = snoise(p - dz) * vec3(1.0);
    vec3 p_z1 = snoise(p + dz) * vec3(1.0);
    
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    
    return normalize(vec3(x, y, z) / e2);
}


uniform float uTime;
uniform float uMorphProgress;
uniform float uAudioFrequency;
uniform vec3 uMousePosition;
uniform float uScrollProgress;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;
varying float vBrainRegion; // 0 = left, 0.5 = corpus, 1 = right

// Attributes for brain segments
attribute float brainRegion;
attribute vec3 instancePosition;

void main() {
    vUv = uv;
    vBrainRegion = brainRegion;
    
    vec3 pos = position;
    vec3 norm = normal;
    
    // ===== PROCEDURAL DISPLACEMENT =====
    // Multi-octave noise for organic brain surface
    float noiseScale = 2.0;
    float time = uTime * 0.3;
    
    vec3 noisePos = pos * noiseScale + vec3(time * 0.1);
    float noise = fbm(noisePos, 4, 2.0, 0.5);
    
    // Different displacement for different brain regions
    float displacementAmount = 0.0;
    
    if(brainRegion < 0.33) {
        // Left hemisphere (analytical) - more angular displacement
        displacementAmount = noise * 0.15 * (1.0 + sin(uTime * 2.0 + pos.x * 3.0) * 0.3);
    } else if(brainRegion > 0.66) {
        // Right hemisphere (creative) - more fluid displacement
        displacementAmount = noise * 0.2 * (1.0 + cos(uTime * 1.5 + pos.y * 2.0) * 0.4);
    } else {
        // Corpus callosum (connector) - pulsing displacement
        displacementAmount = noise * 0.25 * (1.0 + sin(uTime * 3.0) * 0.5);
    }
    
    // Audio reactivity
    displacementAmount += uAudioFrequency * 0.3 * sin(pos.y * 10.0 + uTime * 5.0);
    
    // Scroll-based morphing
    float scrollMorph = smoothstep(0.0, 1.0, uScrollProgress);
    displacementAmount *= (1.0 + scrollMorph * 0.5);
    
    // Mouse interaction
    vec3 mouseDir = normalize(uMousePosition - pos);
    float mouseDist = length(uMousePosition - pos);
    float mouseInfluence = smoothstep(2.0, 0.0, mouseDist);
    pos += norm * mouseInfluence * 0.3;
    
    // Apply displacement
    pos += norm * displacementAmount;
    vDisplacement = displacementAmount;
    
    // ===== SYNAPTIC PULSES =====
    // Traveling waves across brain surface
    float wave1 = sin(pos.x * 8.0 + uTime * 4.0) * 0.02;
    float wave2 = cos(pos.y * 6.0 - uTime * 3.0) * 0.02;
    float wave3 = sin(length(pos.xz) * 10.0 - uTime * 5.0) * 0.015;
    pos += norm * (wave1 + wave2 + wave3);
    
    // ===== MORPHING ANIMATION =====
    // Morph between different brain states
    vec3 morphedPos = pos;
    float morphAmount = sin(uMorphProgress * 3.14159) * 0.5 + 0.5;
    morphedPos.y += sin(pos.x * 3.0 + uMorphProgress * 6.28) * morphAmount * 0.2;
    morphedPos.x += cos(pos.y * 2.0 + uMorphProgress * 6.28) * morphAmount * 0.15;
    
    pos = mix(pos, morphedPos, uMorphProgress);
    
    // ===== NEURAL CONNECTIONS =====
    // Add thin connecting fibers between regions
    if(brainRegion > 0.32 && brainRegion < 0.34 || brainRegion > 0.65 && brainRegion < 0.67) {
        float fiberNoise = snoise(pos * 20.0 + vec3(uTime * 2.0));
        pos += vec3(fiberNoise * 0.05, 0.0, fiberNoise * 0.05);
    }
    
    vPosition = pos;
    vNormal = normalize(normalMatrix * norm);
    
    // Final position
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
}
