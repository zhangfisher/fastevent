import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("fastevent-listener-viewer")
export class FasteventListenerViewer extends LitElement {
    /**
     * The number of times the button has been clicked.
     */
    @property({ type: Number })
    count = 0;

    render() {
        return html``;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-listener-viewer": FasteventListenerViewer;
    }
}
