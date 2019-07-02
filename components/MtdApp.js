import { MvElement } from "../web_modules/mv-element.js";
import { html ,css} from '../web_modules/lit-element.js';
import  "./MtdCounter.js";
import  "./TodoList.js";


class MtdApp extends MvElement {

    static get properties(){return {
      name: { attribute: true }
    };}

    static get model(){
      return { 
          storage:"localStorage"
        };
    }
    
    static get styles() {
      return css`
      :host {
        display: block;
        text-align:center;
        background-color:var(--backgroundColor,deeppink);
        max-width:300px;
        display:flex;
        flex-direction:column;
      }

      todo-list {
        --backgroundColor:yellow;
      }

      todo-list[name='todo2']{
        --backgroundColor:green;
      }
      `;
    } 
  
    constructor(){
        super();
    }

    render(){
      return html`
        <mtd-counter name="counter"></mtd-counter>
        <todo-list title="Hello Todo" name="todo1"></todo-list>
        <todo-list title="Second Todo" name="todo2"></todo-list>
      `;
  }
}

window.customElements.define("mtd-app",MtdApp);
