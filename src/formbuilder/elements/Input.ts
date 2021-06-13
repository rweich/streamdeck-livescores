import AbstractElement from './AbstractElement';
import { is } from 'ts-type-guards';

export default class Input extends AbstractElement {
  private input: HTMLInputElement | undefined;

  protected getInput(): HTMLElement {
    if (!this.input) {
      this.input = document.createElement('input');
      this.input.classList.add('sdpi-item-value');
      this.input.addEventListener('input', (error) => this.onInput(error));
    }
    if (this.placeholder !== '') {
      this.input.placeholder = this.placeholder;
    }
    return this.input;
  }

  private onInput(event: Event): void {
    if (is(HTMLInputElement)(event.target)) {
      this.changeValue(event.target.value);
    }
  }
}
