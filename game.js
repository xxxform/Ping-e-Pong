"use strict";
var Walls = [], Balls = [], Users = [], score = 0;

function Ball(spd, pwr, position, direction) {
    var intId;

    Object.defineProperty(this, 'pwr', {
        get: function() {return pwr},
        set : function(val) {
            pwr = val;
        }
    });

    Object.defineProperty(this, 'speed', {
        get: function() {return spd},
        set : function(val) {
            this.stop();
            spd = val;
       	    this.start();
        }
    });
    
    this.getPosition = position;
    this.getDirection = direction;
    
	this.start = function() {
        
		function intrval() {
			var Y = position[0],
                X = position[1];
			
			draw(position[1], position[0]);
     
            checkAll();
			
            direction[0] ? Y++ : Y--;
            direction[1] ? X++ : X--;
			
			while ( checkBlock(Y, X, pwr) ) {
				revDir(1, 1);
				direction[0] ? Y++ : Y--;
				direction[1] ? X++ : X--;
				checkAll();
			}
            
			direction[0] ? position[0]++ : position[0]--;
            direction[1] ? position[1]++ : position[1]--;
            
            draw(position[1], position[0], 'white', 'border');
			
			//Регулировка направления
			function checkAll() {
				
				if ( checkBlock(Y+1, X, pwr) || checkBlock(Y-1, X, pwr) ) {
					revDir(1);
				}
				
				if ( checkBlock(Y, X+1, pwr) || checkBlock(Y, X-1, pwr) ) {
					revDir();
				}
				
			}
            
			//Инверсия направления
			function revDir(y) {
				if ( arguments[1] ) {
					direction[0] = !direction[0];
					direction[1] = !direction[1];
				} else {
					y ? direction[0] = !direction[0] :
					direction[1] = !direction[1];
				}
			}

            //Изменение скорости
            if (spd > 100) spd --;
            ++score;
            
		};
        
        intId = setInterval(intrval.bind(this), spd);
	};
	this.stop = function(){
		clearInterval(intId);
	};
}





function User(speed, widthShield, HP, part) {

    this.ready = false;
    this.part = part;

    Object.defineProperties(this, {
    	HP: {
    		get: function() {return HP},
    		set: function(val) {
    			HP = val;
                if (part) {
                    this.wall = Walls[0] = new Wall(val, null, part);
                } else {
                    this.wall = Walls[1] = new Wall(val, null, part);
                }
    		}
    	},
    	speed: {
    		get: function() {return speed},
    		set: function(val) {
                var spd;
                switch(+val) {
                    case 0: spd = Infinity; break;
                    case 1: spd = 600; break;
                    case 2: spd = 350;  break;
                    case 3: spd = 200;  break;
                }
                this.shield.speed = speed = spd;
    		}
    	},
    	widthShield: {
    		get: function() {return widthShield},
    		set: function(val) {
                var center = Math.floor(settings.height/2), width = [];
                
                for (;--val + 1;){
                    width.push(++center);
                }   
                
                if (this.shield) this.shield.HP = 0;
                this.shield = new Shield(Infinity, part ? part - settings.playZone : part + settings.playZone, width, this.speed);
    		}
    	}
    });

    this.HP = HP;
    this.widthShield = widthShield; 
    this.speed = speed;
}




function Wall(HP, x, y) {
    
    this.draw = function () {
        var color = HP == Infinity ? 'blue':
            HP == 3 ? 'rgba(255,255,255,0.7)' :
            HP == 2 ? '#78705E' :
            HP == 1 ? 'rgba(147, 108, 99, 0.76)': null,
            cls = HP > 0 ? 'border' : null;
        
        draw(x, y, color, cls);
    }
		
    this.setWall = function () {
        var X = [], Y = [];
        if ( Array.isArray(x) ) {
			if (Array.isArray(y)) {
				x.forEach(function(item, i) {
                    Y.push(y[i]);
                    X.push(x[i]);
                }); 
			} else {
                x.forEach(function(item, i) {
                    Y.push(y);
                    X.push(x[i]);
                }); 
            }
		} else {
            if (Array.isArray(y)) {
				y.forEach(function(item, i) {
                    Y.push(y[i]);
                    X.push(x);
                }); 
			} else {
                
                if ( (x || x === 0) && (y || y === 0) ) {
                    Y.push(y);
                    X.push(x);
                } else if (x || x === 0) {
                    for (var i = 0; i <= settings.width; i++) {
                        Y.push(x);
                        X.push(i);
                    }
                } else if (y || y === 0) {
                    for (var i = 0; i <= settings.height; i++) {
                        Y.push(i);
                        X.push(y);
                    }
                } else {
                    Y = null;
                    X = null;
                }
            }
        }
        this.x = x = X;
        this.y = y = Y;
    }
    
    Object.defineProperty(this, 'HP', {
		get: function() {return HP},
		set: function(val) {
            HP = val;
            if (val < 1) {
                this.y = null;
                this.x = null;
            }
            this.setWall();
            this.draw();
		}
	});
    
    this.HP = HP;
    this.x = x;
    this.y = y;
     
}

function Shield(HP, x, y, speed) {
    var ready = true;
	Wall.call(this, HP, x, y);
    
    this.speed = speed;
	this.move = function(dir) {
        if (ready) {
            var maxY = Math.max.apply(null, this.y),
                minY = Math.min.apply(null, this.y),
                maxIndY = this.y.indexOf(maxY),
                minIndY = this.y.indexOf(minY);
            
        	if (dir === 1 || !dir) {
                var Y = !dir ? maxY + 1 : minY - 1,
                    indx = !dir ? maxIndY : minIndY,
                    dir = !dir ? 1 : -1;
                
                if ( !checkBlock(Y, this.x[indx] || x) ) {
                    for (var i = this.y.length; i--;) {
                        draw(this.x[i], this.y[i]);
                        this.y[i] += dir;
                    }
                    this.draw();
                }
        	} else {
                if(dir === -2 || dir === 2) {
                    dir = dir === 2 ? 1 : -1;
                    
                    for (var i = this.y.length - 1; i > -1; i--) {
                        if ( isntPzone(this.x[i] + dir, this.y[i]) ||
                            checkBlock(this.y[i], this.x[i] + dir)) break;
                        if (i == 0) {
                            for (var l = this.y.length - 1; l > -1; l--) {
                                draw(this.x[l], this.y[l]);
                                this.x[l] += dir;
                            }      
                            this.draw();
                        }
                    }
        	   }
            }
            
            
            ready = false;
            setTimeout(function() {ready = true}, this.speed)
        }
        function isntPzone(x, y) {
            return !$('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('playZone');
        }
    }
}





//AutoFunctions
Users.push(new User(1, 1, 1, 0), new User(1, 1, 1, settings.width));
	
//Kontroller
$('body').on('keydown',function(e){

    switch(e.which) {
            
        case 87:
            Users[0].shield.move(1);
        break;
        case 83:
            Users[0].shield.move(null);
        break;

        case 65:
            Users[0].shield.move(-2);
        break;
        case 68:
            Users[0].shield.move(2);
        break;
            
            
        case 38:
            Users[1].shield.move(1);
        break;
        case 40:
            Users[1].shield.move(null);
        break;

        case 37:
            Users[1].shield.move(-2);
        break;
        case 39:
            Users[1].shield.move(2);
        break;
    }

});

$('.startButtons input[type="number"]').on('change', function(e){

    var attr = $(this).attr('value'),
        val = $(this).val(),
		cls = $(this).attr('class'),
        points = $(this).siblings('.countPoint').text(),
        userId = +$(this).parent().attr('class')[7];
    
	if ( (val > 3 || val < 1) ) {
        $(this).parent().find('input[type="number"]').attr('value', 1);
        $(this).parent().find('input[type="number"]').val(1);
        $(this).parent().find('.countPoint').text(3);
    } else {
        
        if ( val > attr ) {
            if (points > 0) {
                $(this).attr( 'value', val );
                $(this).siblings('.countPoint').text(--points);
				userChange(val);
            } else {
                $(this).attr('value', attr );
                $(this).val(attr);
				userChange(attr);
            }
        } else {
            $(this).attr( 'value', val );
            $(this).siblings('.countPoint').text(++points);
			userChange(val);			
        }
    }
	
    function userChange(val) {
        Users[userId][cls] = val;
	}
});

$('.confirm').click(function() {
    var userId = +$(this).parent().attr('class')[7];
    $(this).parent().find('input[type="number"]').attr('disabled', 1);
    
    Users[userId].ready = true;
    
    if ( Users.every(isReady) ) {
        Balls.push( new Ball(settings.speedBall, settings.powerBall,
         [Math.floor(settings.height/2), Math.floor(settings.width/2)],
          [1, 1]) );
        Balls[Balls.length-1].start();
    }

    function isReady(User) {
        return User.ready;
    }
});

function checkBlock(y, x, pwr) {
    var pwr = pwr || 0;
    
    //Проверка победы
        if ( x < Users[0].part || x > Users[1].part ) {
                
            if ( x < Users[0].part ) {
                alert('Конец игры. Победил игрок 2 со счетом '+score);
            }
            if ( x > Users[1].part ) {
                alert('Конец игры. Победил игрок 1 со счетом '+score);
            }
            
            Balls.forEach(function(Ball) {
                Ball.stop();
            });
                
        }

    //($('body') instanceof $)
    if ( !$('tr').is('[row="a'+ y +'"]') ||
        $('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('border')) {
             
        //Удар стен
        Walls.forEach(function(Wall, i) {
            var X = Wall.x, Y = Wall.y;
            
            for (var i = X.length ; i--; ) {
                if ( X[i] == x && Y[i] == y ) {
                    Wall.HP -= pwr;
                    break;
                }
            }
        });
        
        return true;
    }
}

//View
function draw(x, y, col, cls){

    if (Array.isArray(x) && Array.isArray(y)) {
        x.forEach(function(item, i) {
            drawBlock(x[i], y[i]);
        });
    } else {
        drawBlock(x, y);
    }

    function drawBlock(x, y) {
        
        var blk = $('tr[row="a'+ y +'"] > td[col="'+ x +'"]');

        if (cls) blk.addClass(cls);
        else blk.removeClass('border');
        
        if (col) blk.css({background: col});
        else blk.removeAttr('style');

    } 
}