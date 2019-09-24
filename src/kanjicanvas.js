  // init html page and canvas
  function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
      findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
      findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
      findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
      findxy('out', e)
    }, false);
	canvas.addEventListener("mouseover", function (e) {
      findxy('over', e)
    }, false);
  }

  function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }

  function deleteLast() {
    ctx.clearRect(0, 0, w, h);
    for(var i = 0;i<recordedPattern.length-1;i++) {
      var stroke_i = recordedPattern[i];
      for(var j = 0; j<stroke_i.length-1;j++) {
        prevX = stroke_i[j][0];
        prevY = stroke_i[j][1];

        currX = stroke_i[j+1][0];
        currY = stroke_i[j+1][1];
        draw();
      }
    }
    recordedPattern.pop();
  }

  function erase() {
    ctx.clearRect(0, 0, w, h);
    recordedPattern.length = 0;
  }

  function findxy(res, e) {
    if (res == 'down') {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      currentLine = new Array();
      currentLine.push([currX, currY]);

      flagDown = true;
	  flagOver = true;
      dot_flag = true;
      if (dot_flag) {
        ctx.beginPath();
        ctx.fillRect(currX, currY, 2, 2);
        ctx.closePath();
        dot_flag = false;
      }
    }
    if (res == 'up') {
      flagDown = false;
	  if(flagOver == true) {
          recordedPattern.push(currentLine);
	  }
    }

    if (res == "out") {
      flagOver = false;
	  if(flagDown == true) {
	      recordedPattern.push(currentLine);
	  }
	  flagDown = false;
    }
	
	/*
	if (res == "over") {
    }
	*/

    if (res == 'move') {
      if (flagOver && flagDown) {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;
        currentLine.push([prevX, prevY]);
        currentLine.push([currX, currY]);
        draw();
      }
    }
  }

  // redraw to current canvas according to 
  // what is currently stored in recordedPattern
  // add numbers to each stroke
  function redraw() {
      ctx.clearRect(0, 0, w, h);
      for(var i = 0;i<recordedPattern.length;i++) {
        var stroke_i = recordedPattern[i]
		ctx.font = "20px Arial";
		ctx.fillText(i.toString(), stroke_i[0][0]+20, stroke_i[0][1]+20);
        for(var j = 0; j<stroke_i.length-1;j++) {
          prevX = stroke_i[j][0];
          prevY = stroke_i[j][1];

          currX = stroke_i[j+1][0];
          currY = stroke_i[j+1][1];
          draw();
        }
      }
  }

  // linear normalization for recordedPattern
  function normalizeLinear() {

    var normalizedPattern = new Array();
    newHeight = 256;
    newWidth = 256;
    xMin = 256;
    xMax = 0;
    yMin = 256;
    yMax = 0;
    // first determine drawn character width / length
    for(var i = 0;i<recordedPattern.length;i++) {
      var stroke_i = recordedPattern[i];
      for(var j = 0; j<stroke_i.length;j++) {
        x = stroke_i[j][0];
        y = stroke_i[j][1];
        if(x < xMin) {
          xMin = x;
        }
        if(x > xMax) {
          xMax = x;
        }
        if(y < yMin) {
          yMin = y;
        }
        if(y > yMax) {
          yMax = y;
        }
      }
    }	
    oldHeight = Math.abs(yMax - yMin);
    oldWidth  = Math.abs(xMax - xMin);

    for(var i = 0;i<recordedPattern.length;i++) {
      var stroke_i = recordedPattern[i];
      var normalized_stroke_i = new Array();
      for(var j = 0; j<stroke_i.length;j++) {
        x = stroke_i[j][0];
        y = stroke_i[j][1];
        xNorm = (x - xMin) * (newWidth / oldWidth) ;
        yNorm = (y - yMin) * (newHeight / oldHeight);
        normalized_stroke_i.push([xNorm, yNorm]);
      }
      normalizedPattern.push(normalized_stroke_i);
    }
    recordedPattern = normalizedPattern;
    redraw();
  }
  
   // helper functions for moment normalization 

   function m10(pattern) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
		    var stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				sum += stroke_i[j][0];
			}			
		}
		return sum;
	}
	
	function m01(pattern) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
			var stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				sum += stroke_i[j][1];
			}			
		}
		return sum;
	}
		
	function m00(pattern) {
	    var sum = 0;
		for(var i=0;i<pattern.length;i++) {
		   var stroke_i = pattern[i];
		   sum += stroke_i.length;
		}
		return sum;
	}
	
	function mu20(pattern, xc) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
			stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				var diff = stroke_i[j][0] - xc;
				sum += (diff * diff);
			}			
		}
		return sum;
	}
	
	function mu02(pattern, yc) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
			stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				var diff = stroke_i[j][1] - yc;
				sum += (diff * diff);
			}			
		}
		return sum;
	}
   
   	function aran(width, height) {
		
		var r1 = 0.;
		if(height > width) {
			r1 = width / height;
		} else {
			r1 = height / width;
		}
		
		var a = Math.PI / 2.;
		var b = a * r1;
		var b1 = Math.sin(b);
		var c = Math.sqrt(b1);
		var d = c;
		
		var r2 = Math.sqrt(Math.sin((Math.PI/2.) * r1));
		return r2;
	}
	
	function chopOverbounds(pattern) {
		
		var chopped = new Array();
		for(var i=0;i<pattern.length;i++) {
		    var stroke_i = pattern[i];
			var c_stroke_i = new Array();
			for(var j=0;j<stroke_i.length;j++) {
			    var x = stroke_i[j][0];
				var y = stroke_i[j][1];			
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
	
	function transform(pattern, x_, y_) {
	var pt = new Array();
		for(var i=0;i<pattern.length;i++) {
		    var stroke_i = pattern[i];
			var c_stroke_i = new Array();
			for(var j=0;j<stroke_i.length;j++) {
			    var x = stroke_i[j][0]+x_;
				var y = stroke_i[j][1]+y_;
				c_stroke_i.push([x,y]);
			}
			pt.push(c_stroke_i);
		}
		return pt;			
	}

	// main function for moment normalization
	function momentNormalize() {
			
		newHeight = 256;
		newWidth = 256;
		xMin = 256;
		xMax = 0;
		yMin = 256;
		yMax = 0;
		// first determine drawn character width / length
		for(var i = 0;i<recordedPattern.length;i++) {
		  var stroke_i = recordedPattern[i];
		  for(var j = 0; j<stroke_i.length;j++) {
			x = stroke_i[j][0];
			y = stroke_i[j][1];
			if(x < xMin) {
			  xMin = x;
			}
			if(x > xMax) {
			  xMax = x;
			}
			if(y < yMin) {
			  yMin = y;
			}
			if(y > yMax) {
			  yMax = y;
			}
		  }
		}	
		oldHeight = Math.abs(yMax - yMin);
		oldWidth  = Math.abs(xMax - xMin);
			
		var r2 = aran(oldWidth, oldHeight);
		
		var aranWidth = newWidth;
		var aranHeight = newHeight;
		
		if(oldHeight > oldWidth) {
			aranWidth = r2 * newWidth; 
		} else {
			aranHeight = r2 * newHeight;
		}		
				
		var xOffset = (newWidth - aranWidth)/2;
		var yOffset = (newHeight - aranHeight)/2; 
		
		var m00_ = m00(recordedPattern);
		var m01_ = m01(recordedPattern);
		var m10_ = m10(recordedPattern);
				
		var xc_ = (m10_/m00_);
		var yc_ = (m01_/m00_);
				
		var xc_half = aranWidth/2;
		var yc_half = aranHeight/2;
		
		var mu20_ = mu20(recordedPattern, xc_);
		var mu02_ = mu02(recordedPattern, yc_);

		var alpha = (aranWidth) / (4 * Math.sqrt(mu20_/m00_));
		var beta = (aranHeight) / (4 * Math.sqrt(mu02_/m00_));
			
		var nf = new Array();
		for(var i=0;i<recordedPattern.length;i++) {
			var si = recordedPattern[i];
			var nsi = new Array();
			for(var j=0;j<si.length;j++) {
				
				var newX = (alpha * (si[j][0] - xc_) + xc_half);
				var newY = (beta * (si[j][1] - yc_) + yc_half);
				
				nsi.push([newX,newY]);
			}
			nf.push(nsi);
		}

		return transform(nf, xOffset, yOffset);
	}
	
  // distance functions
  function euclid(x1y1, x2y2) {
      var a = x1y1[0] - x2y2[0];
      var b = x1y1[1] - x2y2[1];
      var c = Math.sqrt( a*a + b*b );
	  return c;
  }

  // extract points in regular intervals
  function extractFeatures(kanji, interval) {
      var extractedPattern = new Array();
      var nrStrokes = kanji.length;
	  for(var i = 0;i<nrStrokes;i++) {
	      var stroke_i = kanji[i];
		  var extractedStroke_i = new Array();
		  var dist = 0.0;
	      var j = 0;
		  while(j < stroke_i.length) {
		      // always add first point
		      if(j==0) {
			  	  var x1y1 = stroke_i[0];
		          extractedStroke_i.push(x1y1);
			  }
		      if(j > 0) {
			      var x1y1 = stroke_i[j-1];
				  var x2y2 = stroke_i[j];
		          dist += euclid(x1y1, x2y2);
              }
			  if((dist >= interval) && (j>1)) {
			      dist = dist - interval;
				  var x1y1 = stroke_i[j];
				  extractedStroke_i.push(x1y1);
			  }
			  j++;
		  }
		  // if we so far have only one point, always add last point
		  if(extractedStroke_i.length == 1) {
		      var x1y1 = stroke_i[stroke_i.length-1];
		      extractedStroke_i.push(x1y1);
		  } else {
		      if(dist > (0.75 * interval)) {
			      var x1y1 = stroke_i[stroke_i.length-1];
		          extractedStroke_i.push(x1y1);
			  }		  
		  }
		  extractedPattern.push(extractedStroke_i);
	  }
      return extractedPattern;
   }
   
   /* test extraction function
   function extractTest() {
      //var ex = extractFeatures(recordedPattern, 20.);
	  //recordedPattern = ex;

      //redraw();
	  
	  var norm = normalizeLinearTest(test4);
	  var ex = extractFeatures(norm, 20.);
	  //console.log(ex);
	  
   }*/
   
   function endPointDistance(pattern1, pattern2) {
       var dist = 0;
	   var l1 = pattern1.length;
	   var l2 = pattern2.length;
       if(l1 == 0 || l2 == 0) {
          return 0;
       } else {
	       var x1y1 = pattern1[0];
		   var x2y2 = pattern2[0];
		   dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
           x1y1 = pattern1[l1-1];
		   x2y2 = pattern2[l2-1];
		   dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
	   }
	   return dist;
   }
   
   function initialDistance(pattern1, pattern2) {
       var l1 = pattern1.length;
	   var l2 = pattern2.length;
	   var lmin = Math.min(l1,l2);
	   var lmax = Math.max(l1,l2);
	   var dist = 0;
	   for(var i = 0; i<lmin;i++) {
	       var x1y1 = pattern1[i];
		   var x2y2 = pattern2[i];
	       dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
	   }
	   return dist * (lmax / lmin);
   }
   
   // given to pattern, determine longer (more strokes)
   // and return quadruple with sorted patterns and their
   // stroke numbers [k1,k2,n,m] where n >= m and 
   // they denote the #of strokes of k1 and k2
   function getLargerAndSize(pattern1, pattern2) {
	   var l1 = pattern1.length;
	   var l2 = pattern2.length;
	   // definitions as in paper 
	   // i.e. n is larger 
	   var n = l1;
	   var m = l2;
	   var k1 = pattern1;
	   var k2 = pattern2;
	   if(l1 < l2) {
	       m = l1;
		   n = l2;
		   k1 = pattern2;
		   k2 = pattern1;
	   }	   	   
       return [k1,k2,n,m];
   }
   
   function wholeWholeDistance(pattern1, pattern2) {
       var [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
	   var dist = 0;
	   for(var i = 0; i<m;i++) {
	       j_of_i = parseInt(parseInt(n/m) * i);
		   var x1y1 = k1[j_of_i];
		   var x2y2 = k2[i];
	       dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
	   }
	   return parseInt(dist/m);
   }
   
   // initialize N-stroke map by greedy initialization
   function initStrokeMap(pattern1, pattern2, distanceMetric) {
	   var [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
	   // larger is now k1 with length n
	   var map = new Array();
	   for(var i=0;i<n;i++) {
	      map[i] = -1;
	   }
	   var free = new Array();
	   for(var i=0;i<n;i++) {
	      free[i] = true;
	   }
	   for(var i=0;i<m;i++) {
           minDist = 10000000;
		   min_j = -1;
		   for(var j=0;j<n;j++) {
		       if(free[j] == true) {
			       var d = distanceMetric(k1[j],k2[i]);
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
	function getMap(pattern1, pattern2, distanceMetric) {
       var [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
	   // larger is now k1 with length n
	   var L = 3;
	   var map = initStrokeMap(k1, k2, distanceMetric);
	   for(var l=0;l<L;l++) {
	       for(var i=0;i<map.length;i++) {
		       if(map[i] != -1) {
                   dii = distanceMetric(k1[i], k2[map[i]]);
				   for(var j=0;j<map.length;j++) {
				       // we need to check again, since 
					   // manipulation of map[i] can occur within
					   // the j-loop
					   if(map[i] != -1) {
					       if(map[j] != -1) {
						      var djj = distanceMetric(k1[j],k2[map[j]]);
                              var dij = distanceMetric(k1[j],k2[map[i]]);
                              var dji = distanceMetric(k1[i],k2[map[j]]);
							  if(dji + dij < dii + djj) {
							      var mapj = map[j];
								  map[j] = map[i];
								  map[i] = mapj;
								  dii = dij;
							  }
						   } else {
						       var dij = distanceMetric(k1[j], k2[map[i]]);
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
	function completeMap(pattern1, pattern2, distanceMetric, map) {
		var [k1,k2,_,_] = getLargerAndSize(pattern1, pattern2);
	    if(!map.includes(-1)) {
		    return map;
		}
		// complete at the end
		var lastUnassigned = map[map.length];
		var mapLastTo = -1;
		for(var i = map.length -1; i>=0;i--) {
		    if(map[i] == -1) {
			    lastUnassigned = i;
			} else {
			    mapLastTo = map[i];
			    break;
			}
		}
		for(var i=lastUnassigned;i<map.length;i++) {
		    map[i] = mapLastTo;
		}
		// complete at the beginning
		var firstUnassigned = -1;
		var mapFirstTo = -1;
		for(var i = 0;i<map.length;i++) {
		    if(map[i] == -1) {
			    firstUnassigned = i;
			} else {
			    mapFirstTo = map[i];
				break;
			}
		}		
		for(var i=0;i<=firstUnassigned;i++) {
		    map[i] = mapFirstTo;
		}
		// for the remaining unassigned, check
		// where to "split"
        for(var i=0;i<map.length;i++) {
            if(i+1 < map.length && map[i+1] == -1) {
               // we have a situation like this:
               //   i       i+1   i+2   ...  i+n 
               //   start   -1    ?     -1   stop
               var start = i;

               var stop = i+1;
               while(stop<map.length && map[stop] == -1) {
                  stop++;
               }

               var div = start;
               var max_dist = 1000000;
               for(var j=start;j<stop;j++) {
                   var stroke_ab = k1[start];
				   // iteration of concat, possibly slow
				   // due to memory allocations; optimize?!
			     	for(var temp=start+1;temp<=j;temp++) {
				       stroke_ab = stroke_ab.concat(k1[temp]);
			    	}
				   var stroke_bc = k1[j+1];

				   for(var temp=j+2;temp<=stop;temp++) {
				       stroke_bc = stroke_bc.concat(k1[temp]);
				   }

				   var d_ab = distanceMetric(stroke_ab, k2[map[start]]);
				   var d_bc = distanceMetric(stroke_bc, k2[map[stop]]);				
                   if(d_ab + d_bc < max_dist) {
                       div = j;
                       max_dist = d_ab + d_bc;
                   }
               }
               for(var j=start;j<=div;j++) {
                   map[j] = map[start];
               }
               for(var j=div+1;j<stop;j++) {
                   map[j] = map[stop];
               }
            } 
        }
    return map;
	}
	
	// given two patterns, M-N stroke map and distanceMetric function,
	// compute overall distance between two patterns
	function computeDistance(pattern1, pattern2, distanceMetric, map) {
	     var [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
		 var dist = 0.0;
		 var idx = 0;
		 while(idx < n) {
		     var stroke_idx = k2[map[idx]];
			 var start = idx;
			 var stop  = start+1;
			 while(stop<map.length && map[stop] == map[idx]) {
                  stop++;
             }
			 var stroke_concat = k1[start];
			 for(var temp=start+1;temp<stop;temp++) {
				stroke_concat = stroke_concat.concat(k1[temp]);
			 }
			 dist += distanceMetric(stroke_idx, stroke_concat);
			 idx = stop;
		 }
		 return dist;
	}
	
	// given two patterns, M-N strokemap, compute weighted (respect stroke
	// length when there are concatenated strokes using the wholeWhole distance
	function computeWholeDistanceWeighted(pattern1, pattern2, map) {
	     var [k1,k2,n,m] = getLargerAndSize(pattern1, pattern2);
		 var dist = 0.0;
		 var idx = 0;
		 while(idx < n) {
		     var stroke_idx = k2[map[idx]];
			 var start = idx;
			 var stop  = start+1;
			 while(stop<map.length && map[stop] == map[idx]) {
                  stop++;
             }
			 var stroke_concat = k1[start];
			 for(var temp=start+1;temp<stop;temp++) {
				stroke_concat = stroke_concat.concat(k1[temp]);
			 }
			 
			 var dist_idx = wholeWholeDistance(stroke_idx, stroke_concat);
			 if(stop > start + 1) {
			    // concatenated stroke, adjust weight
				var mm = stroke_idx.length;
				var nn = stroke_concat.length;
				if(nn < mm) {
				   var temp = nn;
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
	function coarseClassification(inputPattern)  {
	   var inputLength = inputPattern.length;
	   var candidates = [];
	   for(var i=0;i<refPatterns.length;i++) {
	       var iLength = refPatterns[i][1];
		   if(inputLength < iLength + 2 && inputLength > iLength-3) {
		       var iPattern = refPatterns[i][2];
			   var iMap = getMap(iPattern, inputPattern, endPointDistance);
			   iMap =  completeMap(iPattern, inputPattern, endPointDistance, iMap);
			   var dist = computeDistance(iPattern, inputPattern, endPointDistance, iMap);
			   var m = iLength;
			   var n = iPattern.length;
			   if(n < m) {
			       var temp = n;
				   n = m;
				   m = temp;
			   }
			   candidates.push([i, (dist * (m/n))]);
		   }
	   }
	   candidates.sort(function(a, b){return a[1]-b[1]});
	   /*
	   var outStr = "";
	   for(var i=0;i<candidates.length;i++) {
	       outStr += candidates[i][0];
		   outStr += " ";
		   outStr += candidates[i][1];
		   outStr += refPatterns[candidates[i][0]][0];
		   outStr += "|";	   
	   }	   
	   document.getElementById("coarseCandidateList").innerHTML = outStr;
	   */
	   return candidates;
	}
	
	// fine classfication. returns best 100 matches for inputPattern
	// and candidate list (which should be provided by coarse classification
	function fineClassification(inputPattern, inputCandidates) {
	   var inputLength = inputPattern.length;
	   var candidates = [];
	   for(var i=0;i<Math.min(inputCandidates.length, 100);i++) {
	       var j = inputCandidates[i][0];
	       var iLength = refPatterns[j][1];
		   var iPattern = refPatterns[j][2];
		      		   if(inputLength < iLength + 2 && inputLength > iLength-3) {

		   var iMap = getMap(iPattern, inputPattern, initialDistance);

		   iMap =  completeMap(iPattern, inputPattern, wholeWholeDistance, iMap);
		   if(refPatterns[j][0] == "委") {
		     console.log("finished imap, fine:");
		     console.log(iMap);
			 console.log("weight:")
			 console.log(computeDistance(iPattern, inputPattern, wholeWholeDistance, iMap));
			 console.log("weight intended:")
			 console.log(computeDistance(iPattern, inputPattern, wholeWholeDistance, [0,1,2,3,4,7,5,6]));
			 }
		   var dist = computeWholeDistanceWeighted(iPattern, inputPattern, iMap);
		   var n = inputLength;
		   var m = iPattern.length;
		   if(m > n) {
		       m = n;
		   }
		   dist = dist / m;
		   candidates.push([j, dist]);
	   }
	   }
	   candidates.sort(function(a, b){return a[1]-b[1]});
	   var outStr = "";
	   for(var i=0;i<Math.min(candidates.length, 10);i++) {
	       //outStr += candidates[i][0];
		   //outStr += " ";
		   //outStr += candidates[i][1];
		   outStr += refPatterns[candidates[i][0]][0];
		   outStr += "  ";	   
	   }	   
	   document.getElementById("candidateList").innerHTML = outStr;
	}
	
	/* test function for N-pair and M-N stroke map computation
	function testMap() {
	  // var map = initStrokeMap(test_k21,test_k2,endPointDistance);
	    // should give
        // 0  1  2 3 
        // 0 -1 -1 1  
	  var map = getMap(test_k21,test_k2,endPointDistance);
	    // should also give
        // 0  1  2 3 
        // 0 -1 -1 1  
	  map = completeMap(test_k21,test_k2,endPointDistance, map);
	    // should give
        // 0  1  2 3 
        // 0 0 1 1  
	  console.log(map);	
	  
	  map = getMap(test_k22,test_k2,endPointDistance);
	    // 0  1  2 3 
        // 0 -1 -1 1
	  map = completeMap(test_k22,test_k2,endPointDistance, map);
       // 0 1 2 3 
        // 0 0 0 1  
	  console.log(map);	
	  
	  	  map = getMap(test_k23,test_k2,endPointDistance);
        // 0  1  2 3 
        // 0 -1 -1 1   
	  map = completeMap(test_k23,test_k2,endPointDistance, map);
        // 0  1  2 3 
        // 0  1  1 1
	  console.log(map);	
	}
	*/
	
	function recognize() {
		   
	   var mn = momentNormalize();

	   var extractedFeatures = extractFeatures(mn, 20.);
  
	   var map = getMap(extractedFeatures, refPatterns[0][2] ,endPointDistance);
	   map = completeMap(extractedFeatures, refPatterns[0][2],endPointDistance, map);

	   var candidates = coarseClassification(extractedFeatures);
	   fineClassification(extractedFeatures, candidates);
	   
	   redraw();
	   
	}
	
	/* test moment normalization 
	function MomentTest() {
	  recordedPattern = test4;
	  var mn = momentNormalize();
	  recordedPattern = mn;
	  console.log(mn);
	  redraw();
	
	} */
	
	/* copy current drawn pattern
	   as array to clipboard
	   i.e. to add missing patterns
	*/
	function copyToClipboard(str) {
		const el = document.createElement('textarea');
		el.value = str;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}
	
	function copyStuff() {
	 s = "";
	 for(var i =0; i< recordedPattern.length-1;i++) {
	 console.log(i);
	   s+= "["+recordedPattern[i].toString()+"],";
	}
	s+= "["+recordedPattern[recordedPattern.length-1].toString()+"]";
	copyToClipboard(s);
	}
   