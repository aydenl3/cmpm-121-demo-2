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
const canvas = document.getElementById("canvas") as HTMLElement | null;
if(!canvas){
    console.log("No canvas element found");
}
else{
// @ts-ignore: keep getting error "getContext does not exist on type HTML, when it works fine"
const pen = canvas.getContext("2d");
clearCanvas(pen);
//Drawing Logic
    //Variables
let isDrawing: boolean = false;
let x = 0;
let y = 0;
    //Mouse Down
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
  });
    //Move Mouse
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      drawLine(pen, x, y, e.offsetX, e.offsetY);
      x = e.offsetX;
      y = e.offsetY;
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
Clear_Button.addEventListener("click", () => clearCanvas(pen));
}
    //Draw line
function drawLine(context:CanvasRenderingContext2D, x1:number, y1:number, x2:number, y2:number) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }
function clearCanvas(context:CanvasRenderingContext2D){
    context.clearRect(0,0,Canvas_SizeX,Canvas_SizeY);
    context.fillStyle = "cornsilk";
    context.fillRect(0, 0, Canvas_SizeX, Canvas_SizeY);
}
