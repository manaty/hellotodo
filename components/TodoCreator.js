import { LitElement, html } from '../web_modules/lit-element.js';

class TodoCreator extends LitElement {
    static get properties() {
        return {
          todo: { type: String }
        };
    }

    constructor(){
        super();
        this.todo='';
    }
    
    fireTodoAdd(){
        let event = new CustomEvent('todo-add', {
            detail: {
                value: this.todo,
                completed:false
            },
            bubbles: true, 
            composed: true
          });
          this.dispatchEvent(event);
      this.todo = '';
    }

    handleInput(e){
        this.todo = e.target.value;
    }

    handleKeyup(e){
      if (e.key === 'Enter') { 
        this.fireTodoAdd();
      }
    }
    
    render(){
      return html`
      <div class="add-todo" @keyup="${this.handleKeyup}">
        <input type="text" id="totoTextInput" .value="${this.todo}" @input="${this.handleInput}"/>
        <button @click=${this.fireTodoAdd}>Add</button>
      </div>`;
  }
}

window.customElements.define("todo-creator",TodoCreator);
