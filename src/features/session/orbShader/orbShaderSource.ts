// Aire — орб на 2D-фрагментном шейдере (domain-warped fbm).
// Дословный перенос VS/FS из прототипа `orb-shader.html`. Без DOM — переиспользуемо.

export const VERTEX_SRC = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

export const FRAGMENT_SRC = `
precision highp float;
uniform vec2 uRes;
uniform float uTime,uScale,uBright,uChaos,uAmp,uGlow,uDetail,uRound;
uniform vec3 uC1,uC2,uC3;
float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p=rot(.6)*p*2.+0.7;a*=.5;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/min(uRes.x,uRes.y);
  float t=uTime;
  // ---- силуэт: гладкий волнистый, с запасом до краёв ----
  // 0.32 (а не 0.38): оставляем место внешнему свечению, чтобы оно не упиралось в край канваса.
  float baseR=0.32*uScale;
  float ang=atan(uv.y,uv.x);
  float wob=uAmp*0.030*sin(ang*2.0+t*0.35)
           +uAmp*0.020*sin(ang*3.0-t*0.50)
           +uChaos*uAmp*0.013*sin(ang*4.0+t*0.70);
  float R=baseR+wob;
  float rad=length(uv);
  float d=rad/R;
  float dc=min(d,1.0);
  float z=sqrt(max(0.0,1.0-dc*dc));
  // ---- поток (двойной domain-warp) ----
  vec2 sp=uv/R;
  vec2 q=vec2(fbm(sp*1.4+vec2(0.,t*0.09)),fbm(sp*1.4+vec2(4.3,t*0.07)));
  vec2 r2=vec2(fbm(sp*1.4+1.6*q+t*0.05*uChaos),
               fbm(sp*1.4+1.6*q+vec2(7.0,2.0)-t*0.045*uChaos));
  float flow=fbm(sp*1.4+(1.2+uDetail)*r2);
  // ---- тёмная полупрозрачная сердцевина ----
  vec3 col=uC3*0.22;
  col+=uC2*smoothstep(0.75,0.0,d)*0.16;
  // ---- светящаяся оболочка (fresnel) с потоком ----
  float shell=pow(1.0-z,2.2);
  col+=mix(uC2,uC1,flow)*shell*(0.35+0.95*flow)*1.05*uBright;
  // ---- тонкий яркий ободок ----
  float rim=smoothstep(0.80,0.99,d)*smoothstep(1.05,0.92,d);
  col+=uC1*rim*(0.4+0.6*flow)*uBright;
  col*=uBright;
  // ---- узкое внешнее свечение ----
  float glow=smoothstep(1.28,1.0,d)*uGlow*0.28*uBright;
  float alpha=clamp(max(smoothstep(1.04,0.99,d),glow),0.0,1.0);
  vec3 outCol=col+uC2*glow*0.7;
  // Прозрачный фон: канвас сливается с экраном сессии (вместо непрозрачного bg прототипа).
  gl_FragColor=vec4(outCol,alpha);
}`;

// Имена uniform'ов, которые биндит рендерер. uRound объявлен в шейдере, но пока не используется.
export const ORB_UNIFORM_NAMES = [
  "uRes",
  "uTime",
  "uScale",
  "uBright",
  "uChaos",
  "uAmp",
  "uGlow",
  "uDetail",
  "uC1",
  "uC2",
  "uC3",
] as const;

export type OrbUniformName = (typeof ORB_UNIFORM_NAMES)[number];
