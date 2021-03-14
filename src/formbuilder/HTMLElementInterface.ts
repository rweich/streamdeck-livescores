// TODO: rename?
export default interface HTMLElementInterface {
  getHtmlElement(): HTMLElement;
  setValue(value: string | Record<string, string>): void;
}
