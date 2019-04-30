
var Game = window.Game || {};

// State Machine

Game.state = (function(){
    const NO_STATE_FOUND = "NO_STATE_FOUND", 
          WRONG_STATE = "WRONG_STATE", 
          ENTER_CONDITION_FAILED = "ENTER_CONDITION_FAILED", 
          EXIT_CONDITION_FAILED = "EXIT_CONDITION_FAILED", 
          EXIT_FAILED = "EXIT_FAILED", 
          SUCCESS = "SUCCESS";

    var states = {}, currentState;

    function addState(name, options)
    {        
        states[name] = {name: name, ...options};
    }

    function removeState(name)
    {
        let state = states[name];

        delete states[name];
    }

    function enterState(name, ...data)
    {
        let state = states[name];

        if(!state)
            return NO_STATE_FOUND;

        if(state.enterCondition && !state.enterCondition(...data))
            return ENTER_CONDITION_FAILED;

        let exitCode = exitState(null, ...data);

        if(exitCode == EXIT_CONDITION_FAILED)
            return EXIT_FAILED;

        if(state.enter)
            state.enter(...data);

        currentState = state;
        
        if(Game.loop)
            Game.loop.useState(state.name);

        return SUCCESS;
    }

    function exitState(...data)
    {
        let state = currentState;

        if(!state)
            return NO_STATE_FOUND;

        if(state.exitCondition && !state.exitCondition(...data))
            return EXIT_CONDITION_FAILED;

        if(state.exit)
            state.exit(...data);
        
        if(Game.loop)
            Game.loop.clearState(state.name);

        return SUCCESS;
    }

    function getState(name)
    {
        return states[name];
    }

    function stateIs(name)
    {
        return name && states[name] && states[name] == currentState;
    }
    
    return {
        add: addState,
        remove: removeState,
        enter: enterState,
        exit: exitState,
        
        get: getState,
        is: stateIs,
        
        get current()
        {
            return currentState;
        }
    };
})();

Game.input = (function(){
    // Key event handlers

    var keys = {};

    function handleKey(e)
    {
        let key = e.key == " " ? "space" : e.key.toLowerCase();
                
        let handler = Game.state.current && Game.state.current[e.type], type;
                
        if(e.type == "keydown")
            keys[key] = true;      
        else if(e.type == "keyup")
            delete keys[key];

        type = typeof handler;

        if(type == "function")
            handler(e, key);
        else if(type == "object")
        {        
            if(typeof handler[key] == "string")
                Game.state.enter(handler[key])
            else
                handler[key] && handler[key](e, key);
        }
        else if(type == "string")
            Game.state.enter(handler);
    }

    addEventListener("keydown", handleKey);
    addEventListener("keyup", handleKey);
    addEventListener("keypress", handleKey)

    // Mouse event handlers

    var mouse = {
        x: 0,
        y: 0,

        left: false,
        middle: false,
        right: false
    };

    // From https://stackoverflow.com/questions/10527983/best-way-to-detect-mac-os-x-or-windows-computers-with-javascript-or-jquery
    const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const BUTTON_NAMES = ["left","middle","right"];

    function handleMouse(e)
    {    
        let changed = null;

        let macLeft = IS_MAC && (e.button == 0 && e.ctrlKey)

        switch(e.type)
        {
            case "mousedown":
                if(e.button == 2 || macLeft)
                    mouse.right = true;
                if(e.button == 0)
                    mouse.left = true;
                if(e.button == 1)
                    mouse.middle = true;

                changed = BUTTON_NAMES[macLeft ? 2 : e.button];
                break;

            case "mouseup":
                if(e.button == 2 || macLeft)
                    mouse.right = false;
                else if(e.button == 0)
                    mouse.left = false;
                else if(e.button == 1)
                    mouse.middle = false;

                changed = BUTTON_NAMES[macLeft ? 2 : e.button];

                break;

            case "mousemove":
                mouse.x = e.offsetX;
                mouse.y = e.offsetY;
                break;
        }

        let handler = Game.state.current && Game.state.current[e.type];
        let type = typeof handler;

        if(type == "function")
            handler(e, changed);
        else if(type == "object" && changed)
        {
            if(typeof handler[changed] == "string")
                Game.state.enter(handler[changed]);
            else
                handler[changed] && handler[changed](e, changed);
        }
        else if(type == "string")
            Game.state.enter(handler);
    }

    function setMouseEventTarget(stage)
    {    
        stage.addEventListener("mousedown", handleMouse);
        stage.addEventListener("mouseup", handleMouse);
        stage.addEventListener("click", handleMouse);
        stage.addEventListener("contextmenu", handleMouse);
        stage.addEventListener("mousemove", handleMouse);
    }
    
    return {
        init: setMouseEventTarget,
        
        keys: keys,
        mouse: mouse
    };
})();
