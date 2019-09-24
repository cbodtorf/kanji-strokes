<template>
  <div>
    <div class="my-canvas-wrapper">
      <canvas ref="my-canvas"></canvas>
    </div>
    <div class="c-controls">
      <button @click="erase" style="width:70;height:30;">Erase</button>
      <button @click="deleteLast" style="width:150;height:30;">Erase Last Stroke</button>
      <button @click="recognize" style="width:40;height:30;">&#128269;</button>
    </div>
  </div>
</template>

<script>
import {
  // euclid,
  extractFeatures,
  endPointDistance,
  // initialDistance,
  // getLargerAndSize,
  // wholeWholeDistance,
  // initStrokeMap,
  getMap,
  completeMap,
  // computeDistance,
  // computeWholeDistanceWeighted,
  coarseClassification,
  fineClassification,
} from '../util/index.js';

import {
  m10,
  m01,
  m00,
  mu20,
  mu02,
  aran,
  transform,
} from '../util/normalization'

export default {
  props: ['refPatterns'],
  data() {
    return {
      // By creating the provider in the data property, it becomes reactive,
      // so child components will update when `context` changes.
      provider: {
        // This is the CanvasRenderingContext that children will draw to.
        context: null
      },
      events: ['move', 'down', 'up', 'out', 'over'],
      touchEvents: ['start', 'end', 'move'],
      recordedPattern: [],
      prevX: 0,
      prevY: 0,
      currX: 0,
      currY: 0,
      flagDown: false,
      flagOver: false,
      currentLine: [],
      mousePos: { x:0, y:0 },
    }
  },

  // Allows any child component to `inject: ['provider']` and have access to it.
  provide () {
    return {
      provider: this.provider
    }
  },

  mounted () {
    // We can't access the rendering context until the canvas is mounted to the DOM.
    // Once we have it, provide it to all child components.
    // console.log("refs", this.$refs['my-canvas'])
    const canvas = this.$refs['my-canvas']
    this.provider.context = canvas.getContext('2d')

    // Resize the canvas to fit its parent's width.
    // Normally you'd use a more flexible resize system.
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight

    this.w = canvas.width;
    this.h = canvas.height;

    // // Prevent scrolling when touching the canvas
    // document.body.addEventListener("touchstart", function (e) {
    //     if (e.target == canvas) {
    //         e.preventDefault();
    //     }
    // }, { passive: false });
    // document.body.addEventListener("touchend", function (e) {
    //     if (e.target == canvas) {
    //         e.preventDefault();
    //     }
    // }, { passive: false });
    // document.body.addEventListener("touchmove", function (e) {
    //     if (e.target == canvas) {
    //         e.preventDefault();
    //     }
    // }, { passive: false });

    // Set up touch events for mobile, etc
    this.touchEvents.forEach((direction) => {
      document.body.addEventListener(`touch${direction}`, (e) => {
        if (e.target == canvas) {
          // eslint-disable-next-line
          console.log('hey target is canvas')
          e.preventDefault();
        }

        if(direction === 'start') {
          this.mousePos = this.getTouchPos(canvas, e);
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          canvas.dispatchEvent(mouseEvent);
        } else if (direction === 'end') {
          const mouseEvent = new MouseEvent("mouseup", {});
          canvas.dispatchEvent(mouseEvent);
        } else if (direction === 'move') {
          this.mousePos = this.getTouchPos(canvas, e);
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          canvas.dispatchEvent(mouseEvent);
        }
        this.findxy(`touch${direction}`, e)
      }, { passive: false });
    })

    this.events.forEach((direction) => {
      canvas.addEventListener(`mouse${direction}`, (e) => {
        this.findxy(direction, e)
      }, false);
    })
  },

  methods: {
    getTouchPos(canvasDom, touchEvent) {
      var rect = canvasDom.getBoundingClientRect();
      return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
      };
    },
  
    clearRect(ctx) {
      ctx.clearRect(0, 0, this.w, this.h)
    },

    erase() {
      const ctx = this.provider.context

      this.clearRect(ctx)
      this.recordedPattern.length = 0
    },

    deleteLast() {
      const ctx = this.provider.context

      this.clearRect(ctx)
      for(var i = 0;i<this.recordedPattern.length-1;i++) {
        var stroke_i = this.recordedPattern[i]
        for(var j = 0; j<stroke_i.length-1;j++) {
          this.prevX = stroke_i[j][0]
          this.prevY = stroke_i[j][1]

          this.currX = stroke_i[j+1][0]
          this.currY = stroke_i[j+1][1]
          this.draw();
        }
      }
      this.recordedPattern.pop();
    },

    draw() {
      const ctx = this.provider.context

      ctx.beginPath();
      ctx.moveTo(this.prevX, this.prevY);
      ctx.lineTo(this.currX, this.currY);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    },

    // redraw to current canvas according to 
    // what is currently stored in recordedPattern
    // add numbers to each stroke
    redraw() {
      const ctx = this.provider.context

      this.clearRect(ctx)
      for(var i = 0;i<this.recordedPattern.length;i++) {
        const stroke_i = this.recordedPattern[i]
        ctx.font = "20px Arial";
        ctx.fillText(i.toString(), stroke_i[0][0]+20, stroke_i[0][1]+20);
        for(var j = 0; j<stroke_i.length-1;j++) {
          this.prevX = stroke_i[j][0];
          this.prevY = stroke_i[j][1];

          this.currX = stroke_i[j+1][0];
          this.currY = stroke_i[j+1][1];
          this.draw();
        }
      }
    },

    findxy(res, e) {
      // eslint-disable-next-line
      // console.log("event", e.clientX, e.clientY)
      const canvas = this.$refs['my-canvas']
      const ctx = this.provider.context

      if (res == 'down') {
        this.prevX = this.currX;
        this.prevY = this.currY;
        this.currX = e.clientX - canvas.offsetLeft;
        this.currY = e.clientY - canvas.offsetTop;
        this.currentLine = new Array();
        this.currentLine.push([this.currX, this.currY]);

        this.flagDown = true
        this.flagOver = true;
        this.dot_flag = true;
        if (this.dot_flag) {
          ctx.beginPath();
          ctx.fillRect(this.currX, this.currY, 2, 2);
          ctx.closePath();
          this.dot_flag = false;
        }
      }
      if (res == 'up') {
        this.flagDown = false;
        if(this.flagOver == true) {
          this.recordedPattern.push(this.currentLine);
        }
      }

      if (res == "out") {
        this.flagOver = false;
        if(this.flagDown == true) {
          this.recordedPattern.push(this.currentLine);
        }
        this.flagDown = false;
      }

      if (res == 'move') {
        if (this.flagOver && this.flagDown) {
          this.prevX = this.currX;
          this.prevY = this.currY;
          this.currX = e.clientX - canvas.offsetLeft;
          this.currY = e.clientY - canvas.offsetTop;
          this.currentLine.push([this.prevX, this.prevY]);
          this.currentLine.push([this.currX, this.currY]);
          this.draw();
        }
      }
    },

    // linear normalization for recordedPattern
    normalizeLinear() {
      const normalizedPattern = new Array();
      const newHeight = 256;
      const newWidth = 256;
      let xMin = 256;
      let xMax = 0;
      let yMin = 256;
      let yMax = 0;
      // first determine drawn character width / length
      for(let i = 0;i<this.recordedPattern.length;i++) {
        const stroke_i = this.recordedPattern[i];
        for(let j = 0; j<stroke_i.length;j++) {
          const x = stroke_i[j][0];
          const y = stroke_i[j][1];
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
      const oldHeight = Math.abs(yMax - yMin);
      const oldWidth = Math.abs(xMax - xMin);

      for(let i = 0;i<this.recordedPattern.length;i++) {
        const stroke_i = this.recordedPattern[i];
        const normalized_stroke_i = new Array();
        for(let j = 0; j<stroke_i.length;j++) {
          const x = stroke_i[j][0];
          const y = stroke_i[j][1];
          const xNorm = (x - xMin) * (newWidth / oldWidth) ;
          const yNorm = (y - yMin) * (newHeight / oldHeight);
          normalized_stroke_i.push([xNorm, yNorm]);
        }
        normalizedPattern.push(normalized_stroke_i);
      }
      this.recordedPattern = normalizedPattern;
      this.redraw();
    },

    // main function for moment normalization
    momentNormalize() {
      // eslint-disable-next-line
      console.log("this.recordedPattern", this.recordedPattern)
      const newHeight = 256;
      const newWidth = 256;
      let xMin = 256;
      let xMax = 0;
      let yMin = 256;
      let yMax = 0;
      // first determine drawn character width / length
      for(let i = 0;i<this.recordedPattern.length;i++) {
        const stroke_i = this.recordedPattern[i];
        for(let j = 0; j<stroke_i.length;j++) {
          const x = stroke_i[j][0];
          const y = stroke_i[j][1];
          if(x < xMin) {
            xMin = x;
          }
          if(x > xMax) {
            xMax = x;
          }
          if(this.y < yMin) {
            yMin = y;
          }
          if(y > yMax) {
            yMax = y;
          }
        }
      }	
      const oldHeight = Math.abs(yMax - yMin);
      const oldWidth  = Math.abs(xMax - xMin);
        
      const r2 = aran(oldWidth, oldHeight);
      
      let aranWidth = newWidth;
      let aranHeight = newHeight;
      
      if(oldHeight > oldWidth) {
        aranWidth = r2 * newWidth; 
      } else {
        aranHeight = r2 * newHeight;
      }		
          
      const xOffset = (newWidth - aranWidth)/2;
      const yOffset = (newHeight - aranHeight)/2; 
      
      const m00_ = m00(this.recordedPattern);
      const m01_ = m01(this.recordedPattern);
      const m10_ = m10(this.recordedPattern);
          
      const xc_ = (m10_/m00_);
      const yc_ = (m01_/m00_);
          
      const xc_half = aranWidth/2;
      const yc_half = aranHeight/2;
      
      const mu20_ = mu20(this.recordedPattern, xc_);
      const mu02_ = mu02(this.recordedPattern, yc_);

      const alpha = (aranWidth) / (4 * Math.sqrt(mu20_/m00_));
      const beta = (aranHeight) / (4 * Math.sqrt(mu02_/m00_));
        
      const nf = new Array();
      for(let i=0;i<this.recordedPattern.length;i++) {
        const si = this.recordedPattern[i];
        const nsi = new Array();
        for(let j=0;j<si.length;j++) {  
          const newX = (alpha * (si[j][0] - xc_) + xc_half);
          const newY = (beta * (si[j][1] - yc_) + yc_half);
          
          nsi.push([newX,newY]);
        }
        nf.push(nsi);
      }

      return transform(nf, xOffset, yOffset);
    },

    recognize() {
      const mn = this.momentNormalize();
      // eslint-disable-next-line
      console.log("mn", mn)
      const extractedFeatures = extractFeatures(mn, 20.);

      // eslint-disable-next-line
      console.log("extractedFeatures", extractedFeatures)
      // eslint-disable-next-line
      console.log("this.refPatterns[0][2]", this.refPatterns[0][2])
      // eslint-disable-next-line
      let map = getMap(extractedFeatures, this.refPatterns[0][2] ,endPointDistance);
      map = completeMap(extractedFeatures, this.refPatterns[0][2],endPointDistance, map);

      const candidates = coarseClassification(extractedFeatures, this.refPatterns);
      fineClassification(extractedFeatures, candidates, this.refPatterns);
      
      this.redraw();
    }
  }
}
</script>

<style>
.c-controls {
  /* position: absolute; */
  top: 0;
  text-align: center;
  width: 100%;
  border: 2px solid;
  background: white;
}
.c-controls button {
  -webkit-appearance: none;
  border: none;
  border-left: 2px solid;
  outline: none;
  background: white;
}
.my-canvas-wrapper {
  /* position: relative; */
  -webkit-overflow-scrolling: auto;
}
.my-canvas-wrapper canvas {
  margin-bottom: 35px;
  touch-action: none;
  border: 2px solid black;
}
</style>