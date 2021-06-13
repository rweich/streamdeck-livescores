import ElementInterface from './ElementInterface';
import HtmlElementInterface from './HtmlElementInterface';

export default interface ElementGroupInterface extends HtmlElementInterface {
  value: Record<string, string>;
  elements: { [x: string]: ElementInterface };
}
