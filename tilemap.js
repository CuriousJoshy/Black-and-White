var Game = window.Game || {};

Game.tilemap = (function(){
    var maps = {};

    var Tilemap = function(name, {legend, data, objects, tileSize})
    {
        this.name = name;
        
        this.legend = legend || {};
        this.data = data || [];
        this.objects = objects || [];
        
        this.tileSize = tileSize || 20;
        
        if(Game.entity)
            this.objects = objects.map((o) => Game.entity.isDefined(o.name) ? Game.entity.create(o.name, o) : o);
    };
    
    Tilemap.prototype = {
        p2t: function(val)
        {
            return Math.floor(val / this.tileSize);
        },
        
        t2p: function(val)
        {
            return val * this.tileSize;
        },
        
        at: function(x, y)
        {
            return this.data[y] ? this.data[y][x] : -1;
        },
        
        dataAt: function(x, y)
        {
            let id = this.at(x, y);
            
            return this.legend[id] || {};
        },
        
        solidAt: function(x, y)
        {
            return !!this.dataAt(x, y).solid;
        },
        
        draw: function(ctx)
        {
            let legend = this.legend, data = this.data, id, props;
            
            let size = this.tileSize;
            
            for(var y = 0, h = data.length; y < h; y++)
            {
                for(var x = 0, w = data[y].length; x < w; x++)
                {
                    id = data[y][x];
                    props = legend[id];
                    
                    if(id == -1 || props.visible == false)
                        continue;
                    
                    ctx.fillStyle = props.color;
                    
                    ctx.fillRect(x * size, y * size, size, size);
                }
            }
        }
    };
    
    function addMap(name, options)
    {        
        maps[name] = new Tilemap(name, options);
    }
    
    function removeMap(name)
    {
        delete maps[name];
    }
    
    function getMap(name)
    {
        return maps[name];
    }
    
    return {
        add: addMap,
        
        fromJSON: function(name, json)
        {            
            addMap(name, JSON.parse(json));
        },
        
        remove: removeMap,
        
        get: getMap
    };
})();
