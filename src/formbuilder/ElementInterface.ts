import { ValueType } from './elements/ValueType';
import HTMLElementInterface from './HTMLElementInterface';

export default interface ElementInterface extends HTMLElementInterface {
  value: ValueType;
}
