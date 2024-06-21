// Brick Texture
// Based on https://www.shadertoy.com/view/wt3Sz4

//constant function
const float zoom = 10.;
const vec3 brickColor = vec3(0.45,0.29,0.23);
const vec3 lineColor = vec3(0.845);
const float edgePos = 1.5;

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
vec3 brick_color(in vec3 uvw)
{
    // Grid and coordinates inside each cell
    vec3 coord = floor(uvw);
    vec3 gv = fract(uvw);

    // For randomness in brick pattern
    float movingValue = -sincosbundle(coord.y) * 2.;

    // Offset calculation for bricks
    float offset = floor(mod(uvw.y, 2.0)) * (edgePos);
    float verticalEdge = abs(cos(uvw.x + offset)) > abs(cos(uvw.z + offset)) ? abs(cos(uvw.x + offset)) : abs(cos(uvw.z + offset));

    // Color of the bricks
    vec3 brick = brickColor - movingValue;

    // Determine if we are on a vertical or horizontal edge
    bool vrtEdge = step(1. - 0.01, verticalEdge) == 1.;
    bool hrtEdge = gv.y > 0.9 || gv.y < 0.1;

    // Return line color for edges, brick color otherwise
    if (hrtEdge || vrtEdge)  
        return lineColor;
    return brick;
}
