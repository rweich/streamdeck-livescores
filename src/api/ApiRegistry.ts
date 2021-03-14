import FactoryInterface from './FactoryInterface';
import FactoryNotFoundError from './FactoryNotFoundError';

export default class ApiRegistry {
  private apis: Map<string, FactoryInterface> = new Map();

  public registerFactory(factory: FactoryInterface): void {
    this.apis.set(factory.apiKey, factory);
  }

  public getFactory(name: string): FactoryInterface {
    const api = this.apis.get(name);
    if (!api) {
      throw new FactoryNotFoundError('could not find factory with name ' + name);
    }
    return api;
  }

  public getFactories(): FactoryInterface[] {
    return Array.from(this.apis.values());
  }
}
