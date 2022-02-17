import { Logger } from 'ts-log';

import FactoryInterface from '../FactoryInterface';
import ScoreGeneratorInterface from '../ScoreGeneratorInterface';
import SettingsFormInterface from '../SettingsFormInterface';
import Api from './Api';
import ScoreGenerator from './ScoreGenerator';
import SettingsForm from './SettingsForm';

export default class Factory implements FactoryInterface {
  public readonly apiKey = 'openligadb';
  public readonly apiName = 'OpenligaDB';
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public scoreGenerator(): ScoreGeneratorInterface {
    return new ScoreGenerator(new Api(this.logger), this.logger);
  }

  public settingsForm(settings: unknown): SettingsFormInterface {
    return new SettingsForm(settings);
  }
}
