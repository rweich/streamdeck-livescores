// TODO: rename?
export default interface HtmlElementInterface {
  getHtmlElement(): HTMLElement;
  setValue(value: string | Record<string, string>): void;
}
