const view = document.getElementById("view");
const ctx = view.getContext("2d");

const acceptButton = document.getElementById("accept");
const shadeButton = document.getElementById("shade");
const goTo = document.getElementById("goTo");

var WID = view.width;
var HEI = view.height;
var HWID = WID/2.0;

var leftCanvas = view.getBoundingClientRect().left;
var topCanvas = view.getBoundingClientRect().top;

const PI = Math.PI;
const TAU = PI * 2;

var gradWid = 0.07;
var offset = PI;

var imgData = ctx.getImageData(0,0,view.width,view.height);

var frame = 0.7;
var focus = [0,0];
var mouse = [0,0];

var maxIterations = 60;
var colorScheme = 4;

// set alpha to 255;
for(var x = 0; x < WID; ++x) {
    for(var y = 0; y < WID; ++y) {
        imgData.data[y*WID*4 + x*4 + 3] = 255;
    }
}
var A = [Math.sqrt(3)/6,0.5];
var B = [Math.sqrt(3)/6,-0.5];
var C = [-Math.sqrt(3) / 2.0 + Math.sqrt(3)/6,0];

var L = [A,B,C];
var color = [[200,50,50],[50,200,50],[50,50,200]];
var zeroCursor = -1;
var drag = false;

function getAngle(x, y) {
    var tmp = y < 0 ? -1 : 1;
    return (Math.acos(x / Math.sqrt(x*x + y*y)) * tmp)
}

function draw() {
    var xx, yy, tmp;
    var px, py;
    var ax, bx, cx, ay, by, cy;
    var fx, fy, dx, dy;
    var tx, ty, r, g, b;
    var dist = frame/WID;
    var index = 0;
    dist *= dist;
    for(var y = 0; y < HEI; ++y) {
        for(var x = 0; x < WID; ++x) {
            tx = xx = (x - HWID) / HWID * frame + focus[0];
            ty = yy = (y - HWID) / HWID * frame + focus[1];
            px = py = 1;
            for(var i = 0; i < maxIterations && (px*px + py*py) >= dist; ++i) {
                px = xx;
                py = yy;
                ax = xx - A[0];
                ay = yy - A[1];
                bx = xx - B[0];
                by = yy - B[1];
                cx = xx - C[0];
                cy = yy - C[1];

                /* f = (Z - A)(Z - B)(Z - C) */
                fx = (ax*bx*cx - ay*by*cx - (ax*by*cy + ay*bx*cy));
                fy = (ax*bx*cy - ay*by*cy + ax*by*cx + ay*bx*cx);

                /* temp a = (AB + BC + AC) */
                ax = (A[0]*B[0] - A[1]*B[1]) + (C[0]*B[0] - C[1]*B[1]) + (A[0]*C[0] - A[1]*C[1]);
                ay = (B[0]*A[1] + A[0]*B[1]) + (B[0]*C[1] + C[0]*B[1]) + (C[0]*A[1] + A[0]*C[1]);

                /* temp b = A + B + C */
                bx = A[0] + B[0] + C[0];
                by = A[1] + B[1] + C[1];

                /* dx = 3z^2 - 2z(A + B + C) + (AB + BC + AC) 
                    = 3z^2 + 2z(bx + byi) + (ax + ayi) */
                dx = 3*(xx*xx - yy*yy) - 2*(xx*bx - yy*by) + ax;
                dy = 3*(2*xx*yy) - 2*(bx*yy + xx*by) + ay;
                if(dx == 0 && dy == 0)
                    break;

                tmp = dx*dx + dy*dy;
                xx = xx - (dx*fx + dy*fy) / tmp;
                yy = yy - (fy*dx - fx*dy) / tmp;
                if(px == xx && py == yy)
                    break;
                px = xx - px;
                py = yy - py;
            }
            switch(colorScheme) {
                case 1:
                    tmp = getAngle(xx, yy) + 1 / ((xx - tx)**2 + (yy - ty)**2 + 1);
                    imgData.data[index++] = (Math.cos(tmp) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 1.5) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 2.5) * 127 + 127);
                    break;
                case 2:
                    tmp = TAU - TAU/(i*i*0.001 + 1) + 2;
                    imgData.data[index++] = (Math.cos(tmp) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 1.5) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 2) * 127 + 127);
                    break;
                case 3:
                    tmp = 1.0 - 1/(i*i*0.002 + 1);
                    imgData.data[index++] = 255*tmp;
                    imgData.data[index++] = 250*tmp;
                    imgData.data[index++] = 150*tmp;
                    break;
                case 4:
                    tmp = -1
                    for(var i = 0; i < 3; ++i) {
                        fx = (xx - L[i][0]);
                        fy = (yy - L[i][1]);
                        fx = Math.sqrt(fx*fx + fy*fy)
                        if(fx < tmp || tmp < 0) {
                            tmp = fx;
                            r = color[i][0];
                            g = color[i][1];
                            b = color[i][2];
                        }
                    }
                    fx = xx - tx;
                    fy = yy - ty;
                    tmp = 0.75;//1 / ((fx*fx + fy*fy)*5 + 1) + 0.5;
                    imgData.data[index++] = r * tmp;
                    imgData.data[index++] = g * tmp;
                    imgData.data[index++] = b * tmp;
                    break;
                default:
                    tmp = 1/(i*i*0.002 + 1);
                    imgData.data[index++] = 255*tmp;
                    imgData.data[index++] = 250*tmp;
                    imgData.data[index++] = 200*tmp;
                    break;
            }

            ++index;
        }
    }
}
function updateView() {
    draw();
    ctx.putImageData(imgData,0,0);
    var x, y;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    for(var i = 0; i < 3; ++i) {
        x = (L[i][0] - focus[0]) / frame * HWID + HWID;
        y = (L[i][1] - focus[1]) / frame * HWID + HWID;
        ctx.beginPath();
        ctx.moveTo(x, y)
        ctx.fillStyle = `rgb(${color[i][0]},${color[i][1]},${color[i][2]})`;
        ctx.arc(x, y, 5, 0, TAU, true);
        if(i + 1 == Math.abs(zeroCursor))
            ctx.stroke();
        ctx.fill();
    }
}
updateView();


document.addEventListener("keydown", function(event) {
    if(mouse[0] > leftCanvas && mouse[0] < leftCanvas + WID && mouse[1] > topCanvas && mouse[1] < topCanvas + WID) {
        switch(event.key) {
            case 'ArrowUp': case 'w':
                focus[1] -= frame*0.25;
                updateView();
                break;
            case 'ArrowDown': case 's':
                focus[1] += frame*0.25;
                updateView();
                break;
            case 'ArrowLeft': case 'a':
                focus[0] -= frame*0.25;
                updateView();
                break;
            case 'ArrowRight': case 'd':
                focus[0] += frame*0.25;
                updateView();
                break;
            case '=': case '+':
                frame -= frame/5.0;
                    updateView();
                break;
            case '-': case '_':
                frame += frame/4.0;
                updateView();
                break;
            case ' ':
                zeroCursor = Math.sign(zeroCursor) * ((Math.abs(zeroCursor) + 1)%3 + 1);
                updateView();
                break;
            case 'Enter':
                frame = 0.7;
                focus[0] = focus[1] = 0;
                updateView();
        }
    }
});

view.addEventListener("click", function(event) {
    clickX = ((event.pageX - leftCanvas) / HWID) - 1.0;
    clickY = ((event.pageY - topCanvas) / HWID) - 1.0;
    L[Math.abs(zeroCursor) - 1][0] = frame * clickX + focus[0];
    L[Math.abs(zeroCursor) - 1][1] = frame * clickY + focus[1];
    if(drag)
        zeroCursor = -zeroCursor;
    updateView();
});

document.addEventListener("mousemove", function(event) {
    mouse[0] = event.pageX;
    mouse[1] = event.pageY;
});
view.addEventListener("mousemove", function(event) {
    if(drag && zeroCursor > 0) {
        clickX = ((event.pageX - leftCanvas) / HWID) - 1.0;
        clickY = ((event.pageY - topCanvas) / HWID) - 1.0;
        L[Math.abs(zeroCursor) - 1][0] = frame * clickX + focus[0];
        L[Math.abs(zeroCursor) - 1][1] = frame * clickY + focus[1];
        updateView();
    }
});

document.getElementById("accept").addEventListener("click", function() {
    maxIterations = document.getElementById("iter").value;
    if(maxIterations < 0)
        maxIterations = 0;
    document.getElementById("iter").value = maxIterations;
    drag = document.getElementById("drag").checked;
    colorScheme = Number(document.getElementById("color").value);
    zeroCursor = zeroCursor > 0 ? -zeroCursor : zeroCursor;
    updateView();

});