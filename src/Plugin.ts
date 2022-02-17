import { Streamdeck } from '@rweich/streamdeck-ts';

import ApiFactory from './api/ApiFactory';
import logger from './Logger';
import Display from './plugin/Display';
import ImageLoader from './plugin/ImageLoader';
import ScoresPlugin from './plugin/ScoresPlugin';

const plugin = new Streamdeck(logger.getLogger('streamdeck')).plugin();
new ScoresPlugin(
  plugin,
  new ApiFactory(logger).registry(),
  new Display(plugin, new ImageLoader(), logger),
  logger,
).init();

export default plugin;
