import ScoreGeneratorInterface from './ScoreGeneratorInterface';
import SettingsFormInterface from './SettingsFormInterface';

export default interface FactoryInterface {
  apiKey: string;
  apiName: string;
  scoreGenerator(): ScoreGeneratorInterface;
  settingsForm(settings: unknown): SettingsFormInterface;
}
