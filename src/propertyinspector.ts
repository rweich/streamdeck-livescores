import { assertType, GetSettingsEvent, IncomingEvents, Streamdeck } from '@rweich/streamdeck-ts';
import ApiFactory from './api/ApiFactory';
import logger from './logger';
import PiHandler from './PiHandler';
import { PluginSettingsSchema, PluginSettingsType } from './SettingsType';

const pi = new Streamdeck(logger.getLogger('streamdeck')).propertyinspector();

pi.on(IncomingEvents.OnWebsocketOpen, (event) => pi.sendEvent(new GetSettingsEvent(event.uuid)));
pi.on(IncomingEvents.DidReceiveSettings, (event) => {
  let settings: PluginSettingsType;
  try {
    assertType(PluginSettingsSchema, event.settings);
    logger.debug('received valid settings', event.settings);
    settings = event.settings;
  } catch (e) {
    logger.error('received invalid settings', event.settings);
    settings = { apiKey: 'openligadb' };
  }
  const piHandler = new PiHandler(pi, settings, new ApiFactory(logger).registry(), logger);
  piHandler.appendForm(document.querySelector('.sdpi-wrapper') ?? document.body);
});

export default pi;
