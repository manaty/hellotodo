import { LitElement} from './lit-element.js';
import { MvStore } from './mv-store.js';
export * from './lit-element.js';

export class MvElement extends LitElement {

    constructor(){
        super();
    }

    getParentStore(element){
        if(element == undefined){
            return null;
        }
        if(element instanceof DocumentFragment){
            element=element.host;
        }
        if(element instanceof Element){
            if(element instanceof MvElement){
                return element.store;
            } else {
                return this.getParentStore(element.parentNode);
            }
        } else {
            return null;
        }
    }


    connectedCallback() {
        //TODO set parent store to its first parent MvElement's store.
        let parentStore=this.getParentStore(this.parentNode);
        //initialise store from model
        this.store = new MvStore(this.attributes['name'].value,this,parentStore); 
        super.connectedCallback();
    }
    
    attributeChangedCallback(name, oldval, newval) {
        console.log('attribute change: ', name, newval);
        super.attributeChangedCallback(name, oldval, newval);
        //FIXME we cannot use the store before the element has been connected
        //this.store.updateValue(name, newval,true);
    }
}