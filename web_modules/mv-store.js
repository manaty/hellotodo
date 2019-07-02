
const fetchModelSchema = async (className) => (await fetch('/model/' + className + '.json')).json()

String.prototype.evaluateOnContext = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${this}\`;`)(...vals);
}

export class MvStore {

    /**
     * A MvStore holds the state of a component and of some of its childs
     * If no parentStore is provided then the store is a root store
     * if not it is a sub store of its parent, accessible by its name.
     * The model describes the model class, that resolve to a json schema file, 
     * and mapping rules between the model and the props of the element.
     * @param {*} name 
     * @param {*} element
     * @param {*} parentStore 
     */
    constructor(name, element, parentStore = null) {
        this.name = name;
        this.parentStore = parentStore;
        this.listeners = {};
        this.subStores = {};
        this.state = parentStore == null ? {} : parentStore.registerSubStore(this);
        this.registerElementListener(element);
        if(Object.entries(this.state).length === 0){
            this.initLocalState(element, element.constructor.model);
        } else {
            this.dispatch(null);
        }
    }

    async initLocalState(element, model) {
        if (model.storage == "localStorage") {
            this.storage = "localStorage";
        } else {
            this.storage = "none";
        }

        this.loadState();
        if (model.modelClass) {
            let schema = await fetchModelSchema(model.modelClass);

            if (schema.type == "object") {
                Object.getOwnPropertyNames(schema.properties).forEach(key => {
                    let value = schema.properties[key];
                    if (this.state[key] != undefined) {
                        //FIXME this will store again the state
                        this.dispatch(key);
                    }
                    else if (value.type == "array") {
                        this.state[key] = [];
                    }
                    else if (value.type == "object") {
                        this.state[key] = {};
                    }
                    else if (value.type == "string") {
                        this.state[key] = "";
                    }
                    else if (value.type == "number") {
                        this.state[key] = 0.0;
                    }
                    else if (value.type == "integer") {
                        this.state[key] = 0;
                    }
                    else if (value.type == "boolean") {
                        this.state[key] = false;
                    }
                    else if (value.type == "null") {
                        this.state[key] = null;
                    }
                    //set state to initial value from element, typically from attribute
                    if (element[key] != undefined) {
                        this.state[key] = element[key]
                    }
                });
            };
        }
    }

    registerElementListener(element, name = "") {
        if (this.parentStore) {
            this.parentStore.registerElementListener(element, this.name +(name==""?"":("." + name)));
        } else {
            if (!this.listeners[name]) {
                this.listeners[name] = [];
            }
            this.listeners[name].push(element);
        }
    }


    registerSubStore(substore){
        this.subStores[substore.name]=substore;
        return this.getState(substore.name);
    }

    getState(name) {
        if (this.parentStore) {
            return this.parentStore.getState(this.name +(name==""?"":("." + name)));
        } else {
            if (!this.state[name]) {
                this.state[name] = {};
            }
            return this.state[name];
        }
    }


    dispatch(itemName, name = "") {
        if (this.parentStore) {
            this.parentStore.dispatch(itemName, this.name +(name==""?"":("." + name)));
        } else {
            for (const element of this.listeners[name]) {
                let model = element.constructor.model;
                if (model && model.mapping) {
                    Object.getOwnPropertyNames(model.mapping).forEach(key => {
                        let value = model.mapping[key];
                        if (itemName==null || value == itemName) {
                            //TODO use evaluateOnContext
                            //TODO : should implement engine like jsonata 
                            if (name == this.name) {
                                element[key] = this.state[value];
                            } else {
                                element[key] = this.state[name][value];
                            }
                        }
                    })
                }
            }
            //TODO mode that in mutation methods
            this.storeState();
        }
    }

    filterOutSubstores(state, substoreNames) {
        return substoreNames.reduce(
          (result, key) =>
          state[key] !== undefined
              ? Object.assign(result, { [key]: state[key] })
              : result,
          {}
        );
      }
    
    /** State storage function */
    storeState() {
        if (this.parentStore) {
            this.parentStore.storeState();
        } else {
            if (this.storage == "localStorage") {
                //TODO filter out subStores
                localStorage.setItem(this.name, JSON.stringify(this.state));
                //TODO then trigger storage of all substores
            }
        }
    }

    /**TODO implement storage of sub stores independantly */
    loadState() {
        if (this.parentStore) {
            this.parentStore.loadState();
        } else {
            if (this.storage == "localStorage") {
                let loadedState = JSON.parse(localStorage.getItem(this.name));
                if (loadedState != null) {
                    this.state = {...this.state,...loadedState};
                } 
            }
        }
    }

    /** State mutation functions */

    updateValue(itemName, newValue, dispatch = true) {
        this.state[itemName] = newValue;
        if (dispatch) {
            this.dispatch(itemName);
        }
    }

    //functions used to mutate an array in the local store
    addItem(itemName, item, dispatch = true) {
        this.removeItem(itemName, item, false);
        this.state[itemName] = [
            ...this.state[itemName],
            item
        ];
        if (dispatch) {
            this.dispatch(itemName);
        }
    }

    removeItem(itemName, item, dispatch = true) {
        //FIXME we should get the filter from the model
        this.state[itemName] = this.state[itemName].filter(t => t.value != item.value);
        if (dispatch) {
            this.dispatch(itemName);
        }
    }

    updateItem(itemName, item, dispatch = true) {
        //FIXME we should get the filter from the model
        this.state[itemName] = this.state[itemName].map(t => {
            if (t.value == item.value) {
                t = { ...t, ...item };
            };
            return t
        });
        if (dispatch) {
            this.dispatch(itemName);
        }
    }
}