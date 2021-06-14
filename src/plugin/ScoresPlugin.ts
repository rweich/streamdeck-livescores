import ApiRegistry from '../api/ApiRegistry';
import ContextData from './ContextData';
import { DidReceiveSettingsEvent } from '@rweich/streamdeck-events/dist/Events/Received';
import Display from './Display';
import { KeyDownEvent } from '@rweich/streamdeck-events/dist/Events/Received/Plugin';
import { Logger } from 'ts-log';
import { Plugin } from '@rweich/streamdeck-ts';
import { PluginSettingsSchema } from '../SettingsType';
import ScoreInterface from '../api/ScoreInterface';
import assertType from '../AssertType';

export default class ScoresPlugin {
  private plugin: Plugin;
  private apiRegistry: ApiRegistry;
  private display: Display;
  private logger: Logger;
  private contextData: Map<string, ContextData> = new Map();

  constructor(plugin: Plugin, apiRegistry: ApiRegistry, display: Display, logger: Logger) {
    this.plugin = plugin;
    this.apiRegistry = apiRegistry;
    this.display = display;
    this.logger = logger;
  }

  public init(): void {
    this.plugin.on('willAppear', (event) => {
      this.plugin.getSettings(event.context);
    });
    this.plugin.on('didReceiveSettings', (event) => this.onDidReceiveSettings(event));
    this.plugin.on('keyDown', (event) => this.onKeyDown(event));
  }

  private onKeyDown(event: KeyDownEvent): void {
    this.logger.debug('got keydown event', event.context, event.row, event.column);
    const contextData = this.contextData.get(event.context);
    if (contextData !== undefined) {
      contextData.toggleDisplayState();
      this.updateMatchData(contextData);
    }
  }

  private onDidReceiveSettings(event: DidReceiveSettingsEvent): void {
    this.logger.debug('got settings', event.settings);
    this.contextData.get(event.context)?.clearInterval();
    try {
      assertType(PluginSettingsSchema, event.settings);
    } catch (error) {
      this.logger.error(error);
      return;
    }
    const data = new ContextData(
      event.context,
      this.apiRegistry.getFactory(event.settings.apiKey).scoreGenerator(),
      event.settings,
    );
    this.contextData.set(event.context, data);
    this.initContextUpdater(data);
  }

  private initContextUpdater(contextData: ContextData): void {
    this.logger.debug('initializing updater ...');
    this.updateMatchData(contextData, (matchData) => {
      if (matchData.matchIs.running && matchData.updateIntervalSeconds) {
        this.logger.info(`match is running - creating interval with ${matchData.updateIntervalSeconds} seconds`);
        contextData.setInterval(
          () => this.updateMatchDataInterval(contextData),
          1000 * matchData.updateIntervalSeconds,
        );
      } else if (matchData.updateAt) {
        const timeoutMs: number = matchData.updateAt.getTime() - Date.now();
        this.logger.info('received time for next update - setting timeout at ', matchData.updateAt.toLocaleString());
        setTimeout(() => this.initContextUpdater(contextData), timeoutMs);
      }
    });
  }

  private updateMatchDataInterval(contextData: ContextData): void {
    this.updateMatchData(contextData, (matchData) => {
      if (matchData.matchIs.finished) {
        this.logger.debug('removing interval');
        contextData.clearInterval();
      }
    });
  }

  private updateMatchData(contextData: ContextData, onSuccess?: (result: ScoreInterface) => void): void {
    this.logger.debug('updating match data ...');
    contextData.scoreGenerator
      .generateScore(contextData.settings.payload)
      .then((matchData) => {
        if (matchData === undefined) {
          return;
        }
        this.display.displayMatch(matchData, contextData);
        if (onSuccess) {
          onSuccess(matchData);
        }
        return matchData;
      })
      .catch((error) => this.logger.error(error));
  }
}
