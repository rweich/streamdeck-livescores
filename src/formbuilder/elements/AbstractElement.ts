import EventEmitter from 'eventemitter3';
import { is } from 'ts-type-guards';
import ElementInterface from '../ElementInterface';
import { EventsEnum } from '../EventsEnum';
import { ValueType } from './ValueType';

export default abstract class AbstractElement implements ElementInterface {
  private _value: ValueType = '';
  private label = '';
  private eventEmitter = new EventEmitter();
  private readonly htmlContainer: HTMLElement;
  protected placeholder = '';

  get value(): ValueType {
    return this._value;
  }

  constructor() {
    this.htmlContainer = document.createElement('div');
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
    this._value = value;
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

  protected createLabel(): HTMLElement | null {
    if (!this.label) {
      return null;
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
