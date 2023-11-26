class EventEmitter {
    events = {};
    on(evName, cb) {
        const events = (this.events[evName] ??= []);
        events.push(cb);
    }
    emit(evName, data) {
        const events = (this.events[evName] ??= []);
        events.forEach((event) => event(data));
    }
    once(evName, cb) {
        const events = (this.events[evName] ??= []);
        const wrapper = (arg) => {
            cb(arg);
            this.off(evName, cb);
        };
        wrapper.cb = cb;
        events.push(wrapper);
    }
    off(evName, cb) {
        const events = (this.events[evName] ??= []);
        if (!cb) {
            this.events[evName] = [];
        }
        else {
            this.events[evName] = events.filter((event) => [event, !event.cb].includes(cb));
        }
    }
}
const event = new EventEmitter();
export default event;
