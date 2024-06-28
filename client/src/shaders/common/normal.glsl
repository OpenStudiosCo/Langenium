// Helpers that simulate global illumination and bump mapping.

// @param: uniform sampler2D noiseTexture;

float snoise ( vec3 coord, float scale, float time_factor ) {
    vec3 scaledCoord = coord * scale - (vNormal / time_factor + vec3(0.0, 0.0, 0.0));

    vec2 uvTimeShift = vec2((scaledCoord.x + scaledCoord.z) / 2.0, scaledCoord.y) + vec2( -0.7, 1.5 ) * 0.0 * 0.015;
    vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
    vec2 uvNoiseTimeShift = vec2(scaledCoord.x, scaledCoord.y) + 0.5 * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );
    vec4 baseColor = texture2D( noiseTexture, uvNoiseTimeShift * vec2(4.0, 4.0) );

    return baseColor.b;
}

float heightMap( vec3 coord ) {
    float n = abs(snoise(coord , 1.0 , 1800.0));
    n -= 0.75 * abs(snoise(coord , 4.0 , 2500.0));
    n += 0.125 * abs(snoise(coord , 14.0 , 3500.0));
    n *= 0.7;
    return n;
}

vec3 computeNormal( float height ) {
    const float e = .001;

    float heightX = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
    float heightY = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
    float heightZ = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

    vec3 normal = normalize( vNormal + .5 * vec3( height - heightX, height - heightY, height - heightZ ) / e );

    return normal;    
}

vec3 computeLightWeighting( float height, float dlwRatio ) {
    vec3 normal = computeNormal( height );
    // diffuse light
    vec3 vLightWeighting = vec3( 0.001 );

    vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );
    float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * (dlwRatio) + (1. - dlwRatio);
    vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

    // specular light
    vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );
    float dirDotNormalHalf = dot( normal, dirHalfVector );

    float dirSpecularWeight = 0.0;
    if ( dirDotNormalHalf >= 0.0 )
        dirSpecularWeight = ( 1.0 - height ) * pow( dirDotNormalHalf, 5.0 );

    //vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n / 3.1415926;
    vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * height * 2.0;

    return vLightWeighting;
}

// Bump mapping function adapted from Blender's Cycles code
vec3 bumpMapping(vec3 P, vec3 normal, float strength, float distance, float sampleCenter, float sampleX, float sampleY, bool invert) {
    vec3 dPdx = dFdx(P);
    vec3 dPdy = dFdy(P);

    vec3 Rx = cross(dPdy, normal);
    vec3 Ry = cross(normal, dPdx);

    float det = dot(dPdx, Rx);
    vec3 surfgrad = (sampleX - sampleCenter) * Rx + (sampleY - sampleCenter) * Ry;

    float absdet = abs(det);

    if (invert)
        distance *= -1.0;

    vec3 NormalOut = normalize(absdet * normal - distance * sign(det) * surfgrad);
    NormalOut = normalize(strength * NormalOut + (1.0 - strength) * normal);

    return NormalOut;
}

// Based on a mix of Fireball shader's light weighting formula and simulating metallic.
vec3 calculateMergedLighting(vec3 baseColor, vec3 normal, float height, float dlwRatio) {
    // Calculate metallic value
    float metallic = dot(getGradient(
        vec4(0., 0., 0., 0.),
        vec4(1., 1., 1., 0.118),
        baseColor.r
    ), vec3(0.2126, 0.7152, 0.0722));

    vec3 lightDir = normalize(vec3(0.1, 1.0, 0.1) - vViewPosition);
    vec3 viewDir = normalize(vViewPosition - vTexCoord3D);

    // Calculate the halfway vector
    vec3 halfwayDir = normalize(lightDir + viewDir);

    // Fresnel factor (Schlick's approximation)
    float fresnel = pow(1.0 - dot(viewDir, halfwayDir), 5.0);

    // Base reflectance at normal incidence for dielectric materials (approximately 4% reflectance)
    vec3 F0 = vec3(0.04);

    // Interpolate between dielectric F0 and the base color for metals
    F0 = mix(F0, baseColor, metallic);

    // Specular reflection (using Blinn-Phong model here)
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);

    // Fresnel equation for specular reflection
    vec3 specular = (1.0 - fresnel) * F0 + fresnel;

    // Lambertian diffuse reflection
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = baseColor * diff * (1.0 - metallic);

    // Compute light weighting
    vec3 vLightWeighting = vec3(0.001);

    vec4 lDirection = viewMatrix * vec4(normalize(vec3(0.1, 1.0, 0.1)), 0.0);
    float directionalLightWeighting = dot(normal, normalize(lDirection.xyz)) * (dlwRatio) + (1.0 - dlwRatio);
    vLightWeighting += vec3(1.0) * directionalLightWeighting;

    // Specular light component
    vec3 dirHalfVector = normalize(lDirection.xyz + normalize(vViewPosition));
    float dirDotNormalHalf = dot(normal, dirHalfVector);

    float dirSpecularWeight = 0.0;
    if (dirDotNormalHalf >= 0.0)
        dirSpecularWeight = (1.0 - height) * pow(dirDotNormalHalf, 5.0);

    vLightWeighting += vec3(1.0, 0.5, 0.0) * dirSpecularWeight * height * 2.0;

    // Combine diffuse and specular components
    vec3 finalColor = diffuse + specular * vLightWeighting;

    return finalColor;
}