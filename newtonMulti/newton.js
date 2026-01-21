const view = document.getElementById("view");
const ctx = view.getContext("2d");
const MAXITER = 500;

const acceptButton = document.getElementById("accept");
const shadeButton = document.getElementById("shade");
const goTo = document.getElementById("goTo");

var WID = view.width;
var HWID = WID/2.0;

var leftCanvas = view.getBoundingClientRect().left;
var topCanvas = view.getBoundingClientRect().top;

const PI = Math.PI;
const TAU = PI * 2;

var gradWid = 0.07;
var offset = PI;

var imgData = ctx.getImageData(0,0,view.width,view.height);

var frame = 2;
var focus = [0,0];
var mouse = [0,0];

// set alpha to 255;
for(var x = 0; x < WID; ++x) {
    for(var y = 0; y < WID; ++y) {
        imgData.data[y*WID*4 + x*4 + 3] = 255;
    }
}

function cMultReal(arr1, arr2) {
    return arr1[0]*arr2[0] - arr1[1]*arr2[1];
}
function cMultImag(arr1, arr2) {
    return arr1[0]*arr2[1] + arr1[1]*arr2[0];
}

function cPow(arr, pow) {
    var tmp;
    var out = [arr[0],arr[1]];
    for(--pow; pow > 0; --pow) {
        tmp = out[0];
        out[0] = tmp*arr[0] - out[1]*arr[1];
        out[1] = tmp*arr[1] + out[1]*arr[0];
    }
    return out;
}

function getAngle(x, y) {
    var tmp = y < 0 ? -1 : 1;
    return (Math.acos(x / Math.sqrt(x*x + y*y)) * tmp)
}

var coeff = [1,0,0,0,-1];
var len = coeff.length - 1;
var colorScheme = 2;

function draw() {
    var t1 = Date.now();
    var xx, yy, tmp;
    var px, py;
    var vec = new Array(2);
    var f = new Array(2);
    var d = new Array(2);
    var ix, iy, r, g, b;
    var dist = frame / WID;
    dist *= dist;
    var index = 0;
    for(var y = 0; y < WID; ++y) {
        for(var x = 0; x < WID; ++x) {
            ix = xx = (x - HWID) / HWID * frame + focus[0];
            iy = yy = (y - HWID) / HWID * frame + focus[1];
            px = py = 1;
            for(var i = 0; i < MAXITER && px*px + py*py > dist; ++i) {
                px = xx;
                py = yy;
                d[0] = d[1] = 0;
                for(var j = 0; j < len - 1; ++j) {
                    if(coeff[j] == 0)
                        continue;
                    tmp = len - j;
                    vec = cPow([xx,yy], tmp - 1);
                    d[0] += coeff[j] * vec[0] * tmp;
                    d[1] += coeff[j] * vec[1] * tmp;
                }
                d[0] += coeff[len - 1];

                if(d[0] == 0 && d[1] == 0)
                    break;

                f[0] = f[1] = 0;
                for(var j = 0; j < len; ++j) {
                    if(coeff[j] == 0)
                        continue;
                    vec = cPow([xx,yy], len - j);
                    f[0] += coeff[j] * vec[0];
                    f[1] += coeff[j] * vec[1];
                }
                f[0] += coeff[len];


                tmp = d[0]*d[0] + d[1]*d[1];
                xx = xx - (d[0]*f[0] + d[1]*f[1]) / tmp;
                yy = yy - (f[1]*d[0] - f[0]*d[1]) / tmp;
                if((xx-ix)**2 + (yy-iy)**2 <= dist)
                    break;
                px = xx - px;
                py = yy - py;
            }
            if(i == MAXITER) {
                    imgData.data[index] = imgData.data[index+1] = imgData.data[index+2] = 255;
                    index+=4;
                    continue;
            }
            switch(colorScheme) {
                case 1:
                    tmp = getAngle(xx, yy) + 1 / ((xx - ix)**2 + (yy - iy)**2 + 1);
                    imgData.data[index++] = (Math.cos(tmp) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 1.5) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 2.5) * 127 + 127);
                    break;
                case 2:
                    tmp = TAU - TAU/(i*i*0.0006 + 1) + 2;
                    imgData.data[index++] = (Math.cos(tmp) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 1.5) * 127 + 127);
                    imgData.data[index++] = (Math.cos(tmp + 2) * 127 + 127);
                    break;
                case 3:
                    tmp = 1.0 - 1/(i*i*0.001 + 1);
                    imgData.data[index++] = 255*tmp;
                    imgData.data[index++] = 250*tmp;
                    imgData.data[index++] = 200*tmp;
                    break;
                default:
                    tmp = 1/(i*i*0.001 + 1);
                    imgData.data[index++] = 255*tmp;
                    imgData.data[index++] = 250*tmp;
                    imgData.data[index++] = 200*tmp;
                    break;
            }
            index++;
        }
    }
    t1 = Date.now() - t1;
    console.log("Render time: " + t1/1000 + "s");
}

function updateView() {
    draw();
    ctx.putImageData(imgData,0,0);

}
updateView();

document.addEventListener("mousemove", function(event) {
    mouse[1] = event.pageY;
    mouse[0] = event.pageX;
});
view.addEventListener("click", function() {
    focus[0] = (mouse[0] - leftCanvas - HWID) / HWID * frame + focus[0];
    focus[1] = (mouse[1] - topCanvas - HWID) / HWID * frame + focus[1];
    frame *= 0.5;
    updateView();
})
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
                frame = 2;
                focus[0] = focus[1] = 0;
                updateView();
        }
    }
});

document.getElementById("accept").addEventListener("click", function() {
    WID = view.width = view.height = Number(document.getElementById("wid").value);
    HWID = WID/2;
    imgData = ctx.getImageData(0,0,view.width,view.height);
    for(var x = 0; x < WID; ++x) {
        for(var y = 0; y < WID; ++y) {
            imgData.data[y*WID*4 + x*4 + 3] = 255;
        }
    }
    var temp = document.getElementById("coeff").value.split(',');
    len = temp.length;
    coeff = new Array(len);
    for(var i = 0; i < len; ++i)
        coeff[i] = Number(temp[i]);
    --len;
    colorScheme = Number(document.getElementById("color").value);
    updateView();

});