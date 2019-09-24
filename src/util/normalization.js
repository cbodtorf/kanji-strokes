// helper functions for moment normalization 

const m10 = (pattern) => {
  let sum = 0;
  for(let i=0;i<pattern.length;i++) {
      const stroke_i = pattern[i];
    for(let j=0;j<stroke_i.length;j++) {
      sum += stroke_i[j][0];
    }			
  }
  return sum;
}

const m01 = (pattern) => {
  let sum = 0;
  for(let i=0;i<pattern.length;i++) {
    const stroke_i = pattern[i];
    for(let j=0;j<stroke_i.length;j++) {
      sum += stroke_i[j][1];
    }			
  }
  return sum;
}
  
const m00 = (pattern) => {
  let sum = 0;
  for(let i=0;i<pattern.length;i++) {
    const stroke_i = pattern[i];
    sum += stroke_i.length;
  }
  return sum;
}

const mu20 = (pattern, xc) => {
  let sum = 0;
  for(let i=0;i<pattern.length;i++) {
    const stroke_i = pattern[i];
    for(let j=0;j<stroke_i.length;j++) {
      const diff = stroke_i[j][0] - xc;
      sum += (diff * diff);
    }			
  }
  return sum;
}

const mu02 = (pattern, yc) => {
  let sum = 0;
  for(let i=0;i<pattern.length;i++) {
    const stroke_i = pattern[i];
    for(let j=0;j<stroke_i.length;j++) {
      const diff = stroke_i[j][1] - yc;
      sum += (diff * diff);
    }			
  }
  return sum;
}

const aran = (width, height) => {
  let r1 = 0.;
  if(height > width) {
    r1 = width / height;
  } else {
    r1 = height / width;
  }
  
  // const a = Math.PI / 2.;
  // const b = a * r1;
  // const b1 = Math.sin(b);
  // const c = Math.sqrt(b1);
  // const d = c;
  
  const r2 = Math.sqrt(Math.sin((Math.PI/2.) * r1));
  return r2;
}

const chopOverbounds = (pattern) => {
  const chopped = new Array();
  for(let i=0;i<pattern.length;i++) {
    const stroke_i = pattern[i];
    const c_stroke_i = new Array();
    for(let j=0;j<stroke_i.length;j++) {
      let x = stroke_i[j][0];
      let y = stroke_i[j][1];			
      if(x < 0) { x = 0; }
      if(x>=256) { x = 255; }
      if(y < 0) { y = 0; }
      if(y>=256) { y = 255; }
      c_stroke_i.push([x,y]);
    }
    chopped.push(c_stroke_i);
  }
  return chopped;		
}

const transform = (pattern, x_, y_) => {
  const pt = new Array();
  for(let i=0;i<pattern.length;i++) {
    const stroke_i = pattern[i];
    const c_stroke_i = new Array();
    for(let j=0;j<stroke_i.length;j++) {
      const x = stroke_i[j][0]+x_;
      const y = stroke_i[j][1]+y_;
      c_stroke_i.push([x,y]);
    }
    pt.push(c_stroke_i);
  }
  return pt;			
}

export {
  m10,
  m01,
  m00,
  mu20,
  mu02,
  aran,
  chopOverbounds,
  transform,
}