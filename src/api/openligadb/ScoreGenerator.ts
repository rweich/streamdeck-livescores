import { assertType } from '@rweich/streamdeck-ts';
import dayjs from 'dayjs';
import { Logger } from 'ts-log';
import ScoreGeneratorInterface from '../ScoreGeneratorInterface';
import ScoreInterface, { MatchIsType } from '../ScoreInterface';
import Api from './Api';
import { MatchDataInterface } from './types/MatchDataType';
import { SettingsSchema, SettingsType, SettingsTypeEnum } from './types/SettingsType';

export default class ScoreGenerator implements ScoreGeneratorInterface {
  private readonly api: Api;
  private readonly logger: Logger;

  constructor(api: Api, logger: Logger) {
    this.api = api;
    this.logger = logger;
  }

  private static isSettingsType(settings: unknown): settings is SettingsType {
    try {
      assertType(SettingsSchema, settings);
      return true;
    } catch (e) {
      return false;
    }
  }

  private static getFinalResult(data: MatchDataInterface) {
    return data.MatchResults.find((res) => res.ResultTypeID === 2);
  }

  private static convertToMatchResult(data: MatchDataInterface): ScoreInterface {
    const finalResult = ScoreGenerator.getFinalResult(data);
    const result: ScoreInterface = {
      team1: {
        name: data.Team1.TeamName,
        iconUrl: data.Team1.TeamIconUrl,
        points: finalResult?.PointsTeam1 || 0,
      },
      team2: {
        name: data.Team2.TeamName,
        iconUrl: data.Team2.TeamIconUrl,
        points: finalResult?.PointsTeam2 || 0,
      },
      startDate: new Date(data.MatchDateTimeUTC),
      matchIs: ScoreGenerator.convertMatchIs(data),
    };
    if (result.matchIs.running) {
      result.updateIntervalSeconds = 30;
    } else if (result.matchIs.notStarted) {
      result.updateAt = result.startDate;
    }
    return result;
  }

  private static isMatchInFuture(data: MatchDataInterface): boolean {
    return Date.parse(data.MatchDateTimeUTC) > Date.now();
  }

  private static isMatchRunning(data: MatchDataInterface): boolean {
    const startTS = Date.parse(data.MatchDateTimeUTC);
    return startTS < Date.now() && !data.MatchIsFinished;
  }

  private static convertMatchIs(data: MatchDataInterface): MatchIsType {
    return {
      notStarted: ScoreGenerator.isMatchInFuture(data),
      finished: data.MatchIsFinished,
      running: ScoreGenerator.isMatchRunning(data),
    };
  }

  private updateFinishedMatchdayResults(result: ScoreInterface | null): ScoreInterface | null {
    if (!result || result.matchIs.finished) {
      return result;
    }
    this.logger.debug(
      'match currently set as finished'
        + ' - overriding updateAt date so we wont miss the api-update for the next match',
    );
    result.updateAt = dayjs().add(1, 'hour').toDate();
    return result;
  }

  public generateScore(settings: unknown): Promise<ScoreInterface | null> {
    if (!ScoreGenerator.isSettingsType(settings)) {
      this.logger.error('received invalid settings!', settings);
      return Promise.resolve(null);
    }
    if (settings.type === SettingsTypeEnum.MATCH_DAY) {
      return this.api
        .fetchMatchDay(settings.league)
        .then((matches) => ScoreGenerator.convertToMatchResult(matches[parseInt(settings.matchOfLeague) - 1]))
        .then((result) => this.updateFinishedMatchdayResults(result));
    }
    return this.createScoreForMatchId(settings.matchId);
  }

  private createScoreForMatchId(matchId: string): Promise<ScoreInterface | null> {
    return this.api
      .fetchMatchData(matchId)
      .then((data) => ScoreGenerator.convertToMatchResult(data))
      .catch((error) => {
        this.logger.error(error);
        return null;
      });
  }
}
