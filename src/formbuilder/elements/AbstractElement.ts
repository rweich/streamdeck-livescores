import ElementInterface from '../ElementInterface';
import EventEmitter from 'eventemitter3';
import { EventsEnum } from '../EventsEnum';
import { ValueType } from './ValueType';
import { is } from 'ts-type-guards';

export default abstract class AbstractElement implements ElementInterface {
  protected placeholder = '';
  private readonly htmlContainer: HTMLElement;
  private label = '';
  private eventEmitter = new EventEmitter();
  private elementValue: ValueType = '';

  constructor() {
    this.htmlContainer = document.createElement('div');
  }

  get value(): ValueType {
    return this.elementValue;
  }

  protected abstract getInput(): HTMLElement;

  public getHtmlElement(): HTMLElement {
    this.htmlContainer.classList.add('sdpi-item');
    const label = this.createLabel();
    if (label) {
      this.htmlContainer.append(label);
    }

    this.htmlContainer.append(this.getInput());
    return this.htmlContainer;
  }

  public setValue(value: ValueType): void {
    this.elementValue = value;
    const input = this.getInput();
    if (typeof value === 'string' && (is(HTMLInputElement)(input) || is(HTMLSelectElement)(input))) {
      input.value = value;
    }
  }

  public setLabel(label: string): this {
    this.label = label;
    return this;
  }

  // TODO: move into Input? not all elements can use this
  public setPlaceholder(placeholder: string): this {
    this.placeholder = placeholder;
    return this;
  }

  public showOn(callback: () => boolean): this {
    const setDisplay = () => (this.htmlContainer.style.display = callback() ? 'flex' : 'none');
    this.eventEmitter.on(EventsEnum.CHANGE_SETTINGS, setDisplay);
    setDisplay();
    return this;
  }

  public on(eventname: EventsEnum, callback: () => void): void {
    this.eventEmitter.on(eventname, callback);
  }

  public reportSettingsChange(): void {
    this.eventEmitter.emit(EventsEnum.CHANGE_SETTINGS);
  }

  protected createLabel(): HTMLElement | undefined {
    if (!this.label) {
      return;
    }
    const label = document.createElement('div');
    label.classList.add('sdpi-item-label');
    label.textContent = this.label;
    return label;
  }

  protected changeValue(value: string): void {
    this.setValue(value);
    this.eventEmitter.emit(EventsEnum.CHANGE_VALUE);
  }
}
