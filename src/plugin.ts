import { assertType, GetSettingsEvent, IncomingEvents, IncomingPluginEvents, Streamdeck } from '@rweich/streamdeck-ts';
import Display from './Display';
import ImageLoader from './ImageLoader';
import { MatchIsEnum } from './MatchResult';
import ApiHandler from './openligadb/ApiHandler';
import { SettingsType } from './SettingsType';

const plugin = new Streamdeck().plugin();
const display = new Display(plugin, new ImageLoader(), console);
const handler = new ApiHandler();
const intervalCache: Record<string, NodeJS.Timeout> = {};
const defaultMatchId = '58784';
const matchIds: Record<string, string> = {};

const getMatchId = (context: string): string => {
  return matchIds[context] || defaultMatchId;
};

const updateMatchData = (context: string): void => {
  handler.getMatchData(getMatchId(context)).then((matchData) => {
    if (matchData === null) {
      return;
    }
    display.displayMatch(matchData, context);
  });
};

const getMatchDataInterval = (context: string): void => {
  handler.getMatchData(getMatchId(context)).then((matchData) => {
    if (matchData === null) {
      return;
    }
    display.displayMatch(matchData, context);
    if (matchData.matchIs === MatchIsEnum.Finished) {
      console.debug('removing interval');
      clearInterval(intervalCache[context]);
    }
  });
};

const initButton = (context: string) => {
  handler.getMatchData(getMatchId(context)).then((matchData) => {
    if (matchData === null) {
      return;
    }
    display.displayMatch(matchData, context);
    if (matchData.matchIs === MatchIsEnum.Running) {
      console.info('match is running - creating interval');
      intervalCache[context] = setInterval(() => getMatchDataInterval(context), 1000 * 30);
    } else if (matchData.matchIs === MatchIsEnum.NotStarted) {
      const timeoutMs: number = matchData.startDate.getTime() - Date.now();
      console.info('match has not yet started - setting timeout in ', timeoutMs);
      setTimeout(() => initButton(context), timeoutMs);
    }
  });
};
const resetButton = (context: string) => {
  if (!intervalCache[context]) {
    return;
  }
  clearInterval(intervalCache[context]);
  delete intervalCache[context];
};

plugin.on(IncomingPluginEvents.WillAppear, (event) => {
  plugin.sendEvent(new GetSettingsEvent(event.context));
});
plugin.on(IncomingPluginEvents.KeyDown, (event) => updateMatchData(event.context));
plugin.on(IncomingEvents.DidReceiveSettings, (event) => {
  console.debug('got settings', event.settings);
  try {
    assertType(SettingsType, event.settings);
    matchIds[event.context] = event.settings.matchId || defaultMatchId;
  } catch (e) {
    // ignore validation error
  }
  resetButton(event.context);
  initButton(event.context);
});

export default plugin;
