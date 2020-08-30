function Props(props) {
    let calc = {};
    let dependants = {};
    let context;

    let watchers = [];
    let currentStack = [];
    let compute = (prop) => {
        currentStack.push(prop);
        let val = calc[prop](context);
        currentStack.splice(currentStack.lastIndexOf(prop), 1);
        return val;
    };

    let notify = (prop, value, prevValue) => {
        watchers.forEach((watcher) => {
            watcher(prop, value, prevValue);
        });
    };

    let store = {
        addWatcher: (func) => {
            watchers.push(func);
        },

        removeWatcher: (func) => {
            watchers.splice(watchers.indexOf(func), 1);
        },

        loadState(values) {
            // loads given state
            // prior to that figures out the exact update order so that any interdependent variables don't clash with each other
            let keys = Object.keys(values);
            let deps = {};
            Object.entries(dependants).forEach(([key, keyDependants]) => {
                keyDependants.forEach((keyDependant) => {
                    deps[keyDependant] = deps[keyDependant] || [];
                    deps[keyDependant].push(key);
                });
            });

            let attempts = 0;
            let order = [];

            // determine if we have any inter-dependencies and set the ones that have none before the ones that do
            function moveAvailable() {
                attempts += 1;
                if (attempts > 6) {
                    throw new Error("State seems to have circular dependencies; bailing");
                }

                keys.forEach((key) => {
                    let dependencies = (deps[key] || []).filter((d) => !order.includes(d) && values[d] !== undefined);
                    if (dependencies.length == 0) {
                        order.push(key);
                    }
                });

                keys = keys.filter((key) => !order.includes(key));
                if (keys.length > 0) {
                    moveAvailable();
                }
            }
            moveAvailable();

            order.forEach((field) => {
                context[field] = values[field];
            });
        },
        refresh() {
            // force a recalculation of all properties; generally speaking you shouldn't need this function
            Object.keys(calc).forEach((prop) => {
                context[prop] = compute(prop);
            });
        },

        _dependencies: () => dependants,
        derivedProps: () => Object.fromEntries(Object.keys(calc).map((key) => [key, context[key]])),
    };

    context = new Proxy(store, {
        get(store, prop) {
            currentStack.forEach((dependant) => {
                if (!(dependants[prop] || []).includes(dependant)) {
                    dependants[prop] = dependants[prop] || [];
                    dependants[prop].push(dependant);
                }
            });

            if (Reflect.has(store, prop)) {
                return store[prop];
            }

            if (Reflect.has(calc, prop)) {
                store[prop] = compute(prop);
                return store[prop];
            }

            // in case of undefined we assume null
            store[prop] = null;
            return null;
        },

        set(store, prop, val) {
            let exists = Reflect.has(store, prop) || Reflect.has(calc, prop);
            let prevVal = store[prop];

            if (typeof val == "function") {
                calc[prop] = val;
                if (exists) {
                    // on function rewrite we recalc the prop; bit of an edge case
                    val = compute(prop);
                }
            } else {
                if (Reflect.has(calc, prop) && !Reflect.has(store, prop)) {
                    // in the case when the prop already has a calc but we haven't run it yet and are going
                    // straight to setting a value,  make sure we run it at least once to set the dependency tree
                    compute(prop);
                }
                store[prop] = val;
            }

            if (exists) {
                if (val !== prevVal) {
                    notify(prop, val, prevVal);
                }

                if (dependants[prop]) {
                    // we recalc the dependencies on each set no matter as the dependant might depend on a derived
                    // calculation that has been replaced since. there is bit of a 3 cup situation
                    // essentially this is to bust a forced value in a mid-layer
                    dependants[prop].forEach((dependant) => {
                        // recalc all dependants
                        context[dependant] = compute(dependant);
                    });
                }
            }

            return true;
        },
    });

    Object.entries(props || {}).forEach(([prop, val]) => {
        context[prop] = val;
    });

    // determine dependencies once initial props have been set
    store.refresh();

    return context;
}

function round(val, precision = 0) {
    // rounds the number to requested precision. how is this not part of stdlib
    return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
}

function scale(val, min, max, defaultVal, step) {
    // converts the 0..1 value into min..max
    // default is there for convenience
    val = val == null ? (defaultVal - min) / (max - min) || 0 : val;
    let res = min + (max - min) * val;

    let shouldRound = round(min) == min && round(max) == max;
    res = round(res, shouldRound && !step ? 0 : 6);

    if (step) {
        res = res - (res % step);
    }

    return res;
}

function pseudoTest() {
    // xxx - move to actual unit tests once i libify the code
    let z = Props({
        a: 3,
        b: 4,
        multiply: (vars) => `a * b = ${vars.a * vars.b}`,
        decorate: (vars) => `*** decorate much: ${vars.multiply} ***`,
    });

    z.addWatcher((prop, val, prev) => {
        console.log(prop, "has changed", prev, "-->", val);
    });

    z.b = 6;
}

export {Props, scale};
