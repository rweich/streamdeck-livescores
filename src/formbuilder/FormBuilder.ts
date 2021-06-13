import AbstractElement from './elements/AbstractElement';
import Dropdown from './elements/Dropdown';
import ElementGroupInterface from './ElementGroupInterface';
import ElementInterface from './ElementInterface';
import EventEmitter from 'eventemitter3';
import { EventsEnum } from './EventsEnum';
import { FormDataType } from './FormDataType';
import HtmlElementInterface from './HtmlElementInterface';
import Input from './elements/Input';

export default class FormBuilder<T extends FormDataType> {
  private readonly formData: T;
  private elements: { [P in keyof T]?: ElementInterface | ElementGroupInterface } = {};
  private eventEmitter = new EventEmitter();

  constructor(initialData: T) {
    this.formData = initialData;
  }

  public getFormData(): T {
    const data = this.formData;
    for (const index in this.elements) {
      const element = this.elements[index];
      if (this.elementNotUndefined(element)) {
        data[index] = element.value as T[typeof index];
      }
    }
    return data;
  }

  public appendTo(element: HTMLElement): void {
    const formElements = Object.values(this.elements).filter(
      <T extends HtmlElementInterface>(formElement: T | undefined): formElement is T => formElement !== undefined,
    );
    for (const formElement of formElements) {
      element.append(formElement.getHtmlElement());
    }
  }

  public addElement<K extends keyof T>(
    name: K,
    value: T[K] extends Record<string, string>
      ? ElementGroupInterface & { elements: { [x in keyof T[K]]: ElementInterface } }
      : ElementInterface,
  ): void {
    this.elements[name] = value;
    value.setValue(this.formData[name]);
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
    element: ElementInterface | ElementGroupInterface | undefined,
  ): element is ElementInterface | ElementGroupInterface {
    return element !== undefined && element.value !== undefined;
  }
}
