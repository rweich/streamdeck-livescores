import EventEmitter from 'eventemitter3';
import ElementGroupInterface from './ElementGroupInterface';
import ElementInterface from './ElementInterface';
import AbstractElement from './elements/AbstractElement';
import Dropdown from './elements/Dropdown';
import Input from './elements/Input';
import { EventsEnum } from './EventsEnum';
import { FormDataType } from './FormDataType';
import HTMLElementInterface from './HTMLElementInterface';

export default class FormBuilder<T extends FormDataType> {
  private readonly formData: T;
  private elements: { [P in keyof T]?: ElementInterface | ElementGroupInterface } = {};
  private eventEmitter = new EventEmitter();

  constructor(initialData: T) {
    this.formData = initialData;
  }

  public getFormData(): T {
    const data = this.formData;
    for (const i in this.elements) {
      const element = this.elements[i];
      if (this.elementNotUndefined(element)) {
        data[i] = element.value as T[typeof i];
      }
    }
    return data;
  }

  public appendTo(element: HTMLElement): void {
    Object.values(this.elements)
      .filter(<T extends HTMLElementInterface>(el: T | undefined): el is T => el !== undefined)
      .forEach((el) => element.append(el.getHtmlElement()));
  }

  public addElement<K extends keyof T>(
    name: K,
    val: T[K] extends Record<string, string>
      ? ElementGroupInterface & { elements: { [x in keyof T[K]]: ElementInterface } }
      : ElementInterface,
  ): void {
    this.elements[name] = val;
    val.setValue(this.formData[name]);
  }

  public createInput(): Input {
    return this.addEventsToElement(new Input());
  }

  public createDropdown(): Dropdown {
    return this.addEventsToElement(new Dropdown());
  }

  public on(eventname: EventsEnum.CHANGE_SETTINGS, callback: () => void): void {
    this.eventEmitter.on(eventname, callback);
  }

  private addEventsToElement<T extends AbstractElement>(element: T): T {
    element.on(EventsEnum.CHANGE_VALUE, () => this.onChangeElementValue());
    this.eventEmitter.on(EventsEnum.CHANGE_SETTINGS, () => element.reportSettingsChange());
    return element;
  }

  private onChangeElementValue(): void {
    this.eventEmitter.emit(EventsEnum.CHANGE_SETTINGS);
  }

  private elementNotUndefined(
    el: ElementInterface | ElementGroupInterface | undefined,
  ): el is ElementInterface | ElementGroupInterface {
    return el !== undefined && el.value !== undefined;
  }
}
