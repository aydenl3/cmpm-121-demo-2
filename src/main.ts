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
const canvas = document.getElementById("canvas") as HTMLElement | null;
if(canvas){
    // @ts-ignore: keep getting error "getContext does not exist on type HTML, when it works fine"
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    if(ctx){
        ctx.fillStyle = "cornsilk";
        ctx.fillRect(0, 0, 256, 256);
    }
}
else{
    console.log("No canvas element found");
}

