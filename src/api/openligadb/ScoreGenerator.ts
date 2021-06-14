import ScoreInterface, { MatchIsType } from '../ScoreInterface';
import { SettingsSchema, SettingsType, SettingsTypeEnum } from './types/SettingsType';

import Api from './Api';
import { Logger } from 'ts-log';
import { MatchDataInterface } from './types/MatchDataType';
import ScoreGeneratorInterface from '../ScoreGeneratorInterface';
import assertType from '../../AssertType';
import dayjs from 'dayjs';

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
    } catch {
      return false;
    }
  }

  private static getFinalResult(data: MatchDataInterface) {
    return data.MatchResults.find((result) => result.ResultTypeID === 2);
  }

  private static convertToMatchResult(data: MatchDataInterface): ScoreInterface {
    const finalResult = ScoreGenerator.getFinalResult(data);
    const result: ScoreInterface = {
      matchIs: ScoreGenerator.convertMatchIs(data),
      startDate: new Date(data.MatchDateTimeUTC),
      team1: {
        iconUrl: data.Team1.TeamIconUrl,
        name: data.Team1.TeamName,
        points: finalResult?.PointsTeam1 || 0,
      },
      team2: {
        iconUrl: data.Team2.TeamIconUrl,
        name: data.Team2.TeamName,
        points: finalResult?.PointsTeam2 || 0,
      },
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
      finished: data.MatchIsFinished,
      notStarted: ScoreGenerator.isMatchInFuture(data),
      running: ScoreGenerator.isMatchRunning(data),
    };
  }

  public generateScore(settings: unknown): Promise<ScoreInterface | undefined> {
    if (!ScoreGenerator.isSettingsType(settings)) {
      this.logger.error('received invalid settings!', settings);
      // eslint-disable-next-line unicorn/no-useless-undefined
      return Promise.resolve(undefined);
    }
    if (settings.type === SettingsTypeEnum.MATCH_DAY) {
      return this.api
        .fetchMatchDay(settings.league)
        .then((matches) => ScoreGenerator.convertToMatchResult(matches[Number.parseInt(settings.matchOfLeague) - 1]))
        .then((result) => this.updateFinishedMatchdayResults(result));
    }
    return this.createScoreForMatchId(settings.matchId);
  }

  private updateFinishedMatchdayResults(result: ScoreInterface | undefined): ScoreInterface | undefined {
    if (!result || !result.matchIs.finished) {
      return result;
    }
    this.logger.debug(
      'match currently set as finished'
        + ' - overriding updateAt date so we wont miss the api-update for the next match',
    );
    result.updateAt = dayjs().add(1, 'hour').toDate();
    return result;
  }

  private createScoreForMatchId(matchId: string): Promise<ScoreInterface | undefined> {
    return this.api
      .fetchMatchData(matchId)
      .then((data) => ScoreGenerator.convertToMatchResult(data))
      .catch((error) => {
        this.logger.error(error);
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      });
  }
}
