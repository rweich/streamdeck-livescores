import { expect } from 'chai';
import { JSDOM, VirtualConsole } from 'jsdom';
import 'mocha';
import sinon, { SinonSandbox } from 'sinon';
import ImageLoader from '../src/ImageLoader';

const virtualConsole = new VirtualConsole();
const window = new JSDOM('<!doctype html>', {
  resources: 'usable',
  url: 'file://' + process.cwd() + '/',
  virtualConsole,
}).window;
global.Image = window.Image;

describe('Test ImageLoader', () => {
  describe('loadImage', () => {
    let sandbox!: SinonSandbox;
    beforeEach(function () {
      sandbox = sinon.createSandbox();
    });
    afterEach(function () {
      sandbox.restore();
    });

    it('should fetch and return an image', (done) => {
      const loader = new ImageLoader();
      const spy = sandbox.spy(global, 'Image');
      loader.loadImage('assets/images/action1.icon@2x.png').then((image) => {
        expect(image?.complete).to.be.true;
        expect(spy.callCount).to.equal(1);
        done();
      });
    });
    it('should fetch and return multiple images', (done) => {
      const loader = new ImageLoader();
      const spy = sandbox.spy(global, 'Image');
      Promise.all([
        loader.loadImage('assets/images/action1.icon.png'),
        loader.loadImage('assets/images/action1.icon@2x.png'),
      ]).then((images) => {
        expect(images.length).to.equal(2);
        images.map((image) => expect(image?.complete).to.be.true);
        expect(spy.callCount).to.equal(2);
        done();
      });
    });
    it('should cache images that it has fetched before', (done) => {
      const loader = new ImageLoader();
      const spy = sandbox.spy(global, 'Image');
      Promise.all([
        loader.loadImage('assets/images/action1.icon.png'),
        loader.loadImage('assets/images/action1.icon@2x.png'),
      ])
        .then((images) => {
          expect(images.length).to.equal(2);
          sandbox.resetHistory();
          return Promise.all([
            loader.loadImage('assets/images/action1.icon.png'),
            loader.loadImage('assets/images/pluginIcon.png'),
            loader.loadImage('assets/images/action1.icon@2x.png'),
          ]);
        })
        .then((images) => {
          expect(images.length).to.equal(3);
          images.map((image) => expect(image?.complete).to.be.true);
          expect(spy.callCount).to.equal(1);
          done();
        })
        .catch((e) => done(e));
    });
    it('should return null if the image could not be found', (done) => {
      const loader = new ImageLoader();
      loader.loadImage('assets/images/notfound.png').then((image) => {
        expect(image).to.be.null;
        done();
      });
    });
  });
});
