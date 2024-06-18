// @param: uniform float randomness;

// Function to generate random values
float rand(vec3 co) {
    return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453 * randomness);
}

// Chebychev distance function
float chebychevDist(vec3 a, vec3 b) {
    vec3 diff = abs(a - b);
    return max(max(diff.x, diff.y), diff.z);
}

// Function to generate random colors
vec3 randomColor(vec3 position, float randomness) {
    float r = fract(sin(dot(position, vec3(12.9898, 78.233, 45.164))) * 43758.5453 * randomness);
    float g = fract(sin(dot(position.yzx, vec3(12.9898, 78.233, 45.164))) * 43758.5453 * randomness);
    float b = fract(sin(dot(position.zxy, vec3(12.9898, 78.233, 45.164))) * 43758.5453 * randomness);
    return vec3(r, g, b);
}

// 3D Voronoi function to calculate displacement and color
vec4 voronoi(vec3 uv) {
    vec3 p = floor(uv);
    vec3 f = fract(uv);
    float minDist = 8.0;
    vec4 result = vec4(0.0); // Initialize result as vec4 to store color and displacement
    
    for (int k = -1; k <= 1; k++) {
        for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
                vec3 b = vec3(i, j, k);
                vec3 r = vec3(b) - f + vec3(rand(p + b), rand(p + b.yzx), rand(p + b.zxy)) * roughness;
                float d = chebychevDist(vec3(0.0), r);
                if (d < minDist) {
                    minDist = d;
                    result.rgb = randomColor(uv, randomness); // Random color based on UV position
                }
            }
        }
    }
    result.a = minDist;
    return result;
}
