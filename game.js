var stage = document.getElementById("stage"), style = getComputedStyle(stage);

/*
 *
 * Game library and utility functions setup
 *
 */

Game.input.init(stage);

var keys = Game.input.keys;

Game.world.init(stage);

Game.grid.debug.init({
    width: stage.width,
    height: stage.height,

    gridColor: "white"
});

function switchState()
{
    stage.classList.toggle("white");
    stage.classList.toggle("black");
}

function isState(state)
{
    return stage.classList.contains(state);
}

function invertRGB(rgb)
{
    let r, g, b;
    
    [r, g, b] = rgb.replace(/rgb\(|\)/g, "").split(",");
    
    return `rgb(${Math.abs(255 - r)}, ${Math.abs(255 - g)}, ${255 - b})`;
}

/*
 *
 * Entity creation
 *
*/

Game.entity.define("Player", {
    w: 20,
    h: 20,
    
    color: "#808080",
    
    speed: 180,
    
    handleTileCollision: function()
    {
        let map = this.world.map, size = map.tileSize;
        
        let tx = map.p2t(this.x), ty = map.p2t(this.y);
    
        let vx = this.x - this.lastX, vy = this.y - this.lastY;

        let nx = this.x % size, ny = this.y % size; 

        let t = map.solidAt(tx, ty), r = map.solidAt(tx + 1, ty), b = map.solidAt(tx, ty + 1), d = map.solidAt(tx + 1, ty + 1);
                
        if(vx > 0)
        {
            if((r && !t) || (d  && !b && ny))
                this.x = map.t2p(tx);
        }
        else if(vx < 0)
        {
            if((t && !r) || (b && !d && ny))
                this.x = map.t2p(tx + 1);
        }

        if(vy > 0)
        {
            if((b && !t) || (d && !r && nx))
                this.y = map.t2p(ty);
        }
        else if(vy < 0)
        {
            if((t && !b) || (r && !d && nx))
                this.y = map.t2p(ty + 1);
        }    
    },
    
    move: function(dt)
    {
        let speed = this.speed * dt;
        
        if(keys.a || keys.arrowleft)
            this.x -= speed;
        else if(keys.d || keys.arrowright)
            this.x += speed;
        
        if(keys.w || keys.arrowup)
            this.y -= speed;
        else if(keys.s || keys.arrowdown)
            this.y += speed;
    },
    
    update: function(dt)
    {
        this.move(dt);
        this.handleTileCollision();
    },
    
    draw: function(ctx)
    {
        ctx.fillStyle = this.color;
        
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
});

Game.entity.define("game-object", {
    r: 10,
    color: "#000",
    
    draw: function(ctx)
    {
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
});

Game.entity.extend("game-object", "start", {    
    visible: false,
    
    constructor: function({x, y})
    {
        this.x = x;
        this.y = y;
    },
    
    worldAdd: function()
    {
        let player = this.world.get("Player")[0];
        
        if(player)
        {
            player.x = this.x - this.r;
            player.y = this.y - this.r;
        }
    }
});

Game.entity.extend("game-object", "goal", {
    color: "#ff0000",
    
    constructor: function({x, y})
    {
        this.x = x;
        this.y = y;
    },
    
    collisionCheck: function(e)
    {
        if(e.is("Player"))
            this.world.useMap(`level ${++this.world.level}`);
    }
});

Game.entity.extend("game-object", "switch", {
    collisionCheck: function(e)
    {        
        if(e.is("Player"))
            switchState();
    },
    
    update: function()
    {
        this.noCollisionCheck = isState(this.name.substring(0, this.name.indexOf("-")));
    }
});

Game.entity.extend("switch", "black-switch", {
    color: "#000",
                
    constructor: function({x, y})
    {
        this.x = x;
        this.y = y;
    }
});

Game.entity.extend("switch", "white-switch", {
    color: "#fff",
            
    constructor: function({x, y})
    {
        this.x = x;
        this.y = y;
    },
    
    draw: function(ctx)
    {
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();        
    }
});

/*
 *
 * Tilemap creation
 *
 */

// Game.tilemap.fromJSON("test", localStorage.getItem("test-level"));

alert(window.top.random);

/*
 *
 * Game world creation
 *
 */

Game.world.add("world", {
    level: 2,
    
    enter: function()
    {
        this.add(Game.entity.create("Player"));
        
        this.useMap(`level ${this.level}`);
    },
    
    update: function()
    {
        let map = this.map;
        
        if(map)            
        {
            let legend = map.legend;
            
            legend[2].color = invertRGB(style.backgroundColor);
            
            legend[0].solid = isState("white");
            legend[1].solid = !legend[0].solid;
        }
    },
    
    draw: function(ctx)
    {
        if(keys.shift)
            Game.grid.debug.draw(ctx);
    }
});

/*
 *
 * Game state creation
 *
 */

Game.state.add("start", {
    keydown: {
        "space": () => switchState()
    },
    
    enter: function()
    {
//         Game.world.enter("world");
    },
    
    update: function(dt)
    {
        Game.world.current.update(dt);
    },
    
    draw: function(ctx)
    {
        Game.world.current.draw(ctx);
    }
});

Game.state.add("play", {
    
});

Game.state.add("pause", {
    
});

/*
 *
 * Game loop initiation
 *
 */

Game.state.enter("start");

Game.loop.useCtx(stage.getContext("2d"));
Game.loop.start(60, true);
