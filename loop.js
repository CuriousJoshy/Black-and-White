
var Game = window.Game || {};

Game.loop = (function(){
    var lastTime, currentTime, delta = 0, tick;
    
    var running = false, fps = 60, step = 1000 / 60, useFixedTimeStep = false, maxDelta = 10000;
    
    var updateFunc, drawFunc, currentState, ctx;
    
    function getTime()
    {
        return (window.performance && performance.now()) || Date.now();
    }
    
    function frameUpdate(delta)
    {
        updateFunc && updateFunc(delta);
    }
    
    function frameDraw()
    {        
        drawFunc && drawFunc(ctx);
    }

    function gameloop()
    {
        tick = requestAnimationFrame(gameloop);
        
        currentTime = getTime();

        delta = Math.min(delta + (currentTime - lastTime), maxDelta);
        
        if(useFixedTimeStep)
        {
            let updates = 0;

            while(delta >= step)
            {
                frameUpdate(step / 1000);

                delta -= step;
                updates++;
            }

            frameDraw();
        }
        else if(delta >= step)
        {
            frameUpdate(delta / 1000);
            frameDraw();
            
            delta = 0;
        }

        lastTime = currentTime;
    }

    function start(fps, fixedTimeStep)
    {
        if(running)
            return false;
        
        running = true;
        
        fps = fps || 60;
        step = 1000 / fps;

        useFixedTimeStep = !!fixedTimeStep;
        
        lastTime = getTime();
        gameloop();
        
        return true;
    }
    
    function stop()
    {
        if(!running)
            return false;
        
        running = false;
        
        cancelAnimationFrame(tick);
        
        return true;
    }
    
    return {
        onUpdate: (update) => update == undefined ? updateFunc : updateFunc = update,
        onDraw: (draw) => draw == undefined ? drawFunc : drawFunc = draw,
        useCtx: function(_ctx)
        {
            ctx = _ctx;
        },
        useState: (name) => {
            if(!Game.state)
                return
            
            let state = Game.state.get(name);
                        
            if(!state)
                return;
                        
            if(state.update)
                updateFunc = state.update.bind(state);
            
            if(state.draw)
                drawFunc = state.draw.bind(state);
            
            currentState = state;
        },
        clearState: function(name)
        {
            if(name && name != currentState.name)
                return;
            
            updateFunc = null;
            drawFunc = null;
        },
        
        start: start,
        stop: stop,
        useFixed: (useFixed) => useFixedTimeStep = useFixed,
        isFixed: () => useFixedTimeStep,
        isRunning: () => running,
        
        getLastTime: () => lastTime,
        getCurrentTime: () => currentTime,
        getDelta: () => delta,
        
        fps: (FPS) => {
            if(FPS == undefined)
                return fps;
            
            fps = FPS;
            step = 1000 / fps;
        },
        
        getTimeStep: () => step,
        maxUpdates: (max) => {
            if(max == undefined)
                return maxUpdates;
            
            maxUpdates = max;
        }
    };
})();
