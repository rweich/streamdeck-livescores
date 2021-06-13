import Api from './Api';
import FactoryInterface from '../FactoryInterface';
import { Logger } from 'ts-log';
import ScoreGenerator from './ScoreGenerator';
import ScoreGeneratorInterface from '../ScoreGeneratorInterface';
import SettingsForm from './SettingsForm';
import SettingsFormInterface from '../SettingsFormInterface';

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
