import '../web_modules/jsonata.js';

const fetchModelSchema = async (className) => (await fetch('/model/' + className + '.json')).json()

String.prototype.evaluateOnContext = function (params) {
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
        if (Object.entries(this.state).length === 0) {
            this.initLocalState(element, element.constructor.model);
        }
        this.dispatch(null);
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


    extractNamesFromAst(ast,names,extendsName){
        if(ast.hasOwnProperty("type") && ast.type=="name"){
            if(extendsName){ast.value=this.name+"."+ast.value;};
            if(names.indexOf(ast.value) === -1) { names.push(ast.value);}
        } else {
            Object.keys(ast).forEach( k => {
                if(Array.isArray(ast[k]) && ["arguments","expressions","steps"].includes(k)){
                    for(let a of ast[k]){
                        if(typeof a === "object"){
                            this.extractNamesFromAst(a,names,extendsName);
                        }
                    }
                } else if(typeof ast[k] === "object"){
                    this.extractNamesFromAst(ast[k],names,extendsName);
                }
            });
        }
    }

    extractNamesFromMappings(mappings,names,extendsName) {
        names=[];
        for (const mapping of mappings) {
            if(mapping.value){
                if(extendsName){mapping.value=this.name+"."+mapping.value;};
                if(names.indexOf(mapping.value) === -1) { names.push(mapping.value);};
            } else if(mapping.jsonataExpression){
                if(!mapping.jsonata){
                    mapping.jsonata=jsonata(mapping.jsonataExpression);
                }
                this.extractNamesFromAst(mapping.jsonata.ast(),names,extendsName);
            }
        }
    }

    registerElementListener(element,mappingsProp) {
        let mappings = [];
        if (!mappingsProp) {
            if (!element.constructor.model || !element.constructor.model.mappings) {
                return;
            } else {
                mappings = element.constructor.model.mappings;
            }
        } else {
            mappings = mappingsProp;
        }
        mappings=mappings.map((m) => {
            if(m.jsonataExpression) {
               return { ...m, jsonata: jsonata(m.jsonataExpression) } 
            }
            return m;
           });
        let names=[];
        if (this.parentStore) {
            this.extractNamesFromMappings(mappings,names,true);
            this.parentStore.registerElementListener(element,mappings);
        } else {
            if(names.length==0){
                this.extractNamesFromMappings(mappings,names,false);
            }
            for(let name of names){
                if (!this.listeners[name]) {
                    this.listeners[name] = [];
                }
                this.listeners[name].push({ element, mappings});
            }
        }
    }

    /**
     * Register Substore in this parent store by the substore name 
     * and returns the state assciated to this substore (wich is a substate of the parent state)
     * If a substore with same name exist then it is overriden
     * @param {*} substore 
     */
    registerSubStore(substore) {
        this.subStores[substore.name] = substore;
        return this.getState(substore.name);
    }

    getState(name) {
        if (this.parentStore) {
            return this.parentStore.getState(this.name + (name == "" ? "" : ("." + name)));
        } else {
            if (!this.state[name]) {
                this.state[name] = {};
            }
            return this.state[name];
        }
    }

    dispatch(itemName, name = "") {
        if (this.parentStore) {
            this.parentStore.dispatch(itemName, this.name + (name == "" ? "" : ("." + name)));
        } else {
            if (this.listeners.hasOwnProperty(name)) {
                for (const listener of this.listeners[name]) {
                    let element = listener.element;
                    for (const mapping of listener.mappings) {
                        if (mapping.jsonata) {
                            element[mapping.property] = mapping.jsonata.evaluate(this.state);
                        } else if (mapping.value && (itemName == null || mapping.value.endsWith(itemName))) {
                            const pathItems=mapping.value.split(".");
                            let subState = this.state;
                            for(const pathItem of pathItems){
                                subState=subState[pathItem];
                            }
                            element[mapping.property] = subState;
                        }
                    }
                }
            }
        }
        //TODO move that in mutation methods
        this.storeState();
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
                    this.state = { ...this.state, ...loadedState };
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