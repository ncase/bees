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

	self.turnAround = false;

	self.update = function(){
		// Rotation
		var dx = self.initX - Mouse.x;
		var dy = self.initY - Mouse.y;
		if(!self.dancing && !self.returning){
			var rotation = Math.atan2(dy,dx) - Math.TAU/4;
			self.rotation = rotation;
		}

		// Mouse
		if(self.dancing && !Mouse.pressed){
			self.distX = Math.abs(self.x - self.initX);
			self.distY = Math.abs(self.y - self.initY);
			self.returning = true;
			self.omega = .99;

			self.prevRotation = Math.atan2(self.y - self.initY, self.x - self.initX) - Math.TAU/4;
			self.prevRotation += (Math.random() >= 0.5 ? ((self.prevRotation <= -Math.TAU/4 && self.prevRotation >= -3*Math.TAU/4) ? Math.TAU : -Math.TAU) : 0);
			
			// IF I GET RID OF THIS, THE BEE ALWAYS LOOPS BACK IN A CIRCLE
			if (self.distX + self.distY <= 45){
				self.returnImmediately = true;
			}
		}
		self.dancing = !self.returning && Mouse.pressed;

		// DANCE?
		if(self.dancing && !self.returning){
			self.x += Math.sin(self.rotation)*self.danceSpeed;
			self.y -= Math.cos(self.rotation)*self.danceSpeed;
		}

		// RETURN
		if(self.returning) {
			var alpha = 0.95;

			// The bee changes direction towards its origin faster as it gets closer (makes more progress)
			if (self.omega > 0.7) {
				self.omega -= .005;
			}

			var dx = self.x - self.initX;
			var dy = self.y - self.initY;

			// Points to the bee's origin
			var rotation = Math.atan2(dy,dx) - Math.TAU/4;

			// FIXES OUT OF CONTROL OSCILLATION 
			while (Math.abs(self.prevRotation - rotation) > 1) {
				// console.log(rotation + " => " + (rotation + (rotation > self.prevRotation ? -Math.TAU : Math.TAU)));
				rotation += (rotation > self.prevRotation ? -Math.TAU : Math.TAU);
			}
			self.prevRotation = rotation;

			var d2 = dx*dx + dy*dy;
			// Kind of hacky, but this additional check avoids the bee "overshooting" its origin and forces it to return immediately
			if (self.returnImmediately){
				// Doesn't work as intended -- the goal was to gradually point towards the mouse when close to the origin
				self.rotation = self.rotation*alpha + (1-alpha)*(Math.atan2(self.initY - Mouse.y,self.initX - Mouse.x) - Math.TAU/4 - rotation);
				self.x = self.x*alpha + self.initX*(1-alpha);
				self.y = self.y*alpha + self.initY*(1-alpha);
			} else {
				// Have the bee turn back around according to omega and move a bit in that direction
				self.rotation = self.rotation*(self.omega) + (1 - self.omega)*(rotation);
				self.x += Math.sin(self.rotation)*self.danceSpeed;
				self.y -= Math.cos(self.rotation)*self.danceSpeed;
			}
			
			// IF I GET RID OF THIS, THE BEE ALWAYS LOOPS BACK IN A CIRCLE
			// If we're too close and nearly facing the origin
			if(Math.abs(rotation - self.rotation) <= 0.05 && d2 < 10){
				self.returnImmediately = true;
			}
			// If we're way too close (avoids unregulated oscillation lol)
			if(d2<5){
				self.x = self.initX;
				self.y = self.initY;
				self.turnAround = true;
				self.returnImmediately = false;
				self.returning = false;
				self.pressed = 0;
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
		} else if (self.returning) {
			self.waggle += 1;
			var r = Math.sin(self.waggle)*0.1;
			ctx.rotate(r);
		}
		
		/*ctx.fillStyle = "#FFD700";
		//ctx.beginPath();
		ctx.fillRect(-10, -20, 20, 40);*/
		ctx.drawImage(images.bee, -30, -30, 60, 60);
		
		ctx.restore();
	};

}