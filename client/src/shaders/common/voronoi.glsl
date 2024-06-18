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

vec3 Hash_3D_to_3D(vec3 k){
    vec3 st = vec3(dot(k,vec3(103,393,293)),dot(k,vec3(593,339,299)),dot(k,vec3(523,334,192)));
    return vec3(fract(sin(st) * 2304.2002));
}

//Chebyshev Distance 
float Checyshev3D(vec3 p){return max(max(abs(p.x),abs(p.y)),abs(p.z));}



//----
//3D Voronoi
//----

float voronoi_distance_3d(vec3 a,vec3 b){
    return Checyshev3D(b - a);
}


// 3D Voronoi function to calculate displacement and color
// @see https://github.com/kinakomoti-321/Voronoi_textures/blob/main/VoronoiTexture/Voronoi.glsl
vec4 voronoi(vec3 coord) {
    vec3 cellPosition = floor(coord);
    vec3 localPosition = coord - cellPosition;

    float minDistance = 8.0f;
    vec3 targetOffset = vec3(0);
    vec3 targetPosition = vec3(0);
    vec4 result = vec4(0.0); // Initialize result as vec4 to store color and displacement
    
    for(int j = -1; j <= 1; j++){
        for(int i = -1; i<=1; i++){
            for(int k = -1; k<=1; k++){
            vec3 cellOffset = vec3(i,j,k);
            vec3 pointPosition = cellOffset + Hash_3D_to_3D(cellPosition + cellOffset) * randomness;
            
            float distanceToPoint = voronoi_distance_3d(pointPosition,localPosition);
            if(distanceToPoint < minDistance){
                minDistance = distanceToPoint;
                targetOffset = cellOffset;
                targetPosition = pointPosition;
            }
            }
        }
    }
    result.a = minDistance;
    result.rgb = Hash_3D_to_3D(cellPosition + targetOffset);
    return result;
}
