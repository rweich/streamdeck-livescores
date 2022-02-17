import { Streamdeck } from '@rweich/streamdeck-ts';

import ApiFactory from './api/ApiFactory';
import assertType from './AssertType';
import logger from './Logger';
import PiHandler from './PiHandler';
import { PluginSettingsSchema, PluginSettingsType } from './SettingsType';

const pi = new Streamdeck(logger.getLogger('streamdeck')).propertyinspector();

pi.on('websocketOpen', (event) => pi.getSettings(event.uuid));
pi.on('didReceiveSettings', (event) => {
  let settings: PluginSettingsType;
  try {
    assertType(PluginSettingsSchema, event.settings);
    logger.debug('received valid settings', event.settings);
    settings = event.settings;
  } catch (error) {
    logger.error('received invalid settings', error);
    settings = { apiKey: 'openligadb' };
  }
  const piHandler = new PiHandler(pi, settings, new ApiFactory(logger).registry(), logger);
  piHandler.appendForm(document.querySelector('.sdpi-wrapper') ?? document.body);
});

export default pi;
