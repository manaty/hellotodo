import { LitElement, html ,css} from '../web_modules/lit-element.js';
import  "./TodoItem.js";
import  "./TodoCreator.js";

class TodoApp extends LitElement {
    static get properties() {
        return {
          todoItems: { type: Array }
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
    }

    addTodo(todoItem){
      this.todoItems = [
        ...this.removeTodoNoUpdate(todoItem),
        todoItem
      ];
    }

    removeTodoNoUpdate(todoItem){
      return this.todoItems.filter(t => t.value!=todoItem.value);
    }

    removeTodo(todoItem){
      this.todoItems=this.removeTodoNoUpdate(todoItem);
    }

    completeTodo(todoItem){
      this.todoItems=this.todoItems.map(t => { 
        if (t.value==todoItem.value) {
          t.completed=true
        }; 
        return t 
      });
    }

    todoCreationHandler(e){
      this.addTodo(e.detail);
    }

    todoDeletionHandler(e){
      this.removeTodo(e.detail);
    }

    todoCompletionHandler(e){
      this.completeTodo(e.detail);
    }

    render(){
      return html`
      <div class="title">Hello Todo</div>
      <div class="todo-items">
        ${this.todoItems.map(i => html`<todo-item @todo-delete="${this.todoDeletionHandler}" @todo-complete="${this.todoCompletionHandler}" .value="${i.value}" .completed=${i.completed}></todo-item>`)}
      </div>
      <todo-creator @todo-add="${this.todoCreationHandler}"></todo-creator>`;
  }
}

window.customElements.define("todo-app",TodoApp);
