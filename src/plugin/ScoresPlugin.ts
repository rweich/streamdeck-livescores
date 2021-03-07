import {
  assertType,
  DidReceiveSettingsEvent,
  GetSettingsEvent,
  IncomingEvents,
  IncomingPluginEvents,
} from '@rweich/streamdeck-ts';
import Plugin from '@rweich/streamdeck-ts/dist/Plugin';
import { Logger } from 'ts-log';
import ApiRegistry from '../api/ApiRegistry';
import ScoreInterface from '../api/ScoreInterface';
import { PluginSettingsSchema } from '../SettingsType';
import ContextData from './ContextData';
import Display from './Display';

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
    this.plugin.on(IncomingPluginEvents.WillAppear, (event) => {
      this.plugin.sendEvent(new GetSettingsEvent(event.context));
    });
    this.plugin.on(IncomingEvents.DidReceiveSettings, (event) => this.onDidReceiveSettings(event));
  }

  private onDidReceiveSettings(event: DidReceiveSettingsEvent): void {
    this.logger.debug('got settings', event.settings);
    this.contextData.get(event.context)?.clearInterval();
    try {
      assertType(PluginSettingsSchema, event.settings);
    } catch (e) {
      this.logger.error('received invalid settings', event.settings);
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
        this.logger.info('match has not yet started - setting timeout at ', matchData.updateAt.toLocaleString());
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
    contextData.scoreGenerator.generateScore(contextData.settings.payload).then((matchData) => {
      if (matchData === null) {
        return;
      }
      this.display.displayMatch(matchData, contextData.context);
      if (onSuccess) {
        onSuccess(matchData);
      }
    });
  }
}
