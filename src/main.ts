import "./style.css";

const APP_NAME = "Hallo";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
app.innerHTML = APP_NAME;

//Creates Game Title Text
const gameName = "Gjibrish";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// Create Canvas
const Canvas_SizeX: number = 256;
const Canvas_SizeY: number = 256;
//Drawing Logic
interface Point {
  x: number;
  y: number;
}
const pointLog: Point[][] = [];
const line1: Point[] = [];
pointLog.push(line1);

const undoLog: Point[][] = [];
const drawEvent = new CustomEvent("canvasDrawn", {});
//Variables
let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;
let numLines: number = 0;

const canvas = document.getElementById("canvas") as HTMLElement | null;
if (!canvas) {
  console.log("No canvas element found");
} else {
  // @ts-ignore: keep getting error "getContext does not exist on type HTML, when it works fine"
  const pen = canvas.getContext("2d");
  // Reset canvas
  clearCanvas(pen);

  //Mouse Down
  canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    const newline: Point[] = [];
    pointLog.push(newline);
    numLines++;
  });
  //Move Mouse
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      x = e.offsetX;
      y = e.offsetY;
      const newpoint: Point = { x: x, y: y };
      if (!pointLog.length) {
        const newline: Point[] = [];
        pointLog.push(newline);
      }
      pointLog[numLines].push(newpoint);
      canvas.dispatchEvent(drawEvent);
    }
  });
  //Draw Event Listener
  canvas.addEventListener("canvasDrawn", () => {
    clearCanvas(pen);
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        if (line.length > 0) {
          for (let j = 0; j < line.length - 1; j++) {
            const thispoint = line[j];
            const nextpoint = line[j + 1];
            drawLine(pen, thispoint.x, thispoint.y, nextpoint.x, nextpoint.y);
          }
        } else {
          //console.log("inner list length 0");
        }
      }
    }
  });
  //Mouse Up
  document.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      drawLine(pen, x, y, e.offsetX, e.offsetY);
      x = 0;
      y = 0;
      isDrawing = false;
    }
  });

  //Create Clear Button
  const Clear_Button = document.createElement("button");
  Clear_Button.textContent = "Clear Canvas";
  app.append(Clear_Button);
  Clear_Button.addEventListener("click", () => formatCanvas(pen));

  //Create Undo Button
  const Undo_Button = document.createElement("button");
  Undo_Button.textContent = "Undu";
  app.append(Undo_Button);
  Undo_Button.addEventListener("click", () => undoLine(pen));
  
  //Create Redo Button
  const Redo_Button = document.createElement("button");
  Redo_Button.textContent = "Redu";
  app.append(Redo_Button);
  Redo_Button.addEventListener("click", () => RedoLine(pen));
  }

//Draw line
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
function clearCanvas(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, Canvas_SizeX, Canvas_SizeY);
  context.fillStyle = "cornsilk";
  context.fillRect(0, 0, Canvas_SizeX, Canvas_SizeY);
}
function formatCanvas(context: CanvasRenderingContext2D) {
  clearCanvas(context);
  pointLog.length = 0;
  const newline: Point[] = [];
  pointLog.push(newline);
  numLines = 0;
  x = 0;
  y = 0;
}
function undoLine(context: CanvasRenderingContext2D) {
  if (canvas) {
    if (pointLog.length > 0) {
      const removed_line = pointLog.pop();
      if(removed_line){
        if(removed_line.length == 0){
          undoLine(context);
        }
        undoLog.push(removed_line);
        numLines--;
        canvas.dispatchEvent(drawEvent);
        console.log(removed_line);
        return removed_line;
        
      }
      else{
        console.log("Err Undo: removed_line does not exist");
      }

  } else {
    console.log("Err Undo: removed line does not exist");
  }
}
}
function RedoLine(context: CanvasRenderingContext2D) {
  if (canvas) {
    //if (undoLog.length > 1) {
      const removed_line = undoLog.pop();
      if (removed_line){
        if(removed_line.length > 0){
          pointLog.push(removed_line);
          numLines++;
          canvas.dispatchEvent(drawEvent);
          console.log(removed_line);
          return removed_line;
        }
        else{
          console.log("Err Redo: removed_line is empty")
        }
      }
      else{
        console.log("Err Redo: removed_line does not exist")
      }
  } else {
    console.log("No Canvas Found");
  }
}