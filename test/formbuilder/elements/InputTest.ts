import { expect } from 'chai';
import 'mocha';
import Input from '../../../src/formbuilder/elements/Input';
import { EventsEnum } from '../../../src/formbuilder/EventsEnum';

describe('Input', () => {
  it('should set the placeholder', () => {
    const input = new Input();
    input.setPlaceholder('place');
    expect(input.getHtmlElement().querySelector('input')?.placeholder).to.equal('place');
  });
  it('should set the label', () => {
    const input = new Input();
    input.setLabel('the label');
    expect(
      Array.from(input.getHtmlElement().querySelectorAll('div')).filter((div) => div.textContent === 'the label'),
    ).to.be.lengthOf(1);
  });
  it('should set the value', () => {
    const input = new Input();
    input.setValue('the value');
    expect(input.getHtmlElement().querySelector('input')?.value).to.equal('the value');
  });
  it('should call the showOn callback directly after setting it', (done) => {
    const input = new Input();
    input.showOn(() => {
      done();
      return true;
    });
  });
  it('should call the showOn callback after a settings change got reported', (done) => {
    const input = new Input();
    let callback = () => {
      callback = () => {
        done();
        return true;
      };
      return true;
    };
    input.showOn(() => callback());
    input.reportSettingsChange();
  });
  it('should hide the element if showOn returned false and show it again after it returned true', () => {
    const input = new Input();
    const element: HTMLElement = input.getHtmlElement();
    input.showOn(() => false);
    expect(element.style.display).to.equal('none');
    input.showOn(() => true);
    expect(element.style.display).to.not.equal('none');
  });
  it('should emit the value-change-event after the input value got changed', (done) => {
    const input = new Input();
    input.on(EventsEnum.CHANGE_VALUE, () => done());
    const element = input.getHtmlElement().querySelector('input');
    element?.dispatchEvent(new Event('input'));
  });
});
