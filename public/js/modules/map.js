const { Bodies, Body, Collision } = Matter;

function generate_player(isMe, x, y, w, h) {
    return Bodies.rectangle(x, y, w, h, {
        DESCRIPTION: isMe ? "player_me" : "player",
        mass: 1000,
        inertia: Infinity,
        friction: 5,
        frictionAir: 0.001
    })
}

function generate_map(mapIndex) {
    const mapData = {
        name: "Classick",
        version: 0.1,
        width: 128,
        height: 72,
        player: {
            width: 4,
            height: 4
        },
        data: [
            { type: "rectangle", x: 1, y: 36, w: 2, h: 72, collidable: true, static: true, description: "non-jumpable wall" },
            { type: "rectangle", x: 127, y: 36, w: 2, h: 72, collidable: true, static: true, description: "non-jumpable wall" },
            { type: "rectangle", x: 64, y: 71, w: 128, h: 2, collidable: true, static: true, description: "wall" },
            { type: "rectangle", x: 64, y: 1, w: 128, h: 2, collidable: true, static: true, description: "non-jumpable wall" },

            { type: "rectangle", x: 10, y: 57, w: 5, h: 2, static: true },
            { type: "rectangle", x: 118, y: 57, w: 5, h: 2, static: true },

            { type: "rectangle", x: 42, y: 57, w: 40, h: 2, static: true },

            { type: "rectangle", x: 92, y: 57, w: 20, h: 2, static: true },

            { type: "rectangle", x: 62, y: 40, w: 40, h: 2, static: true },

            { type: "rectangle", x: 110, y: 35, w: 10, h: 2, static: true },

            { type: "rectangle", x: 20, y: 35, w: 20, h: 2, static: true },

            { type: "rectangle", x: 50, y: 20, w: 10, h: 2, static: true },

            { type: "rectangle", x: 100, y: 20, w: 20, h: 2, static: true },

        ]
    }

    const objects = []
    for (const o of mapData.data) {
        const options = {};
        if (o.description) {
            options.DESCRIPTION = o.description
        }
        if (o.collidable === false) {
            options.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0
            };
        }
        if (o.static) {
            options.isStatic = true
        }
        let a = Bodies[o.type](o.x, o.y, o.w, o.h, options);
        if (o.setFriction) {
            a.friction = o.setFriction
        }
        if (o.rotate) {
            Body.rotate(a, (Math.PI / 180) * o.rotate)
        }
        objects.push(a)
    }

    delete mapData.data
    mapData.objects = objects
    return mapData
}

export default {
    generate_map,
    generate_player
}