import { MvElement } from "../web_modules/mv-element.js";
import {  html, css } from '../web_modules/lit-element.js';

class MtdCounter extends MvElement {

    static get properties() { return {
      name: { attribute: true },
      counter1: { attribute: false },
      counter2: { attribute: false }
      };
    }

    static get model(){
      return { 
          mapping:{
            counter1:"items"
          }
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

    firstUpdated(changedProperties) {
      console.log("firstUpdated "+JSON.stringify(changedProperties));
      //FIXME register a function rather than an element.
      this.parentStore.registerElementListener(this,"todo1");
      this.parentStore.registerElementListener(this,"todo2");
    }

    render(){
        return html`
        <div class="value">Nb todos :${this.counter1+this.counter2}</div>
        `;
    }
}

window.customElements.define("mtd-counter",MtdCounter);