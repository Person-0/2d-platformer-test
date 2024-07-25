import KeyManager from "./modules/keys.js"
import MapManager from "./modules/map.js"

const { Engine, Render, Bodies, Body, Composite, Detector } = Matter;

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
const CAMERA = { x: 0, y: 0 };
const moveVel = { x: 1, y: 1 };

window.onresize = () => {
    const oldWidth = render.canvas.width;
    const oldHeight = render.canvas.height;
    const newWidth = window.innerWidth;
    const newHeight = (newWidth / 16) * 9;
    moveVel.x = (newWidth / oldWidth) * moveVel.x;
    moveVel.y = (newHeight / oldHeight) * moveVel.y;
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

const MAP = MapManager.generate_map(0)
render.canvas.width = MAP.width
render.canvas.height = MAP.height
MAP.objects.filter(e=>{Objects.push(e)})
const PLAYER = MapManager.generate_player(true, 64, 36, MAP.player.width, MAP.player.height)
Objects.push(PLAYER)

const Coll_Detector = Detector.create({ bodies: Objects })
function check_player_colls() {
    const allColls = Detector.collisions(Coll_Detector)
    for (const coll of allColls) {
        const bodyAd = (coll.bodyA.DESCRIPTION || "")
        const bodyBd = (coll.bodyB.DESCRIPTION || "")
        if (bodyAd.includes("player_me") || bodyBd.includes("player_me") && (coll.bodyA.collidable != false && coll.bodyB.collidable != false)) {
            return {
                isColliding: true,
                canJump: !(bodyAd.includes("non-jumpable") || bodyBd.includes("non-jumpable")),
                onwall: (bodyAd.includes("wall") || bodyBd.includes("wall"))
            }
        }
    }
    return {
        isColliding: false,
        canJump: false,
        onwall: false
    }
}

Composite.add(engine.world, Objects);
Render.run(render);

function game_loop() {
    let isVelUpdated = false;
    const collChecl = check_player_colls();

    if (Keys.isPressed("d")) {
        Body.setVelocity(PLAYER, {
            x: lerp(PLAYER.velocity.x, moveVel.x, 0.5),
            y: PLAYER.velocity.y
        })
        isVelUpdated = true
    }
    if (Keys.isPressed("a")) {
        Body.setVelocity(PLAYER, {
            x: lerp(PLAYER.velocity.x, -(moveVel.x), 0.5),
            y: PLAYER.velocity.y
        })
        isVelUpdated = true
    }
    if (Keys.isPressed("w") || Keys.isPressed("space")) {
        if (collChecl.canJump) {
            Body.setVelocity(PLAYER, {
                x: PLAYER.velocity.x,
                y: lerp(PLAYER.velocity.y, -(moveVel.y) * 2, 0.5),
            })
        }
        isVelUpdated = true
    }
    if (Keys.isPressed("s")) {
        if (!(collChecl.isColliding)) {
            Body.setVelocity(PLAYER, {
                x: PLAYER.velocity.x,
                y: lerp(PLAYER.velocity.y, (moveVel.y) * 2, 0.5),
            })
        }
        isVelUpdated = true
    }
    if (!isVelUpdated && collChecl.isColliding) {
        Body.setVelocity(PLAYER, {
            x: 0,
            y: 0,
        })
    }

    CAMERA.x = lerp(CAMERA.x, PLAYER.position.x, 0.1)
    CAMERA.y = lerp(CAMERA.y, PLAYER.position.y, 0.1)
    Render.lookAt(render, CAMERA, {
        x: render.options.width / 1.7,
        y: render.options.height / 1.7
    });

    Engine.update(engine);
    requestAnimationFrame(game_loop)
}
window.onresize();
game_loop()

window.objects = Objects

function lerp(a, b, t) { return a + ((b - a) * t) }