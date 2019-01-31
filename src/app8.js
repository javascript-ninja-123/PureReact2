import { defaultCoreCipherList } from "constants";


class EventBus{
    constructor(){
        this.eventBus = {};
    }

    subscribe(topic,eventListener){
        this.eventBus[topic] = eventListener;
    }
    publish(topic){
        if(typeof this.eventBus[topic] !== 'function')return;
        return this.eventBus[topic]();
    }
}

const event = new EventBus();


const addEvent = (topic) => {
    return  (target,key,descriptor) => {
        const originalFn = descriptor.value.bind(target);
        
        descriptor.value = (...args) => {
            event.subscribe(topic,() => originalFn(...args))
            return originalFn(...args);
        }

        return descriptor
    }
}



class Todo{
    constructor(){

    }

    @addEvent("TODO")
    add(item){
        return item;
    }
}

const a = new Todo()


a.add("this data")



class Man{
    constructor(){

    }

    doThis(){
        const a = event.publish('TODO')
        return a;
    }
}


const y = new Man();

console.log(y.doThis())