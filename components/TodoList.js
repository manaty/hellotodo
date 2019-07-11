import { MvElement } from "../web_modules/mv-element.js";
import { html ,css} from '../web_modules/lit-element.js';
import  "./TodoItem.js";
import  "./TodoCreator.js";

class TodoList extends MvElement {
    static get properties() {
        return {
          name: { attribute: true },
          title: { type : String },
          todoItems: { type: Array },
          count:{ attribute: false},
          storage: { type : String, attribute:true}
        };
    }

    static get model(){
      return { 
          modelClass:"TodoList",
          storage:"localStorage",
          mappings:[
            {property:"title",value:"title"},
            {property:"todoItems",value:"items"},
            {property:"count",jsonataExpression:"$count(items)"},
          ]
        };
    }
    
    static get styles() {
      return css`
      :host {
        display: block;
        text-align:center;
        background-color:var(--backgroundColor,deeppink);
        max-width:300px;
      }
      .title {
        font-size:2em;
      }
      `;
    } 
  
    constructor(){
        super();
        this.todoItems = [];
        this.count=0;
    }

    todoCreationHandler(e){
      this.store.addItem("items",e.detail);
    }

    todoDeletionHandler(e){
      this.store.removeItem("items",e.detail);
    }

    todoCompletionHandler(e){
      this.store.updateItem("items",{...e.detail,completed:true});
    }

    render(){
      return html`
      <div class="title">${this.title} (${this.count})</div>
      <div class="todo-items">
        ${this.todoItems.map(i => html`<todo-item @todo-delete="${this.todoDeletionHandler}" @todo-complete="${this.todoCompletionHandler}" .value="${i.value}" .completed=${i.completed}></todo-item>`)}
      </div>
      <todo-creator @todo-add="${this.todoCreationHandler}"></todo-creator>`;
  }
}

window.customElements.define("todo-list",TodoList);
