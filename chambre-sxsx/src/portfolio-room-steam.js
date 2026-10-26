import * as THREE from 'three';

export async function createRoomSteam(root){
  const coffee=root.getObjectByName('Coffee_Mug_Fourth_Raycaster_Hover');if(!coffee)return {update(){}};
  const perlin=await new THREE.TextureLoader().loadAsync(new URL('textures/perlin.png',document.baseURI).href);perlin.wrapS=perlin.wrapT=THREE.RepeatWrapping;
  const geometry=new THREE.PlaneGeometry(1,1,16,64);geometry.translate(0,.5,0);geometry.scale(.33,1,.33);
  const time={value:0};
  const material=new THREE.ShaderMaterial({uniforms:{uTime:time,uPerlinTexture:{value:perlin}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`uniform float uTime;uniform sampler2D uPerlinTexture;varying vec2 vUv;
    void main(){vec3 p=position;float a=texture2D(uPerlinTexture,vec2(.5,uv.y*.2-uTime*.01)).r*3.;p.xz=mat2(cos(a),sin(a),-sin(a),cos(a))*p.xz;
    vec2 w=vec2(texture2D(uPerlinTexture,vec2(.25,uTime*.01)).r-.5,texture2D(uPerlinTexture,vec2(.75,uTime*.01)).r-.5);p.xz+=w*pow(uv.y,2.)*1.5;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`uniform float uTime;uniform sampler2D uPerlinTexture;varying vec2 vUv;void main(){vec2 uv=vUv*vec2(.5,.3);uv.y-=uTime*.04;float s=smoothstep(.4,1.,texture2D(uPerlinTexture,uv).r);s*=smoothstep(0.,.1,vUv.x)*(1.-smoothstep(.9,1.,vUv.x))*smoothstep(0.,.1,vUv.y)*(1.-smoothstep(.4,1.,vUv.y));gl_FragColor=vec4(1.,1.,1.,s);}`});
  const steam=new THREE.Mesh(geometry,material);steam.name='Coffee steam — animated';root.parent.add(steam);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {update(t){coffee.getWorldPosition(steam.position);steam.position.y+=.2;time.value=reduced?0:t;steam.scale.setScalar(Math.max(.01,coffee.scale.x));}};
}
