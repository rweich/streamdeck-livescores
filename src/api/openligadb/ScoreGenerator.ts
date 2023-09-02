import dayjs from 'dayjs';
import { Logger } from 'ts-log';

import assertType from '../../AssertType';
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
    } catch {
      return false;
    }
  }

  private static getFinalResult(data: MatchDataInterface) {
    return data.matchResults.find((result) => result.resultTypeID === 2);
  }

  private static convertToMatchResult(data: MatchDataInterface): ScoreInterface {
    const finalResult = ScoreGenerator.getFinalResult(data);
    const result: ScoreInterface = {
      matchIs: ScoreGenerator.convertMatchIs(data),
      startDate: new Date(data.matchDateTimeUTC),
      team1: {
        iconUrl: data.team1.teamIconUrl,
        name: data.team1.teamName,
        points: finalResult?.pointsTeam1 || 0,
        shortName: data.team1.shortName,
      },
      team2: {
        iconUrl: data.team2.teamIconUrl,
        name: data.team2.teamName,
        points: finalResult?.pointsTeam2 || 0,
        shortName: data.team2.shortName,
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
    return Date.parse(data.matchDateTimeUTC) > Date.now();
  }

  private static isMatchRunning(data: MatchDataInterface): boolean {
    const startTS = Date.parse(data.matchDateTimeUTC);
    return startTS < Date.now() && !data.matchIsFinished;
  }

  private static convertMatchIs(data: MatchDataInterface): MatchIsType {
    return {
      finished: data.matchIsFinished,
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
        .then((matches) =>
          this.createScoreForMatchId(String(matches[Number.parseInt(settings.matchOfLeague) - 1].matchID)),
        )
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
