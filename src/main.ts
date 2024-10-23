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
const pointLog: Line[] = [];


const undoLog: Line[] = [];
const drawEvent = new CustomEvent("canvasDrawn", {});
//Variables
let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;
let numLines: number = 0;



interface canvasElement{
  display(context:CanvasRenderingContext2D):void;
}

class Line implements canvasElement{
  private points: Point[] = [];

  constructor(initialX: number, initialY: number) {
    this.points.push({ x: initialX, y: initialY });
  }

  addPoint(x_in: number, y_in: number) {
    this.points.push({ x:x_in, y:y_in });
  }

  display(context: CanvasRenderingContext2D): void {
    console.log(context);
    if (this.points.length > 0) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const thispoint = this.points[i];
        const nextpoint = this.points[i + 1];
        drawLine(context, thispoint.x, thispoint.y, nextpoint.x, nextpoint.y);
      }
    } else {
      //console.log("inner list length 0");
    }
  }

  removePoint():Point{
    const point = this.points.pop();
    if(point){
      return point;
    }
    else{
      console.log("ERR REMOVE POINT: NO POINT FOUND");
      const throwaway: Point = {x:9999, y:9999};
      return throwaway;
    }
  }

  is_empty():boolean{
    if(this.points.length == 0){
      return true;
    }
    else{
      return(false);
    }
  }
}

interface Command{
  execute():void;
}
class DisplayLineCommand implements Command{
   private line: Line;
   private context: CanvasRenderingContext2D;
  constructor(line: Line, context: CanvasRenderingContext2D) {
    this.line = line;
    this.context = context;    
  }
  execute(): void {
    this.line.display(this.context);
  }
}

//----------------------------------------------------------------------

addLine(pointLog,-1,-1);

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
    addLine(pointLog,x,y);
    numLines++;
  });
  //Move Mouse
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      x = e.offsetX;
      y = e.offsetY;
      if (!pointLog.length) {
        addLine(pointLog,x,y);
      }
      pointLog[numLines].addPoint(x,y);
      canvas.dispatchEvent(drawEvent);
    }
  });
  //Draw Event Listener
  canvas.addEventListener("canvasDrawn", () => {
    clearCanvas(pen);
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        const drawCommand = new DisplayLineCommand(line,pen);
        drawCommand.execute();
      }
    }
  });
  //Mouse Up
  document.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      //drawLine(pen, x, y, e.offsetX, e.offsetY);
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
  //maybe negative here
  addLine(pointLog,x,y);
  
 //Maybe clear the undo list too?
  numLines = 0;
  x = 0;
  y = 0;
}
function undoLine(context: CanvasRenderingContext2D) {
  if (canvas) {
    if (pointLog.length > 0) {
      const removed_line = pointLog.pop();
      if(removed_line){
        if(removed_line.is_empty()){
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
        if(!removed_line.is_empty()){
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
}
}
function addLine(log:Line[],x:number,y:number){
  const line1 = new Line(x,y);
  log.push(line1);
}
