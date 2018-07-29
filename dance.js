Math.TAU = Math.PI*2;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var images = {};
images.bee = new Image();
images.bee.src = "images/bee.png";

images.background = new Image();
images.background.src = "images/honeycomb.png";

// Bee
function Bee(){
	
	var self = this;
	
	self.initX = 250;
	self.initY = 250;
	self.x = self.initX;
	self.y = self.initY;
	self.rotation = 0;

	self.dancing = false;
	self.returning = false;
	self.danceSpeed = 2;

	self.update = function(){

		// Rotation
		var dx = self.initX - Mouse.x;
		var dy = self.initY - Mouse.y;
		if(!self.dancing){
			var rotation = Math.atan2(dy,dx) - Math.TAU/4;
			self.rotation = rotation;
		}

		// Mouse
		if(self.dancing && !Mouse.pressed){
			self.returning = true;
		}
		self.dancing = Mouse.pressed;

		// DANCE?
		if(self.dancing && !self.returning){
			self.x += Math.sin(self.rotation)*self.danceSpeed;
			self.y -= Math.cos(self.rotation)*self.danceSpeed;
		}

		// RETURN
		if(self.returning){
			self.x = self.x*0.8 + self.initX*0.2;
			self.y = self.y*0.8 + self.initY*0.2;
			var dx = self.initX - self.x;
			var dy = self.initY - self.y;
			var d2 = dx*dx + dy*dy;
			if(d2<5){
				self.x = self.initX;
				self.y = self.initY;
				self.returning = false;
			}
		}

	};
	
	self.waggle = 0;
	self.draw = function(ctx){

		ctx.save();

		ctx.translate(self.x, self.y);
		ctx.rotate(self.rotation);

		// WAGGLE
		if(self.dancing){
			self.waggle += 1;
			var r = Math.sin(self.waggle)*0.3;
			ctx.rotate(r);
		}
		
		/*ctx.fillStyle = "#FFD700";
		//ctx.beginPath();
		ctx.fillRect(-10, -20, 20, 40);*/
		ctx.drawImage(images.bee, -30, -30, 60, 60);
		
		ctx.restore();
	};

}
var bee = new Bee();

// Game Loop
function update(){

	// Update bee
	bee.update();

	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.save();
  // draw bg
  ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
	ctx.scale(2,2);
	// Draw bee
	bee.draw(ctx);
	ctx.restore();
  

	window.requestAnimationFrame(update);

}
update();

// Mouse
window.onload = function(){
	Mouse.init(canvas);
};

