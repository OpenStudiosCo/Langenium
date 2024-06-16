uniform float scale;

varying vec3 vUv;

// Function to generate random values
float rand(vec3 co) {
    return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Chebychev distance function
float chebychevDist(vec3 a, vec3 b) {
    vec3 diff = abs(a - b);
    return max(max(diff.x, diff.y), diff.z);
}

vec3 voronoi(vec3 uv) {
    vec3 p = floor(uv);
    vec3 f = fract(uv);
    float minDist = 8.0;
    vec3 minId = vec3(0.0);
    
    for (int k = -1; k <= 1; k++) {
        for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
                vec3 b = vec3(i, j, k);
                vec3 r = vec3(b) - f + vec3(rand(p + b), rand(p + b.yzx), rand(p + b.zxy));
                float d = chebychevDist(vec3(0.0), r);
                if (d < minDist) {
                    minDist = d;
                    minId = p + b;
                }
            }
        }
    }
    return vec3(minDist);
}

void main() {
    vec3 color = voronoi(vUv * scale); // Scale factor to adjust the size of the Voronoi cells
    gl_FragColor = vec4(color, 1.0);
}
