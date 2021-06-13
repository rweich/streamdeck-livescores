import HtmlElementInterface from './HtmlElementInterface';
import { ValueType } from './elements/ValueType';

export default interface ElementInterface extends HtmlElementInterface {
  value: ValueType;
}
