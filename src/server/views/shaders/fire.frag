precision highp float;

// Modified Blum Blum Shub pseudo-random number generator.
vec2 mBBS(vec2 val, float modulus) {
  val = mod(val, modulus); // For numerical consistancy.
  return mod(val * val, modulus);
}

// Pregenerated noise texture.
uniform sampler2D nzw;
const float modulus = 61.0;  // Value used in pregenerated noise texture.

/**
 * Modified noise function.
 * @see http://www.csee.umbc.edu/~olano/papers/index.html#mNoise
 **/
float mnoise(vec3 pos) {
  float intArg = floor(pos.z);
  float fracArg = fract(pos.z);
  vec2 hash = mBBS(intArg * 3.0 + vec2(0, 3), modulus);
  vec4 g = vec4(
      texture2D(nzw, vec2(pos.x, pos.y + hash.x) / modulus).xy,
      texture2D(nzw, vec2(pos.x, pos.y + hash.y) / modulus).xy) * 2.0 - 1.0;
  return mix(g.x + g.y * fracArg,
             g.z + g.w * (fracArg - 1.0),
             smoothstep(0.0, 1.0, fracArg));
}

const int octives = 4;
const float lacunarity = 2.0;
const float gain = 0.5;

/**
 * Adds multiple octives of noise together.
 **/
float turbulence(vec3 pos) {
  float sum = 0.0;
  float freq = 1.0;
  float amp = 1.0;
  for(int i = 0; i < 4; i++) {
    sum += abs(mnoise(pos * freq)) * amp;
    freq *= lacunarity;
    amp *= gain;
  }
  return sum;
}

const float magnatude = 1.3;
uniform float time;
uniform sampler2D fireProfile;

/**
 * Samples the fire.
 *
 * @param loc the normalized location (0.0-1.0) to sample the fire
 * @param scale the 'size' of the fire in world space and time
 **/
vec4 sampleFire(vec3 loc, vec4 scale) {
  // Convert xz to [-1.0, 1.0] range.
  loc.xz = loc.xz * 2.0 - 1.0;

  // Convert to (radius, height) to sample fire profile texture.
  vec2 st = vec2(sqrt(dot(loc.xz, loc.xz)), loc.y);

  // Convert loc to 'noise' space
  loc.y -= time * scale.w; // Scrolling noise upwards over time.
  loc *= scale.xyz; // Scaling noise space.

  // Offsetting vertial texture lookup.
  // We scale this by the sqrt of the height so that things are
  // relatively stable at the base of the fire and volital at the
  // top.
  float offset = sqrt(st.y) * magnatude * turbulence(loc);
  st.y += offset;

  // TODO: Update fireProfile texture to have a black row of pixels.
  if (st.y > 1.0) {
    return vec4(0, 0, 0, 1);
  }

  vec4 result = texture2D(fireProfile, st);

  // Fading out bottom so slice clipping isnt obvious
  if (st.y < .1) {
    result *= st.y / 0.1;
  }
  return result;
}

// Get the range of t to sample.
vec2 get_range(vec3 pos, vec3 dir) {
  float pd = dot(pos.xz, dir.xz);
  float pp = dot(pos.xz, pos.xz);
  float dd = dot(dir.xz, dir.xz);

  float temp = pd * pd + dd * (1.0 - pp);
  if (temp < 0.0)  // No intersection
    return vec2(0.0);
  temp = sqrt(temp);
  return max(vec2(0.0), vec2(-pd - temp, -pd + temp)) / dd;
}

vec4 ray_trace(vec3 pos, vec3 dir, vec3 t) {
  float samples = (t.y - t.x) / t.z;

  pos = pos + t.x * dir;
  vec3 integral = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    if (pos.y > 1.0 || pos.y < 0.0 || float(i) >= samples)
      break;
    vec4 sample = 2.0 * sampleFire(pos, vec4(2.0, 2.0, 2.0, 1.0));
    integral += sample.xyz;
    pos += t.z * dir;
  }
  return vec4(integral, 1);
}

uniform vec3 eye;
varying vec3 texOut;
varying vec3 worldCoord;
void main(void) {
  // Mapping texture coordinate to -1 => 1 for xy, 0=> 1 for y

  //gl_FragColor = vec4(0.5, 0.5, 0.0, 0.5);
  //gl_FragColor = vec4(texOut, 1);
  //gl_FragColor = vec4(vec3((t.x - t.y) / 2.0), 1);
  vec3 color = sampleFire(texOut, vec4(1.0, 2.0, 1.0, 0.5)).xyz;
  //gl_FragColor = vec4(color, length(color) * 2.5);
  gl_FragColor = vec4(color * .25, 1);
}
