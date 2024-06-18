uniform float scale;      // Scale to adjust the size of the Voronoi cells
uniform float roughness;  // Roughness affects the smoothness of the Voronoi texture
uniform float lacunarity; // Lacunarity controls the gap between frequencies
uniform float randomness; // Randomness affects the placement of Voronoi points
varying vec3 vUv;

// ----------------------------------------------------------------------

/// @brief  calculates a gradient mapped colour 
/// @detail the calculations are based on colour stops c1, c2, c3, 
///         and one normlised input value, emphasises constant 
///         execution time.
/// @param c1 [rgbw] first colour stop, with .w being the normalised 
///         position of the colour stop on the gradient beam.
/// @param c2 [rgbw] second colour stop, with .w being the normalised 
///         position of the colour stop on the gradient beam.
/// @param c3 [rgbw] third colour stop, with .w being the normalised 
///         position of the colour stop on the gradient beam.
/// @param value the input value for gradient mapping, a normalised 
///        float
/// @note   values are interpolated close to sinusoidal, using 
///         smoothstep, sinusoidal interpolation being what Photoshop
///         uses for its gradients.
/// @author @tgfrerer
vec3 getGradient(vec4 c1, vec4 c2, vec4 c3, float value_){
	
	float blend1 = smoothstep(c1.w, c2.w, value_);
	float blend2 = smoothstep(c2.w, c3.w, value_);
	
	vec3 
	col = mix(c1.rgb, c2.rgb, blend1);
	col = mix(col, c3.rgb, blend2);
	
	return col;
}

// Function to generate random values
float rand(vec3 co) {
    return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453 * randomness);
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
    
    for (int k = -1; k <= 1; k++) {
        for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
                vec3 b = vec3(i, j, k);
                vec3 r = vec3(b) - f + vec3(rand(p + b), rand(p + b.yzx), rand(p + b.zxy)) * roughness;
                float d = chebychevDist(vec3(0.0), r);
                if (d < minDist) {
                    minDist = d;
                }
            }
        }
    }
    return vec3(minDist);
}

void main() {
    vec3 uvScaled = vUv * scale * lacunarity;
    // vec3 distance = voronoi(uvScaled); // Get the distance from Voronoi function

    vec3 color = getGradient(
        vec4( .02, .02, .02, 0.61 ),
        vec4( 1., 1., 1., 0.63 ),
        vec4( 0.02, 0.02, 0.02, 0.64 ),
        voronoi(uvScaled).y
    );
    
    gl_FragColor = vec4(color, 1.0);
}
