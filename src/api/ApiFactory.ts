import { RootLogger } from 'loglevel';
import ApiRegistry from './ApiRegistry';
import Factory from './openligadb/Factory';

export default class ApiFactory {
  private readonly logger: RootLogger;

  constructor(logger: RootLogger) {
    this.logger = logger;
  }

  public registry(): ApiRegistry {
    const registry = new ApiRegistry();
    registry.registerFactory(new Factory(this.logger.getLogger('openligadb')));
    return registry;
  }
}
