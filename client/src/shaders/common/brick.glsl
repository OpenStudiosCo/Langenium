// Brick Texture
// Based on https://www.shadertoy.com/view/wt3Sz4

//constant function
const float zoom = 10.;
vec3 brickColor = vec3(0.205, .195, .188) / 2.;
vec3 groutColor = vec3(0.06, 0.07, 0.08) /2. ;
const vec3 outlineColor = vec3(0.06, 0.07, 0.08) / 1.5;
const float edgeThickness = 0.008; // Thickness of the grout
const float outlineThickness = 0.001; // Thickness of the outline

//random noise function
float nrand(vec2 n)
{
    return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float sincosbundle(float val)
{
    return sin(cos(2. * val) + sin(4. * val) - cos(5. * val) + sin(3. * val)) * 0.05;
}

//color function
vec3 brick_color(in vec3 vTexCoord3D, float brickHeight, float edgePos, bool swapColors)
{
    if ( swapColors ) {
        brickColor = vec3(0.06, 0.07, 0.08) /2. ;
        groutColor = vec3(0.205, .195, .188) / 2.;
    }

    vTexCoord3D.y *= (1.0 - brickHeight);

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

    // Determine if we are on a vertical or horizontal grout line
    bool vrtGrout = step(1.0 - edgeThickness, verticalEdge) == 1.0;
    bool hrtGrout = gv.y < edgeThickness || gv.y > 1.0 - edgeThickness;

    // Determine if we are on a vertical or horizontal outline
    bool vrtOutline = step(1.0 - (edgeThickness + outlineThickness), verticalEdge) == 1.0 && !vrtGrout;
    bool hrtOutline = (gv.y >= edgeThickness && gv.y < edgeThickness + outlineThickness) || (gv.y <= 1.0 - edgeThickness && gv.y > 1.0 - edgeThickness - outlineThickness);

    // Return the appropriate color based on the position
    if (vrtGrout || hrtGrout)
        return groutColor;
    if (vrtOutline || hrtOutline)
        return outlineColor;
    return brick;
}
