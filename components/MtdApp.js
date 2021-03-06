import { MvElement } from "../web_modules/mv-element.js";
import { html ,css} from '../web_modules/lit-element.js';
import  "./MtdCounter.js";
import  "./TodoList.js";


class MtdApp extends MvElement {
    
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
        --backgroundColor:cyan;
      }

      `;
    } 

    firstUpdated(changedProperties){
      let counterElmt = this.shadowRoot.querySelector("mtd-counter");
      this.store.registerElementListener(counterElmt,[{property:"counter",jsonataExpression:"$count(todo1.items)+$count(todo2.items)+$count(todo3.items)"}]);
      this.store.dispatch();
    }

    render(){
      return html`
        <mtd-counter name="counter"></mtd-counter>
        <todo-list title="Hello Todo" name="todo1" storage-modes="local"></todo-list>
        <todo-list title="Second Todo" name="todo2" storage-modes="server,local"></todo-list>
      `;
  }
}

window.customElements.define("mtd-app",MtdApp);
