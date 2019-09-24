/* eslint-disable */

// distance functions
const euclid = (x1y1, x2y2) => {
  const a = x1y1[0] - x2y2[0];
  const b = x1y1[1] - x2y2[1];
  const c = Math.sqrt( a*a + b*b );
  return c;
}

const extractFeatures = (kanji, interval) => {
  const extractedPattern = new Array();
  const nrStrokes = kanji.length;
  for(let i = 0;i<nrStrokes;i++) {
    const stroke_i = kanji[i];
    const extractedStroke_i = new Array();
    let dist = 0.0;
    let j = 0;
    while(j < stroke_i.length) {
      // always add first point
      if(j==0) {
        const x1y1 = stroke_i[0];
        extractedStroke_i.push(x1y1);
      }
      if(j > 0) {
        const x1y1 = stroke_i[j-1];
        const x2y2 = stroke_i[j];
        dist += euclid(x1y1, x2y2);
      }
      if((dist >= interval) && (j>1)) {
        dist = dist - interval;
        const x1y1 = stroke_i[j];
        extractedStroke_i.push(x1y1);
      }
      j++;
    }
    // if we so far have only one point, always add last point
    if(extractedStroke_i.length == 1) {
      const x1y1 = stroke_i[stroke_i.length-1];
      extractedStroke_i.push(x1y1);
    } else {
      if(dist > (0.75 * interval)) {
        const x1y1 = stroke_i[stroke_i.length-1];
        extractedStroke_i.push(x1y1);
      }		  
    }
    extractedPattern.push(extractedStroke_i);
  }
  return extractedPattern;
}

const endPointDistance = (pattern1, pattern2) => {
  // console.log("pattern1", pattern1, "pattern2", pattern2)
  let dist = 0;
  const l1 = pattern1.length;
  const l2 = pattern2.length;
  if(l1 == 0 || l2 == 0) {
    return 0;
  } else {
    let x1y1 = pattern1[0];
    let x2y2 = pattern2[0];
    dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
    x1y1 = pattern1[l1-1];
    x2y2 = pattern2[l2-1];
    dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
  }
  return dist;
}

const initialDistance = (pattern1, pattern2) => {
  const l1 = pattern1.length;
  const l2 = pattern2.length;
  const lmin = Math.min(l1,l2);
  const lmax = Math.max(l1,l2);
  let dist = 0;
  for(let i = 0; i<lmin;i++) {
    const x1y1 = pattern1[i];
    const x2y2 = pattern2[i];
    dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
  }
  return dist * (lmax / lmin);
}

// given to pattern, determine longer (more strokes)
// and return quadruple with sorted patterns and their
// stroke numbers [k1,k2,n,m] where n >= m and 
// they denote the #of strokes of k1 and k2

const getLargerAndSize = (pattern1, pattern2) => {
  console.log("getLargerAndSize", "pattern1", pattern1, "pattern2", pattern2)
  const l1 = pattern1.length;
  const l2 = pattern2.length;
  // definitions as in paper 
  // i.e. n is larger 
  let n = l1;
  let m = l2;
  let k1 = pattern1;
  let k2 = pattern2;
  if(l1 < l2) {
    m = l1;
    n = l2;
    k1 = pattern2;
    k2 = pattern1;
  }	   	   
  return [k1,k2,n,m];
}

const wholeWholeDistance = (pattern1, pattern2) => {
  console.log("wholeWholeDistance", "pattern1", pattern1, "pattern2", pattern2)
  const [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
  let dist = 0;
  for(let i = 0; i<m;i++) {
    const j_of_i = parseInt(parseInt(n/m) * i);
    const x1y1 = k1[j_of_i];
    const x2y2 = k2[i];
    dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
  }
  return parseInt(dist/m);
}

// initialize N-stroke map by greedy initialization
const initStrokeMap = (pattern1, pattern2, distanceMetric) => {
  const [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
  // larger is now k1 with length n
  const map = new Array();
  for(let i=0;i<n;i++) {
    map[i] = -1;
  }
  const free = new Array();
  for(let i=0;i<n;i++) {
    free[i] = true;
  }
  for(let i=0;i<m;i++) {
    let minDist = 10000000;
    let min_j = -1;
    for(let j=0;j<n;j++) {
      if(free[j] == true) {
        const d = distanceMetric(k1[j],k2[i]);
        if(d < minDist) {
          minDist = d;
          min_j = j;
        }
      }
    }
    free[min_j] = false;
    map[min_j] = i;
  }  
  return map;   
}

// get best N-stroke map by iterative improvement
const getMap = (pattern1, pattern2, distanceMetric) => {
  const [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
  // larger is now k1 with length n
  const L = 3;
  const map = initStrokeMap(k1, k2, distanceMetric);
  for(let l=0;l<L;l++) {
    for(let i=0;i<map.length;i++) {
      if(map[i] != -1) {
        let dii = distanceMetric(k1[i], k2[map[i]]);
        for(let j=0;j<map.length;j++) {
          // we need to check again, since 
          // manipulation of map[i] can occur within
          // the j-loop
          if(map[i] != -1) {
            if(map[j] != -1) {
              const djj = distanceMetric(k1[j],k2[map[j]]);
              const dij = distanceMetric(k1[j],k2[map[i]]);
              const dji = distanceMetric(k1[i],k2[map[j]]);
              if(dji + dij < dii + djj) {
                const mapj = map[j];
                map[j] = map[i];
                map[i] = mapj;
                dii = dij;
              }
            } else {
              const dij = distanceMetric(k1[j], k2[map[i]]);
              if(dij < dii) {
                map[j] = map[i];
                map[i] = -1;
                dii = dij;
              }
            }
          }
        }
      }
    }
  }
  return map;	   
}

// from optimal N-stroke map create M-N stroke map
const completeMap = (pattern1, pattern2, distanceMetric, map) => {
  console.log("completeMap", "pattern1", pattern1, "pattern2", pattern2, "map", map)
  const [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
  console.log("k1", k1, "k2", k2)
  if(!map.includes(-1)) {
    return map;
  }
  // complete at the end
  let lastUnassigned = map[map.length];
  let mapLastTo = -1;
  for(let i = map.length -1; i>=0;i--) {
    if(map[i] == -1) {
      lastUnassigned = i;
    } else {
      mapLastTo = map[i];
      break;
    }
  }
  for(let i=lastUnassigned;i<map.length;i++) {
    map[i] = mapLastTo;
  }
  // complete at the beginning
  let firstUnassigned = -1;
  let mapFirstTo = -1;
  for(let i = 0;i<map.length;i++) {
      if(map[i] == -1) {
        firstUnassigned = i;
    } else {
        mapFirstTo = map[i];
      break;
    }
  }		
  for(let i=0;i<=firstUnassigned;i++) {
    map[i] = mapFirstTo;
  }
  // for the remaining unassigned, check
  // where to "split"
  for(let i=0;i<map.length;i++) {
    if(i+1 < map.length && map[i+1] == -1) {
      // we have a situation like this:
      //   i       i+1   i+2   ...  i+n 
      //   start   -1    ?     -1   stop
      const start = i;

      let stop = i+1;
      while(stop<map.length && map[stop] == -1) {
        stop++;
      }

      let div = start;
      let max_dist = 1000000;
      for(let j=start;j<stop;j++) {
        let stroke_ab = k1[start];
        // iteration of concat, possibly slow
        // due to memory allocations; optimize?!
        for(let temp=start+1;temp<=j;temp++) {
          stroke_ab = stroke_ab.concat(k1[temp]);
        }
        let stroke_bc = k1[j+1];

        for(let temp=j+2;temp<=stop;temp++) {
          stroke_bc = stroke_bc.concat(k1[temp]);
        }

        console.log("distanceMetric", "pattern1", stroke_ab, "pattern2", k2[map[start]])
        const d_ab = distanceMetric(stroke_ab, k2[map[start]]);
        const d_bc = distanceMetric(stroke_bc, k2[map[stop]]);				
        if(d_ab + d_bc < max_dist) {
          div = j;
          max_dist = d_ab + d_bc;
        }
      }
      for(let j=start;j<=div;j++) {
        map[j] = map[start];
      }
      for(let j=div+1;j<stop;j++) {
        map[j] = map[stop];
      }
    } 
  }
  return map;
}

// given two patterns, M-N stroke map and distanceMetric function,
// compute overall distance between two patterns
const computeDistance = (pattern1, pattern2, distanceMetric, map) => {
  const [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
  let dist = 0.0;
  let idx = 0;
  while(idx < n) {
    const stroke_idx = k2[map[idx]];
    const start = idx;
    let stop  = start+1;
    while(stop<map.length && map[stop] == map[idx]) {
      stop++;
    }
    let stroke_concat = k1[start];
    for(let temp=start+1;temp<stop;temp++) {
      stroke_concat = stroke_concat.concat(k1[temp]);
    }
    dist += distanceMetric(stroke_idx, stroke_concat);
    idx = stop;
  }
  return dist;
}

// given two patterns, M-N strokemap, compute weighted (respect stroke
// length when there are concatenated strokes using the wholeWhole distance
const computeWholeDistanceWeighted = (pattern1, pattern2, map) => {
  const [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
  let dist = 0.0;
  let idx = 0;
  while(idx < n) {
    const stroke_idx = k2[map[idx]];
    const start = idx;
    let stop  = start+1;
    while(stop<map.length && map[stop] == map[idx]) {
      stop++;
    }
    let stroke_concat = k1[start];
    for(let temp=start+1;temp<stop;temp++) {
      stroke_concat = stroke_concat.concat(k1[temp]);
    }
    
    let dist_idx = wholeWholeDistance(stroke_idx, stroke_concat);
    if(stop > start + 1) {
      // concatenated stroke, adjust weight
      let mm = stroke_idx.length;
      let nn = stroke_concat.length;
      if(nn < mm) {
        const temp = nn;
        nn = mm;
        mm = temp;
      }
      dist_idx = dist_idx * (nn/mm);				
    }
    dist += dist_idx;
    idx = stop;
  }
  return dist;
}

// apply coarse classficiation w.r.t. inputPattern
// considering _all_ referencePatterns using endpoint distance
const coarseClassification = (inputPattern, refPatterns) => {
  const inputLength = inputPattern.length;
  const candidates = [];
  for(let i=0;i<refPatterns.length;i++) {
    const iLength = refPatterns[i][1];
    if(inputLength < iLength + 2 && inputLength > iLength-3) {
      const iPattern = refPatterns[i][2];
      let iMap = getMap(iPattern, inputPattern, endPointDistance);
      iMap = completeMap(iPattern, inputPattern, endPointDistance, iMap);
      const dist = computeDistance(iPattern, inputPattern, endPointDistance, iMap);
      let m = iLength;
      let n = iPattern.length;
      if(n < m) {
        const temp = n;
        n = m;
        m = temp;
      }
      candidates.push([i, (dist * (m/n))]);
    }
  }
  candidates.sort((a, b) => a[1]-b[1]);

  return candidates;
}

// fine classfication. returns best 100 matches for inputPattern
// and candidate list (which should be provided by coarse classification
const fineClassification = (inputPattern, inputCandidates, refPatterns) => {
  const inputLength = inputPattern.length;
  const candidates = [];
  for(let i=0;i<Math.min(inputCandidates.length, 100);i++) {
    const j = inputCandidates[i][0];
    const iLength = refPatterns[j][1];
    const iPattern = refPatterns[j][2];
    if(inputLength < iLength + 2 && inputLength > iLength-3) {
      let iMap = getMap(iPattern, inputPattern, initialDistance);

      iMap = completeMap(iPattern, inputPattern, wholeWholeDistance, iMap);
      if(refPatterns[j][0] == "委") {
        console.log("finished imap, fine:");
        console.log(iMap);
        console.log("weight:")
        console.log(computeDistance(iPattern, inputPattern, wholeWholeDistance, iMap));
        console.log("weight intended:")
        console.log(computeDistance(iPattern, inputPattern, wholeWholeDistance, [0,1,2,3,4,7,5,6]));
      }
      let dist = computeWholeDistanceWeighted(iPattern, inputPattern, iMap);
      const n = inputLength;
      let m = iPattern.length;
      if(m > n) {
        m = n;
      }
      dist = dist / m;
      candidates.push([j, dist]);
    }
  }
  candidates.sort((a, b) => a[1]-b[1]);
  let outStr = "";
  for(let i=0;i<Math.min(candidates.length, 10);i++) {
    outStr += refPatterns[candidates[i][0]][0];
    outStr += "  ";	   
  }	   
  document.getElementById("candidateList").innerHTML = outStr;
}

export {
  euclid,
  extractFeatures,
  endPointDistance,
  initialDistance,
  getLargerAndSize,
  wholeWholeDistance,
  initStrokeMap,
  getMap,
  completeMap,
  computeDistance,
  computeWholeDistanceWeighted,
  coarseClassification,
  fineClassification,
};