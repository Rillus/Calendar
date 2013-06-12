/*************/
/* variables */
/*************/

var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	
	calendarType = "year",
	segments = 12,
	summer = [255, 242, 0],
	spring = [0, 241, 0],
	autumn = [255, 170, 0],
	winter = [0, 207, 255],
	seasons = [winter, spring, summer, autumn],
	thisSeason = 0,
	nextSeason = 0,
	thisColourStep = 0,
	colourSteps = segments/seasons.length,
	deg = 360/segments,
	
	months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
	monthDays = ["31","28","31","30","31","30","31","31","30","31","30","31"],
	thisDay = 0,
	thisMonth = 0,
	
	data = [],
	labels = []
	colours = [];

/********************/
/* colour functions */
/********************/

//converts hex colour to a string we can manipulate
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(colour) {
	var r = colour[0],
		g = colour[1],
		b = colour[2];

	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function colourSum(colour1, colour2, steps, thisStep){
	//steps = typeof a !== 'undefined' ? steps : 1;
	//thisStep = typeof b !== 'undefined' ? thisStep : 1;
	
	var colourDiff=[],
		new2 =[];
	
	colourDiff.push((Math.max(colour1[0], colour2[0]) - Math.min(colour1[0], colour2[0]))/steps);
	colourDiff.push((Math.max(colour1[1], colour2[1]) - Math.min(colour1[1], colour2[1]))/steps);
	colourDiff.push((Math.max(colour1[2], colour2[2]) - Math.min(colour1[2], colour2[2]))/steps);
	
	if (colour1[0] < colour2[0]){
		new2.push(Math.round(colour1[0] + (colourDiff[0]*thisStep)));
	} else {
		new2.push(Math.round(colour1[0] - (colourDiff[0]*thisStep)));
	}
	
	if (colour1[1] < colour2[1]){
		new2.push(Math.round(colour1[1] + (colourDiff[1]*thisStep)));
	} else {
		new2.push(Math.round(colour1[1] - (colourDiff[1]*thisStep)));
	}
	
	if (colour1[2] < colour2[2]){
		new2.push(Math.round(colour1[2] + (colourDiff[2]*thisStep)));
	} else {
		new2.push(Math.round(colour1[2] - (colourDiff[2]*thisStep)));
	}
	
	//console.log('col1: '+colour1, ' col2: '+colour2, ' '+colourDiff, ' '+new2, steps, thisStep);
	return new2;
}

/*********************/
/* drawing functions */
/*********************/

function drawCircle(){
	context.save();
	var centerX = Math.floor(canvas.width / 2),
		centerY = Math.floor(canvas.height / 2),
		radius = Math.floor(canvas.width /3),
		startingAngle = degreesToRadians(sumTo(data, i))
		arcSize = degreesToRadians(data[i])
		endingAngle = startingAngle + arcSize;

	context.beginPath();
	context.moveTo(centerX, centerY);
	context.arc(centerX, centerY, radius, 0, 360, false);
	context.closePath();

	context.fillStyle = "#ffffff";
	context.fill();

	context.restore();
}
function drawSegment(canvas, context, i) {
    context.save();
    var centerX = Math.floor(canvas.width / 2);
    var centerY = Math.floor(canvas.height / 2);
    radius = Math.floor(canvas.width / 2);

    var startingAngle = -degreesToRadians(sumTo(data, i))+45,
		arcSize = degreesToRadians(data[i]),
		endingAngle = startingAngle + arcSize;

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
    context.closePath();

    context.fillStyle = colours[i];
    context.fill();

    context.restore();
}
function drawSegmentLabel(canvas, context, i) {
   context.save();
   var x = Math.floor(canvas.width / 2);
   var y = Math.floor(canvas.height / 2);
   var angle = -degreesToRadians(sumTo(data, i))+45;

   context.translate(x, y);
   context.rotate(angle);
   var dx = Math.floor(canvas.width * 0.5) - 10;
   var dy = Math.floor(canvas.height * 0.03);

   context.textAlign = "right";
   var fontSize = Math.floor(canvas.height / 45);
   context.font = fontSize + "pt Helvetica";

   context.fillText(labels[i], dx, dy);

   context.restore();
}

function writeSegmentName(segment){
	drawCircle();
	
	var x = Math.floor(canvas.width / 2),
		y = Math.floor(canvas.height / 2);
	
	//context.translate(x, y);	
	context.textAlign = "center";
	var fontSize = Math.floor(canvas.height / 45);
	context.font = fontSize + "pt Helvetica";
	
	context.fillText(segment, x, y);
	
}

function findSegmentByColour(clickedCol) {
	for(i = 0; i < colours.length; i++){
		//console.log(clickedCol, colours[0]);
		if (colours[i] == rgbToHex(clickedCol)){
			return labels[i];
		}
	}
}

/*****************************/
/* mathmatical manipulations */
/*****************************/

function degreesToRadians(degrees) {
    return (degrees * Math.PI)/180;
}
function sumTo(a, i) {
    var sum = 0;
    for (var j = 0; j < i; j++) {
      sum += a[j];
    }
    return sum;
}
function isOdd(num) { 
	return num % 2;
}

function assignLabels(){
	if (calendarType == "year"){
		labels.push(months[thisMonth]);
		thisMonth++;	
	} else if (calendarType == "month"){
		if (thisDay >= monthDays[thisMonth]){
			thisMonth++;
			thisDay = 1;
		} else {
			thisDay++
		}
		labels.push(thisDay+' '+months[thisMonth]);
	}
}

/********/
/* init */
/********/

function init(){
	for(i = 0; i < segments; i++){
		if (thisColourStep < colourSteps){
			thisColourStep++;
		} else {
			thisSeason++;
			thisColourStep = 1;
		}
		nextSeason = thisSeason +1;
		if (nextSeason > seasons.length-1){
			nextSeason = 0;
		}
		newColour = colourSum(seasons[thisSeason], seasons[nextSeason], colourSteps, thisColourStep);
		newColour = rgbToHex(newColour);
		
		data.push(deg);
		colours.push(newColour);
		
		drawSegment(canvas, context, i);
		
		assignLabels();
		drawSegmentLabel(canvas, context, i);
		//console.log ('colour: ', newColour, 'season: ', thisSeason, 'steps: ', colourSteps, 'this step: ', thisColourStep)
	}
	
	drawCircle();
	
	document.getElementById('canvas').onclick = function(event) {
		var clicked = context.getImageData(event.clientX, event.clientY, 1, 1).data,
			clickedCol = [clicked[0], clicked[1], clicked[2]];
			
		segment = findSegmentByColour(clickedCol);
	}
	
	document.getElementById('canvas').onmousemove = function(event) {
		var clicked = context.getImageData(event.clientX, event.clientY, 1, 1).data,
			clickedCol = [clicked[0], clicked[1], clicked[2]];
			
		
		segment = findSegmentByColour(clickedCol);
		if (segment != "undefined"){
			console.log(clickedCol, segment);
			writeSegmentName(segment);
		}
	}
	
}

init();