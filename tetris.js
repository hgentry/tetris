var canvas = document.getElementById("tetrisBox");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#dddddd";

var scale = 32;
var holdWidth = 4;
var holdHeight = 2;

var piece = null;
var grid = null;
var game = null;
var graphics = null;
var queue = new Array();
var runningQueue = false;
var left = null;
var right = null;
var down = null;
var canRotate = true;
var canHold = true;
var canDrop = true;
var holdResolving = false;
var holdType = 0;
var timeout = null;
var timeoutLeft = 0;
var lines = 0;

var pieces = [1,2,3,4,5,6,7];
var future = new Array();

function Piece() {	
	clearInterval(timeout);
	timeout = null;
	timeoutLeft = 0;
	this.move = function(newpos) {
		a = newpos[0];
		b = newpos[1];
		c = newpos[2];
		d = newpos[3];
		e = newpos[4];
		f = newpos[5];
		g = newpos[6];
		h = newpos[7];
		
		moved = true;
		oldPos = this.pos.slice();
		this.oldPos = this.pos.slice();
		this.pos = [-1,-1,-1,-1,-1,-1,-1,-1];
		
		grid.apply(this);
		canFall = true;
		if(!(oldPos[0] + a >= 0 && oldPos[0] + a < 10 &&
			oldPos[2] + c >= 0 && oldPos[2] + c < 10 &&
			oldPos[4] + e >= 0 && oldPos[4] + e < 10 &&
			oldPos[6] + g >= 0 && oldPos[6] + g < 10)) {
			canFall = false;
		}
		if(!(oldPos[1] + b < 22 &&
			oldPos[3] + d < 22 &&
			oldPos[5] + f < 22 &&
			oldPos[7] + h < 22)) {
			canFall = false;
		}
		if(canFall) {
			if(grid.grid[oldPos[0]+a][oldPos[1]+b] != 0 || 
				grid.grid[oldPos[2]+c][oldPos[3]+d] != 0 || 
				grid.grid[oldPos[4]+e][oldPos[5]+f] != 0 || 
				grid.grid[oldPos[6]+g][oldPos[7]+h] != 0) {
				canFall = false;
			}
		}
		if(canFall) {
			this.pos = oldPos.slice();
			this.oldPos = oldPos.slice();
			this.pos[0]+=a;
			this.pos[2]+=c;
			this.pos[4]+=e;
			this.pos[6]+=g;
			this.pos[1]+=b;
			this.pos[3]+=d;
			this.pos[5]+=f;
			this.pos[7]+=h;
		} else {
			this.pos = oldPos.slice();
			this.oldPos = oldPos.slice();
			moved = false;
		}
		grid.apply(this);
		return moved;
	}
	
	this.left = function() {
		x = this.move([-1,0,-1,0,-1,0,-1,0]);
		this.findGhost();
	};
	
	this.right = function() {
		x = this.move([1,0,1,0,1,0,1,0]);
		this.findGhost();
	};
		
	this.findGhost = function() {
		oldPos = this.pos.slice();
		this.oldPos = this.pos.slice();
		this.pos = [-1,-1,-1,-1,-1,-1,-1,-1];
		grid.apply(this);
		min = 90;
		
		for(k = 0; k < 4; k++) {
			w = oldPos[2*k];
			h = oldPos[2*k+1];
			dist = 0;
			for(j = h+1; j < 22; j++) {
				if(grid.grid[w][j] == 0) {
					dist = j - h;
				} else {
					break;
				}
			}
			if(dist < min) {
				min = dist;
			}
		}
		
		this.pos = oldPos.slice();
		this.ghostPos = [
			this.pos[0],
			this.pos[1] + min,
			this.pos[2],
			this.pos[3] + min,
			this.pos[4],
			this.pos[5] + min,
			this.pos[6],
			this.pos[7] + min
		];
		grid.apply(this);
	}
	
	this.initKicks = function() {
		this.kickR = [this.rot0.slice(),
		this.rot1.slice(),
		this.rot2.slice(),
		this.rot3.slice()];
		
		this.kick2R = [this.rot0.slice(),
		this.rot1.slice(),
		this.rot2.slice(),
		this.rot3.slice()];
		
		this.kickL = [this.rot0.slice(),
		this.rot1.slice(),
		this.rot2.slice(),
		this.rot3.slice()];
		
		this.kick2L = [this.rot0.slice(),
		this.rot1.slice(),
		this.rot2.slice(),
		this.rot3.slice()];
		if(this.gridType != 7) {
			for(i = 0; i < 4; i++) {
				for(j = 0; j < 8; j+=2) {
					this.kickR[i][j] += 1;
					this.kickL[i][j] -= 1;
					this.kick2R[i][j] += 2;
					this.kick2L[i][j] -= 2;
				}
			}
		}
	}
	
	this.rotate = function() {
		this.oldPos = this.pos;
		if(this.rotation == 0) {
			if(this.move(this.rot0) || this.move(this.kickR[0]) || this.move(this.kickL[0])) {
				this.rotation = 1;
				timeoutLeft = 250;
			}
		}
		else if(this.rotation == 1) {
			if(this.move(this.rot1) || this.move(this.kickR[1]) || this.move(this.kickL[1])) {
				this.rotation = 2;
				timeoutLeft = 250;
			}
		}
		else if(this.rotation == 2) {
			if(this.move(this.rot2) || this.move(this.kickR[2]) || this.move(this.kickL[2])) {
				this.rotation = 3;
				timeoutLeft = 250;
			}
		}
		else if(this.rotation == 3) {
			if(this.move(this.rot3) || this.move(this.kickR[3]) || this.move(this.kickL[3])) {
				this.rotation = 0;
				timeoutLeft = 250;
			}
		}
		this.findGhost();
	};
	
	this.hardDrop = function() {
		while(grid.gravity());
		timeoutLeft = 0;
	}
	
}

function T() {
	Piece.call(this);
	this.rot0 = [1,-1,0,0,-1,1,-1,-1];
	this.rot1 = [1,1,0,0,-1,-1,1,-1];
	this.rot2 = [-1,1,0,0,1,-1,1,1];
	this.rot3 = [-1,-1,0,0,1,1,-1,1];
	this.initKicks();
	this.pos = [3,1,4,1,5,1,4,2];
	grid.checkForEnd(this);
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	this.gridType = 1;
	
	grid.apply(this);
	this.findGhost();
}

function O() {
	Piece.call(this);
	this.rot0 = [0,0,0,0,0,0,0,0];
	this.rot1 = [0,0,0,0,0,0,0,0];
	this.rot2 = [0,0,0,0,0,0,0,0];
	this.rot3 = [0,0,0,0,0,0,0,0];
	this.initKicks();
	this.pos = [4,1,4,2,5,1,5,2];
	grid.checkForEnd(this);
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	this.gridType = 2;
	
	grid.apply(this);
	this.findGhost();
}

function S() {
	Piece.call(this);
	this.rot0 = [1,-1,0,0,1,1,0,2];
	this.rot1 = [1,1,0,0,-1,1,-2,0];
	this.rot2 = [-1,1,0,0,-1,-1,0,-2];
	this.rot3 = [-1,-1,0,0,1,-1,2,0];
	this.initKicks();
	this.pos = [4,2,5,2,5,1,6,1];
	grid.checkForEnd(this);
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	this.gridType = 3;
	
	grid.apply(this);
	this.findGhost();
}

function Z() {
	Piece.call(this);
	this.rot0 = [2,0,1,1,0,0,-1,1];
	this.rot1 = [0,2,-1,1,0,0,-1,-1];
	this.rot2 = [-2,0,-1,-1,0,0,1,-1];
	this.rot3 = [0,-2,1,-1,0,0,1,1];
	this.initKicks();
	this.pos = [4,1,5,1,5,2,6,2];
	grid.checkForEnd(this);
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	this.gridType = 4;
	
	grid.apply(this);
	this.findGhost();
}

function L() {
	Piece.call(this);
	this.rot0 = [1,-1,0,0,-1,1,0,2];
	this.rot1 = [1,1,0,0,-1,-1,-2,0];
	this.rot2 = [-1,1,0,0,1,-1,0,-2];
	this.rot3 = [-1,-1,0,0,1,1,2,0];
	this.initKicks();
	this.pos = [4,2,5,2,6,2,6,1];
	grid.checkForEnd(this);
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	this.gridType = 5;
	grid.apply(this);
	this.findGhost();
}

function J() {
	Piece.call(this);
	this.rot0 = [2,0,1,-1,0,0,-1,1];
	this.rot1 = [0,2,1,1,0,0,-1,-1];
	this.rot2 = [-2,0,-1,1,0,0,1,-1];
	this.rot3 = [0,-2,-1,-1,0,0,1,1];
	this.initKicks();
	this.pos = [4,1,4,2,5,2,6,2];
	grid.checkForEnd(this);
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	this.gridType = 6;
	
	grid.apply(this);
	this.findGhost();
}

function I() {
	Piece.call(this);
	this.rot0 = [2,-1,1,0,0,1,-1,2];
	this.rot1 = [1,2,0,1,-1,0,-2,-1];
	this.rot2 = [-2,1,-1,0,0,-1,1,-2];
	this.rot3 = [-1,-2,0,-1,1,0,2,1];
	this.gridType = 7;
	this.initKicks();
	this.pos = [4,1,5,1,6,1,7,1];
	this.oldPos = this.pos.slice();
	this.rotation = 0;
	
	grid.apply(this);
	this.findGhost();
}

function Grid() {
	this.grid = new Array(10);
	for(i = 0; i < 10; i++) {
		this.grid[i] = new Array(22);
		for(j = 0; j < 22; j++) {
			this.grid[i][j] = 0;
		}
	}
	
	this.render = function() {
		ctx.fillStyle = "#dddddd";
		//ctx.fillRect(0,0,40,84);
		
		for(i = 0; i < holdWidth; i++) {
			for(j = 0; j < holdHeight; j++) {
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(scale*i,scale*j,scale,scale);
				ctx.fillStyle = "#dddddd";
				ctx.fillRect(scale*i+1,scale*j+1,scale-2,scale-2);
			}
		}
		
		for(pre = 0; pre < 3; pre++) {
			for(i = 0; i < holdWidth; i++) {
				for(j = 0; j < holdHeight; j++) {
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(scale*16 + scale*i,scale*j + scale*pre*3,scale,scale);
					ctx.fillStyle = "#dddddd";
					ctx.fillRect(scale*16 + scale*i+1,scale*j+1  + scale*pre*3,scale-2,scale-2);
				}
			}
			if(future) {
				previewType = future[pre];
				if(previewType == 1) {
					ctx.fillStyle = "#ff00ff";
					ctx.fillRect(scale*16 + scale*0,scale*0+ scale*pre*3,scale*3,scale);
					ctx.fillRect(scale*16 + scale*1,scale*1+ scale*pre*3,scale,scale);
				}
				if(previewType == 2) {
					ctx.fillStyle = "#ffff00";
					ctx.fillRect(scale*16 + scale*1,scale*0+ scale*pre*3,scale*2,scale*2);
				}
				if(previewType == 3) {
					ctx.fillStyle = "#00ff00";
					ctx.fillRect(scale*16 + scale*1,scale*0+ scale*pre*3,scale*2,scale);
					ctx.fillRect(scale*16 + scale*0,scale*1+ scale*pre*3,scale*2,scale);
				}
				if(previewType == 4) {
					ctx.fillStyle = "#ff0000";
					ctx.fillRect(scale*16 + scale*0,scale*0+ scale*pre*3,scale*2,scale);
					ctx.fillRect(scale*16 + scale*1,scale*1+ scale*pre*3,scale*2,scale);
				}
				if(previewType == 5) {
					ctx.fillStyle = "#ffa500";
					ctx.fillRect(scale*16 + scale*2,scale*0+ scale*pre*3,scale*1,scale);
					ctx.fillRect(scale*16 + scale*0,scale*1+ scale*pre*3,scale*3,scale);
				}
				if(previewType == 6) {
					ctx.fillStyle = "#0000ff";
					ctx.fillRect(scale*16 + scale*0,scale*0+ scale*pre*3,scale*1,scale);
					ctx.fillRect(scale*16 + scale*0,scale*1+ scale*pre*3,scale*3,scale);
				}
				if(previewType == 7) {
					ctx.fillStyle = "#00ffff";
					ctx.fillRect(scale*16 + scale*0,scale*1+ scale*pre*3,scale*4,scale);
				}
			}
		}
		
		if(holdType == 1) {
			ctx.fillStyle = "#ff00ff";
			ctx.fillRect(scale*0,scale*0,scale*3,scale);
			ctx.fillRect(scale*1,scale*1,scale,scale);
		}
		if(holdType == 2) {
			ctx.fillStyle = "#ffff00";
			ctx.fillRect(scale*1,scale*0,scale*2,scale*2);
		}
		if(holdType == 3) {
			ctx.fillStyle = "#00ff00";
			ctx.fillRect(scale*1,scale*0,scale*2,scale);
			ctx.fillRect(scale*0,scale*1,scale*2,scale);
		}
		if(holdType == 4) {
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(scale*0,scale*0,scale*2,scale);
			ctx.fillRect(scale*1,scale*1,scale*2,scale);
		}
		if(holdType == 5) {
			ctx.fillStyle = "#ffa500";
			ctx.fillRect(scale*2,scale*0,scale*1,scale);
			ctx.fillRect(scale*0,scale*1,scale*3,scale);
		}
		if(holdType == 6) {
			ctx.fillStyle = "#0000ff";
			ctx.fillRect(scale*0,scale*0,scale*1,scale);
			ctx.fillRect(scale*0,scale*1,scale*3,scale);
		}
		if(holdType == 7) {
			ctx.fillStyle = "#00ffff";
			ctx.fillRect(scale*0,scale*1,scale*4,scale);
		}
		
		for(i = 0; i < 10; i++) {
			for(j = 2; j < 22; j++) {
				if(this.grid[i][j] == 0) {
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
					ctx.fillStyle = "#dddddd";
					ctx.fillRect(scale*(holdWidth+1)+scale*i+1,scale*(j-2)+1,scale-2,scale-2);
				}
				if(this.grid[i][j] == 1) {
					ctx.fillStyle = "#ff00ff";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
				if(this.grid[i][j] == 2) {
					ctx.fillStyle = "#ffff00";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
				if(this.grid[i][j] == 3) {
					ctx.fillStyle = "#00ff00";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
				if(this.grid[i][j] == 4) {
					ctx.fillStyle = "#ff0000";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
				if(this.grid[i][j] == 5) {
					ctx.fillStyle = "#ffa500";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
				if(this.grid[i][j] == 6) {
					ctx.fillStyle = "#0000ff";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
				if(this.grid[i][j] == 7) {
					ctx.fillStyle = "#00ffff";
					ctx.fillRect(scale*(holdWidth+1)+scale*i,scale*(j-2),scale,scale);
				}
			}
		}
		if(piece) {
			held = piece.gridType;
			if(held == 1) ctx.fillStyle = "#ff00ff";
			if(held == 2) ctx.fillStyle = "#ffff00";
			if(held == 3) ctx.fillStyle = "#00ff00";
			if(held == 4) ctx.fillStyle = "#ff0000";
			if(held == 5) ctx.fillStyle = "#ffa500";
			if(held == 6) ctx.fillStyle = "#0000ff";
			if(held == 7) ctx.fillStyle = "#00ffff";
			ctx.globalAlpha=0.3;
			ctx.fillRect(scale*(holdWidth+1)+scale*piece.ghostPos[0],scale*(piece.ghostPos[1]-2),scale,scale);
			ctx.fillRect(scale*(holdWidth+1)+scale*piece.ghostPos[2],scale*(piece.ghostPos[3]-2),scale,scale);
			ctx.fillRect(scale*(holdWidth+1)+scale*piece.ghostPos[4],scale*(piece.ghostPos[5]-2),scale,scale);
			ctx.fillRect(scale*(holdWidth+1)+scale*piece.ghostPos[6],scale*(piece.ghostPos[7]-2),scale,scale);
			ctx.globalAlpha=1;
		}
		if(!game) {
			ctx.fillStyle = "#000000";
			ctx.font = '15px sans-serif';
			ctx.fillText('Controls:', 0, scale*3);
			ctx.fillText('Shift - left/right arrows', 0, scale*4);
			ctx.fillText('Soft Drop - down arrow', 0, scale*5);
			ctx.fillText('Hard Drop - up arrow', 0, scale*6);
			ctx.fillText('Hold - shift', 0, scale*7);
			ctx.fillText('Rotate - x', 0, scale*8);
			ctx.fillText('Start Game - spacebar', 0, scale*9);
		}
		ctx.fillStyle = "#000000";
		ctx.font = '20px sans-serif';
		ctx.fillText('Lines: ' + lines, scale*16, scale*9);
	};
	
	this.apply = function(piece) {
		realPlacement = true;
		for(i = 0; i < 8; i++) {
			if(piece.pos[i] < 0) {
				realPlacement = false;
				break;
			}
		}
		
		this.grid[piece.oldPos[0]][piece.oldPos[1]] = 0;
		this.grid[piece.oldPos[2]][piece.oldPos[3]] = 0;
		this.grid[piece.oldPos[4]][piece.oldPos[5]] = 0;
		this.grid[piece.oldPos[6]][piece.oldPos[7]] = 0;
		
		
		
		if(realPlacement) {
			this.checkForEnd(piece);
			this.grid[piece.pos[0]][piece.pos[1]] = piece.gridType;
			this.grid[piece.pos[2]][piece.pos[3]] = piece.gridType;
			this.grid[piece.pos[4]][piece.pos[5]] = piece.gridType;
			this.grid[piece.pos[6]][piece.pos[7]] = piece.gridType;
		}
	};
	
	this.checkForEnd = function(piece) {
		if(grid.grid[piece.pos[0]][piece.pos[1]] != 0 ||
		   grid.grid[piece.pos[2]][piece.pos[3]] != 0 ||
		   grid.grid[piece.pos[4]][piece.pos[5]] != 0 ||
		   grid.grid[piece.pos[6]][piece.pos[7]] != 0
		) {
			gameOver = true;
			clearInterval(game);
			game = null;
		}
	}
	
	this.gravity = function() {
			moved = piece.move([0,1,0,1,0,1,0,1]);
			if(!moved && timeout == null){
				timeoutLeft = 250;
				timeout = setInterval(function(){
					enqueue("lock");
				},10);
			} else {
				if(moved && timeout) {
					timeoutLeft = 250;
				}
			}
			return moved;
	};

	this.lock = function() {
					timeoutLeft -= 10;
					if(piece.ghostPos.equals(piece.pos)) {
						if(!piece.move(0,1,0,1,0,1,0,1)) {
							piece = grid.newPiece();
							grid.apply(piece);
						} else {
							piece.move(0,-1,0,-1,0,-1,0,-1);
							clearInterval(timeout);
							timeout = null;
						}
					}
	}
	
	this.clearRows = function() {
		for(j = 0; j < 22; j++) {
			clearCount = 0;
			rowClear = true;
			for(i = 0; i < 10; i++) {
				if(this.grid[i][j] == 0) {
					rowClear = false;
				}
			}
			if(rowClear) {
				this.clearRow(j);
				lines++;
			}
		}
	}
	
	this.clearRow = function(row) {
		for(i = 0; i < 10; i++) {
			this.grid[i][row] = 0;
		}
		for(i = 0; i < 10; i++) {
			for(j = row; j > 0; j--) {
				this.grid[i][j] = this.grid[i][j-1];
				this.grid[i][j-1] = 0;
			}
		}
	}
	
	this.clearPiece = function() {
		this.grid[piece.pos[0]][piece.pos[1]] = 0;
		this.grid[piece.pos[2]][piece.pos[3]] = 0;
		this.grid[piece.pos[4]][piece.pos[5]] = 0;
		this.grid[piece.pos[6]][piece.pos[7]] = 0;
	}
	
	this.holdPiece = function() {
		held = holdType;
		holdType = piece.gridType;
		if(held != 0) {
			this.clearPiece();
			if(held == 1) piece = new T();
			if(held == 2) piece = new O();
			if(held == 3) piece = new S();
			if(held == 4) piece = new Z();
			if(held == 5) piece = new L();
			if(held == 6) piece = new J();
			if(held == 7) piece = new I();
			holdResolving = true;
		} else {
			this.clearPiece();
			piece = this.newPiece();
		}
	}
	
	this.newPiece = function() {
		
		holdResolving = false;
		while(future.length < 8) {
			f = pieces.slice();
			shuffle(f);
			future = future.concat(f);
		}
		this.clearRows();
		next = future[0];
		future.shift();
		if(next == 1) return new T();
		if(next == 2) return new O();
		if(next == 3) return new S();
		if(next == 4) return new Z();
		if(next == 5) return new L();
		if(next == 6) return new J();
		if(next == 7) return new I();
	}
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
		if(left == null) {
			clearInterval(right);
			right = null;
			enqueue("left");
			left = setInterval(function(){enqueue("left")},150);
		}
    }
    if(event.keyCode == 39) {
        if(right == null) {
			clearInterval(left);
			left = null;
			enqueue("right");
			right = setInterval(function(){enqueue("right")},150);
		}
    }
	if(event.keyCode == 40) {
        if(down == null) {
			enqueue("gravity");
			down = setInterval(function(){enqueue("gravity")},150);
		}
    }
	if(event.keyCode == 88) {
		if(canRotate) {
			enqueue("rotate-right");
			canRotate = false;
		}
    }
	if(event.keyCode == 16) {
		if(canHold && !holdResolving) {
			enqueue("hold-piece");
			canHold = false;
		}
    }
	if(event.keyCode == 38) {
		if(canDrop) {
			enqueue("hard-drop");
			canDrop = false;
		}
    }
	if(event.keyCode == 32) {
		enqueue("game");
    }
});



document.addEventListener('keyup', function(event) {
    if(event.keyCode == 37) {
        clearInterval(left);
		left = null;
    }
    if(event.keyCode == 39) {
        clearInterval(right);
		right = null;
    }
	if(event.keyCode == 40) {
        clearInterval(down);
		down = null;
    }
	if(event.keyCode == 88) {
        canRotate = true;
    }
	if(event.keyCode == 38) {
        canDrop = true;
    }
	if(event.keyCode == 16) {
        canHold = true;
    }
});

enqueue = function(x) {
	queue.push(x);
	if(runningQueue == false) {
		runqueue();
	}
}

runqueue = function() {
	runningQueue = true;
	while(queue.length > 0) {
		action = queue[0];
		queue.shift();
		if(game) {
			if(action == "gravity") {
				grid.gravity();
			}
			if(action == "left") {
				piece.left();
			}
			if(action == "right") {
				piece.right();
			}
			if(action == "rotate-right") {
				piece.rotate();
			}
			if(action == "hold-piece") {
				grid.holdPiece();
			}
			if(action == "hard-drop") {
				piece.hardDrop();
			}
			if(action == "lock") {
				grid.lock();
			}
		}
		if(!game) {
			if(action == "game") {
				startGame();
			}
		}
		if(action == "render") {
				grid.render();
			}
		console.log(action);
	}
	runningQueue = false;
}

render = function() {
	enqueue("render");
}
gravity = function() {
	enqueue("gravity");
}

startGame = function() {
	piece = null;
	grid = null;
	clearInterval(game);
	clearInterval(graphics);
	game = null;
	graphics = null;
	runningQueue = false;
	left = null;
	right = null;
	down = null;
	canRotate = true;
	canHold = true;
	canDrop = true;
	holdResolving = false;
	holdType = 0;
	pieces = [1,2,3,4,5,6,7];
	future = new Array();
	grid = new Grid();
	piece = grid.newPiece();
	lines = 0;
	game = setInterval(gravity, 300);
	graphics = setInterval(render, 33);
}




Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

grid = new Grid();
graphics = setInterval(render, 33);