import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import 'mocha';
import { is } from 'ts-type-guards';
import Dropdown from '../../src/formbuilder/elements/Dropdown';
import Input from '../../src/formbuilder/elements/Input';
import { EventsEnum } from '../../src/formbuilder/EventsEnum';
import FormBuilder from '../../src/formbuilder/FormBuilder';

describe('FormBuilder', () => {
  describe('getFormData', () => {
    it('should return the initial data if no elements were attached', () => {
      const builder = new FormBuilder({ a: '1', b: '2' });
      const data = builder.getFormData();
      expect(data.a).to.equal('1');
      expect(data.b).to.equal('2');
      expect(Object.values(data)).to.be.lengthOf(2);
    });
    it('should return the initial data if elements were attached', () => {
      const builder = new FormBuilder({ a: '1', b: '2' });
      builder.addElement('a', builder.createInput());
      builder.addElement('b', builder.createInput());
      const data = builder.getFormData();
      expect(data.a).to.equal('1');
      expect(data.b).to.equal('2');
      expect(Object.values(data)).to.be.lengthOf(2);
    });
    it('should return the changed data after inputs were changed', () => {
      const builder = new FormBuilder({ a: '1', b: '2' });
      builder.addElement('a', builder.createInput());
      builder.addElement('b', builder.createInput());
      const dom = new JSDOM();
      builder.appendTo(dom.window.document.body);
      const inputs: HTMLInputElement[] = Array.from(dom.window.document.querySelectorAll('input'));
      inputs[0].value = 'foo';
      inputs[0].dispatchEvent(new Event('input'));
      inputs[1].value = 'bar';
      inputs[1].dispatchEvent(new Event('input'));
      const data = builder.getFormData();
      expect(data.a).to.equal('foo');
      expect(data.b).to.equal('bar');
      expect(Object.values(data)).to.be.lengthOf(2);
    });
  });
  describe('appendTo', () => {
    it('should append the right input-elements to the passed html-element', () => {
      const builder = new FormBuilder({ a: '1', b: '2' });
      builder.addElement('a', builder.createInput());
      builder.addElement('b', builder.createInput());
      const dom = new JSDOM();
      builder.appendTo(dom.window.document.body);
      const inputs: HTMLInputElement[] = Array.from(dom.window.document.querySelectorAll('input'));
      expect(inputs).to.be.lengthOf(2);
      expect(inputs[0].value).to.equal('1');
      expect(inputs[1].value).to.equal('2');
    });
  });
  describe('on', () => {
    it('should emit the change-settings event if one value changed', (done) => {
      const builder = new FormBuilder({ a: '1', b: '2' });
      builder.addElement('a', builder.createInput());
      builder.addElement('b', builder.createInput());
      const dom = new JSDOM();
      builder.appendTo(dom.window.document.body);
      builder.on(EventsEnum.CHANGE_SETTINGS, () => {
        done();
      });
      const inputs: HTMLInputElement[] = Array.from(dom.window.document.querySelectorAll('input'));
      inputs[0].dispatchEvent(new Event('input'));
    });
  });
  describe('createInput', () => {
    it('should return an input element', () => {
      const builder = new FormBuilder({ a: '1' });
      expect(is(Input)(builder.createInput())).to.be.true;
    });
  });
  describe('createDropdown', () => {
    it('should return an dropdown element', () => {
      const builder = new FormBuilder({ a: '1' });
      expect(is(Dropdown)(builder.createDropdown())).to.be.true;
    });
  });
});
