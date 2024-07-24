import KeyManager from "./modules/keys.js"

const { Engine, Render, Bodies, Body, Composite, Collision, Detector } = Matter;

const engine = Engine.create();
const render = Render.create({
    canvas: document.getElementById("main"),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: "black",
        wireframes: false,
        showAngleIndicator: false
    }
});
const Keys = new KeyManager(render.canvas)
const Objects = [];
window.onresize = () => {
    const oldWidth = render.canvas.width;
    const oldHeight = render.canvas.height;
    const newWidth = window.innerWidth;
    const newHeight = (newWidth / 16) * 9;
    render.canvas.width = render.options.width = newWidth;
    render.canvas.height = render.options.height = newHeight;
    Render.setPixelRatio(render, window.devicePixelRatio || 1);
    for (const obj of Objects) {
        const newX = (obj.position.x / oldWidth) * newWidth
        const newY = (obj.position.y / oldHeight) * newHeight
        Body.set(obj, "position", { x: newX, y: newY })
        const oldInertia = obj.inertia
        Body.scale(obj, newWidth / oldWidth, newHeight / oldHeight)
        Body.setInertia(obj, oldInertia)
    }
};
render.canvas.width = 128 //DO NOT DELETE OR RESET
render.canvas.height = 72 //THIS IS FOR CONSISTENT SCALING WHILE MAP MAKING :p

let PLAYER = Bodies.rectangle(64, 36, 4, 4, { DESCRIPTION: "player_me", mass: 1000, inertia: Infinity, friction: 5, frictionAir: 0.01 });
Objects.push(PLAYER)

// currently the entire map lmao
for (let i = 0; i < 3; i++) {
    let a = Bodies.rectangle(64, 71 - (14 * i), 128 - (20 * i), 2, { friction: 5, isStatic: true });
    a.friction = 100
    Objects.push(a)
}
//

Body.rotate(Objects[Objects.length - 1], Math.PI / 6)

const Coll_Detector = Detector.create({ bodies: Objects })
function check_player_colls() {
    const allColls = Detector.collisions(Coll_Detector)
    for (const coll of allColls) {
        if (coll.bodyA.DESCRIPTION == "player_me" || coll.bodyB.DESCRIPTION == "player_me") {
            return true
        }
    }
}

Composite.add(engine.world, Objects);
Render.run(render);

const moveVel = 10
const CAMERA = JSON.parse(JSON.stringify(PLAYER.position));
function game_loop() {
    let isVelUpdated = false;
    const collChecl = check_player_colls();

    if (Keys.isPressed("d")) {
        Body.setVelocity(PLAYER, {
            x: lerp(PLAYER.velocity.x, moveVel, 0.5),
            y: PLAYER.velocity.y
        })
        isVelUpdated = true
    }
    if (Keys.isPressed("a")) {
        Body.setVelocity(PLAYER, {
            x: lerp(PLAYER.velocity.x, -moveVel, 0.5),
            y: PLAYER.velocity.y
        })
        isVelUpdated = true
    }
    if (Keys.isPressed("w") || Keys.isPressed("space")) {
        if (collChecl) {
            Body.setVelocity(PLAYER, {
                x: PLAYER.velocity.x,
                y: lerp(PLAYER.velocity.y, -moveVel * 2, 0.5),
            })
        }
        isVelUpdated = true
    }
    if (Keys.isPressed("s")) {
        Body.setVelocity(PLAYER, {
            x: PLAYER.velocity.x,
            y: lerp(PLAYER.velocity.y, moveVel * 2, 0.5),
        })
        isVelUpdated = true
    }
    if (!isVelUpdated && collChecl) {
        Body.setVelocity(PLAYER, {
            x: 0,
            y: 0,
        })
    }

    CAMERA.x = lerp(CAMERA.x,PLAYER.position.x,0.2)
    CAMERA.y = lerp(CAMERA.y,PLAYER.position.y,0.2)
    Render.lookAt(render, CAMERA, {
        x: render.options.width/1.7,
        y: render.options.height/1.7
    });

    Engine.update(engine);
    requestAnimationFrame(game_loop)
}
window.onresize();
game_loop()

window.objects = Objects

function lerp(a, b, t) { return a + ((b - a) * t) }