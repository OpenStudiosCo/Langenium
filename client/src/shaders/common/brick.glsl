// Brick Texture
// Based on https://www.shadertoy.com/view/wt3Sz4

//constant function
const float zoom = 10.;
const vec3 brickColor = vec3(0.205, .195, .188)/ 2.;
const vec3 lineColor = vec3(0.06, 0.07, 0.08) / 2.;
const float edgePos = 1.5;
const float brickHeight = 0.75; // Adjust brick height.

//random noise function
float nrand( vec2 n )
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

float sincosbundle(float val)
{
	return sin(cos(2.*val) + sin(4.*val)- cos(5.*val) + sin(3.*val))*0.05;
}


//color function
vec3 brick_color(in vec3 vTexCoord3D)
{

    vTexCoord3D.y *= ( 1.0 - brickHeight);

    // Grid and coordinates inside each cell
    vec3 coord = floor(vTexCoord3D);
    vec3 gv = fract(vTexCoord3D);   

    // For randomness in brick pattern
    float movingValue = -sincosbundle(coord.y);

    // Offset calculation for bricks
    float offset = floor(mod(vTexCoord3D.y, 2.0)) * (edgePos);
    float verticalEdge = abs(cos(vTexCoord3D.x + offset)) > abs(cos(vTexCoord3D.z + offset)) ? abs(cos(vTexCoord3D.x + offset)) : abs(cos(vTexCoord3D.z + offset));

    // Color of the bricks
    vec3 brick = brickColor - movingValue;

    // Determine if we are on a vertical or horizontal edge
    bool vrtEdge = step(1. - 0.01, verticalEdge) == 1.;
    //bool hrtEdge = gv.y > 0.9 || gv.y < 0.1;
    bool hrtEdge = gv.y > 0.9 || gv.y < 0.1;

    // Return line color for edges, brick color otherwise
    if (hrtEdge || vrtEdge)  
        return lineColor;
    return brick;
}
