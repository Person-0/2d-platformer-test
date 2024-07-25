export default class Keys {
    constructor (element) {
        element.addEventListener("keydown", ({key})=>{
            let k = key.toLowerCase()
            if(k == " "){k = "space"}
            if(!(this.keys.includes(k))) {this.keys.push(k)}
            if(this.events[k]){
                this.events[k].map(e=>{e(true)})
            }
        })
        element.addEventListener("keyup", ({key})=>{
            let k = key.toLowerCase()
            if(k == " "){k = "space"}
            this.keys = this.keys.filter(_k => { return !(k === _k) })
            if(this.events[k]){
                this.events[k].map(e=>{e(false)})
            }
        })
    }

    keys = []
    events = {}

    addKeyListener = (key, fn) => {
        const k = key.toLowerCase()
        if(this.events[k]) {
            this.events[k].push(fn)
        } else {
            this.events[k] = [fn]
        }
    }

    clearKeyListeners = (key) => {
        try { delete this.events[key.toLowerCase()] } catch {}
    }

    removeKeyListener = (key, fn) => {
        const k = key.toLowerCase()
        if(this.events[k]) {
            this.events[k] = this.events[k].filter(evt => {return evt != fn})
        }
    }

    isPressed = (key) => {
        return this.keys.includes(key.toLowerCase())
    }
}