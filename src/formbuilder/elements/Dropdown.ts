import { is } from 'ts-type-guards';
import AbstractElement from './AbstractElement';

export default class Dropdown extends AbstractElement {
  private options: Record<'label' | 'value', string>[] = [];
  private select: HTMLSelectElement | null = null;

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
    this.options
      .map((opt) => {
        const option: HTMLOptionElement = document.createElement('option');
        option.value = opt.value;
        option.text = opt.label;
        return option;
      })
      .forEach((opt) => this.select?.append(opt));
    this.select.addEventListener('change', (e) => this.onChange(e));
    return this.select;
  }

  private onChange(event: Event): void {
    if (is(HTMLSelectElement)(event.target)) {
      this.changeValue(event.target.value);
    }
  }
}
