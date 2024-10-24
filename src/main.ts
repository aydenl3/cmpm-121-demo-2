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

interface canvasElement {
  display(context: CanvasRenderingContext2D): void;
}

class Line implements canvasElement {
  private points: Point[] = [];
  private thickness: number = 1;
  constructor(initialX: number, initialY: number) {
    this.points.push({ x: initialX, y: initialY });
  }

  addPoint(x_in: number, y_in: number) {
    this.points.push({ x: x_in, y: y_in });
  }

  display(context: CanvasRenderingContext2D): void {
    if (this.points.length > 0) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const thispoint = this.points[i];
        const nextpoint = this.points[i + 1];
        drawLine(context, thispoint.x, thispoint.y, nextpoint.x, nextpoint.y,this.thickness);
      }
    }
  }

  removePoint(): Point {
    const point = this.points.pop();
    if (point) {
      return point;
    } else {
      console.log("ERR REMOVE POINT: NO POINT FOUND");
      const throwaway: Point = { x: 9999, y: 9999 };
      return throwaway;
    }
  }

  is_empty(): boolean {
    if (this.points.length == 0) {
      return true;
    } else {
      return false;
    }
  }
  
  changeThickness(thickness:number): void {
    this.thickness = thickness;
  }
}

class Reticle implements canvasElement{
  private thickness: number = 1;
  private mouseX: number = 0;
  private mouseY: number = 0;
  constructor(){

  }
  display(context: CanvasRenderingContext2D): void {
       context.beginPath();
       context.arc(this.mouseX,this.mouseY,this.thickness,0,Math.PI * 2);
       context.strokeStyle = "rgba(0, 0, 0, 0.5)";
       context.stroke();
  }

  changeThickness(thickness:number): void {
    this.thickness = thickness;
  }
  centerOn(x:number,y:number){
    this.mouseX = x;
    this.mouseY = y;
  }
}


interface Command {
  execute(): void;
}
class DisplayLineCommand implements Command {
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

class ChangeLineThicknessCommand implements Command {
    private line: Line;
    private thickness: number;
    constructor(line: Line,thickness:number){
      this.line = line;
      this.thickness = thickness;
    }
    execute(): void {
      this.line.changeThickness(this.thickness);
    }
}

class DisplayReticleCommand implements Command {
  private reticle: Reticle;
  private context: CanvasRenderingContext2D;
  constructor(reticle: Reticle, context: CanvasRenderingContext2D) {
    this.reticle = reticle;
    this.context = context;
  }
  execute(): void {
    this.reticle.display(this.context);
  }
}

class CenterReticleCommand implements Command {
  private reticle: Reticle;
  private X: number;
  private Y: number;
  constructor(reticle: Reticle,X:number,Y:number){
    this.reticle = reticle;
    this.X = X;
    this.Y = Y;
  }
  execute(): void {
    this.reticle.centerOn(this.X,this.Y);
  }
}
class ChangeReticleThicknessCommand implements Command {
  private reticle: Reticle;
  private thickness: number;
  constructor(reticle: Reticle,thickness:number){
    this.reticle = reticle;
    this.thickness = thickness;
  }
  execute(): void {
    this.reticle.changeThickness(this.thickness);
  }
}

//Variables
let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;
let numLines: number = 0;
let current_thickness: number = 1;
const pointLog: Line[] = [];
const undoLog: Line[] = [];
const drawEvent = new CustomEvent("canvasDrawn", {});
const tool_movedEvent = new CustomEvent("toolMoved", {});
let appReticle:Reticle = new Reticle();
//----------------------------------------------------------------------

addLine(pointLog, -1, -1,current_thickness);

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
    console.log(isDrawing);
    addLine(pointLog, x, y,current_thickness);
    numLines++;
  });
  //Move Mouse
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      x = e.offsetX;
      y = e.offsetY;
      if (!pointLog.length) {
        addLine(pointLog, x, y,current_thickness);
      }
      pointLog[numLines].addPoint(x, y);
      canvas.dispatchEvent(drawEvent);
    }
    else{
      console.log(isDrawing);
      x = e.offsetX;
      y = e.offsetY;
      canvas.dispatchEvent(tool_movedEvent);

    }
  });
  //Draw Event Listener
  canvas.addEventListener("canvasDrawn", () => {
    clearCanvas(pen);
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        const drawCommand = new DisplayLineCommand(line, pen);
        drawCommand.execute();
      }
    }
  });
  canvas.addEventListener("toolMoved", () => {
    clearCanvas(pen);
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        const drawCommand = new DisplayLineCommand(line, pen);
        drawCommand.execute();
      }
    }
    const thicknesstoolCommand = new ChangeReticleThicknessCommand(appReticle,current_thickness);
    thicknesstoolCommand.execute();
    const centertoolCommand = new CenterReticleCommand(appReticle,x,y);
    centertoolCommand.execute();
    const displaytoolCommand = new DisplayReticleCommand(appReticle,pen);
    displaytoolCommand.execute();
  });

  //Mouse Up
  document.addEventListener("mouseup", (e) => {
    if (isDrawing) {
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

  //Create Thick Button
  const Thick_Button = document.createElement("button");
  Thick_Button.textContent = "Thik";
  app.append(Thick_Button);
  Thick_Button.addEventListener("click", () => ChangeThickness(pen,3));
  
  //Create Thin Button
  const Thin_Button = document.createElement("button");
  Thin_Button.textContent = "Thyn";
  app.append(Thin_Button);
  Thin_Button.addEventListener("click", () => ChangeThickness(pen,1));
    
}

//Draw line
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = width;
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
  undoLog.length = 0;
  addLine(pointLog, x, y, current_thickness);
  numLines = 0;
  x = 0;
  y = 0;
}
function undoLine(context: CanvasRenderingContext2D) {
  if (canvas) {
    if (pointLog.length > 0) {
      const removed_line = pointLog.pop();
      if (removed_line) {
        if (removed_line.is_empty()) {
          undoLine(context);
        }
        undoLog.push(removed_line);
        numLines--;
        canvas.dispatchEvent(drawEvent);
        return removed_line;
      } else {
        console.log("Err Undo: removed_line does not exist");
      }
    } else {
      console.log("Err Undo: removed line does not exist");
    }
  }
}
function RedoLine(context: CanvasRenderingContext2D) {
  if (canvas) {
    const removed_line = undoLog.pop();
    if (removed_line) {
      if (!removed_line.is_empty()) {
        pointLog.push(removed_line);
        numLines++;
        canvas.dispatchEvent(drawEvent);
        return removed_line;
      } else {
        console.log("Err Redo: removed_line is empty");
      }
    } else {
      console.log("Err Redo: removed_line does not exist");
    }
  }
}
function addLine(log: Line[], x: number, y: number, thickness: number) {
  const line1 = new Line(x, y);
  const thicknessCommand = new ChangeLineThicknessCommand(line1,thickness);
  thicknessCommand.execute();
  log.push(line1);
}
function ChangeThickness(context: CanvasRenderingContext2D,thickness:number) {
  current_thickness = thickness;
}
