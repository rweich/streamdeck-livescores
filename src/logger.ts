import { default as logger } from 'loglevel';
import { apply, reg } from 'loglevel-plugin-prefix';

reg(logger);
apply(logger, { template: '[%t] %l (%n):' });
logger.enableAll();

export default logger;
