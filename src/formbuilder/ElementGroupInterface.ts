import ElementInterface from './ElementInterface';
import HTMLElementInterface from './HTMLElementInterface';

export default interface ElementGroupInterface extends HTMLElementInterface {
  value: Record<string, string>;
  elements: { [x: string]: ElementInterface };
}
