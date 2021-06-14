import { PluginSettingsType } from '../SettingsType';
import ScoreGeneratorInterface from '../api/ScoreGeneratorInterface';

export default class ContextData {
  public readonly context: string;
  public readonly scoreGenerator: ScoreGeneratorInterface;
  public readonly settings: PluginSettingsType;
  private displayState: 'icon' | 'shortname' = 'icon';
  private interval?: NodeJS.Timeout;

  constructor(context: string, scoreGenerator: ScoreGeneratorInterface, settings: PluginSettingsType) {
    this.context = context;
    this.scoreGenerator = scoreGenerator;
    this.settings = settings;
  }

  public setInterval(callback: () => void, ms: number): void {
    this.interval = setInterval(callback, ms);
  }

  public clearInterval(): void {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);
    delete this.interval;
  }

  public toggleDisplayState(): void {
    this.displayState = this.displayState === 'icon' ? 'shortname' : 'icon';
  }

  public shouldShowIcon(): boolean {
    return this.displayState === 'icon';
  }

  public shouldShowShortName(): boolean {
    return this.displayState === 'shortname';
  }
}
