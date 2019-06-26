import { LitElement, html, css } from '../web_modules/lit-element.js';

class TodoItem extends LitElement {
    static get properties() {
        return {
            value: {type: String, reflect:true },
            completed : {type:Boolean, reflect:true }
        };
    }
    
    static get styles() {
      return css`
      :host {
        display:flex;
        background-color:var(--backgroundColor, aliceblue);
        padding:3px;
      }
      .value {
        flex-grow:1;
        text-align:left;
      }
      .completed{
        text-decoration: line-through;
      }
      `;
    } 

    completeHandler(){
      let event = new CustomEvent('todo-complete', {
        detail: {
          value:  this.value,
          completed : this.completed
        },
        bubbles: true, 
        composed: true
      });
      this.dispatchEvent(event);
    }

    deleteHandler(){
      let event = new CustomEvent('todo-delete', {
        detail: {
          value:  this.value,
          completed : this.completed
        },
        bubbles: true, 
        composed: true
      });
      this.dispatchEvent(event);
    }

    render(){
        return html`
        <div class="value ${this.completed?'completed':''}">${this.value}</div>
        <div class="action">
          ${this.completed?html``:html`<button @click="${this.completeHandler}">Done</button>`}
          <button @click="${this.deleteHandler}">Del</button>
        </div>`;
    }
}

window.customElements.define("todo-item",TodoItem);