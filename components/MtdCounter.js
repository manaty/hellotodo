import { LitElement, html, css } from '../web_modules/lit-element.js';

class MtdCounter extends LitElement {

    static get properties() { return {
      name: { attribute: true },
      counter: { attribute: false }
      };
    }

    static get styles() {
      return css`
      :host {
        background-color:var(--backgroundColor, cyan);
        padding:3px;
      }
      .value {
        text-align:left;
      }
      `;
    } 

    constructor(){
      super();
      this.counter=0;
    }

    render(){
        return html`
        <div class="value">Nb todos :${this.counter}</div>
        `;
    }
}

window.customElements.define("mtd-counter",MtdCounter);