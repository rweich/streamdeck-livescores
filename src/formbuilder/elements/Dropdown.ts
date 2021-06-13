import AbstractElement from './AbstractElement';
import { is } from 'ts-type-guards';

export default class Dropdown extends AbstractElement {
  private options: Record<'label' | 'value', string>[] = [];
  private select: HTMLSelectElement | undefined;

  public addOption(label: string, value: string): this {
    this.options.push({ label, value });
    return this;
  }

  protected getInput(): HTMLElement {
    if (this.select) {
      return this.select;
    }
    this.select = document.createElement('select');
    this.select.classList.add('sdpi-item-value', 'select');
    const optionElements = this.options.map((opt) => {
      const option: HTMLOptionElement = document.createElement('option');
      option.value = opt.value;
      option.text = opt.label;
      return option;
    });
    for (const optionElement of optionElements) {
      this.select?.append(optionElement);
    }
    this.select.addEventListener('change', (error) => this.onChange(error));
    return this.select;
  }

  private onChange(event: Event): void {
    if (is(HTMLSelectElement)(event.target)) {
      this.changeValue(event.target.value);
    }
  }
}
