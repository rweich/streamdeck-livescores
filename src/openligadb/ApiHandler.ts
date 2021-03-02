import { assertType } from '@rweich/streamdeck-ts';
import axios from 'axios';
import MatchResult, { MatchIsEnum } from '../MatchResult';
import { MatchDataInterface, MatchDataType } from './MatchDataType';

export default class ApiHandler {
  public getMatchData(matchId: string): Promise<MatchResult | null> {
    return this.fetchMatchData(matchId)
      .then((data) => {
        const finalResult = this.getFinalResult(data);
        return {
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
          matchIs: this.convertMatchIs(data),
        };
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  private matchIsInFuture(data: MatchDataInterface): boolean {
    return Date.parse(data.MatchDateTimeUTC) > Date.now();
  }

  private matchIsRunning(data: MatchDataInterface): boolean {
    const startTS = Date.parse(data.MatchDateTimeUTC);
    return startTS < Date.now() && !data.MatchIsFinished;
  }

  private getFinalResult(data: MatchDataInterface) {
    return data.MatchResults.find((res) => res.ResultTypeID === 2);
  }

  private convertMatchIs(data: MatchDataInterface): MatchIsEnum {
    if (this.matchIsInFuture(data)) {
      return MatchIsEnum.NotStarted;
    }
    if (this.matchIsRunning(data)) {
      return MatchIsEnum.Running;
    }
    return MatchIsEnum.Finished;
  }

  private fetchMatchData(matchId: string): Promise<MatchDataInterface> {
    return axios
      .get('https://www.openligadb.de/api/getmatchdata/' + matchId, { headers: { ContentType: 'application/json' } })
      .then((response) => {
        console.log('openligadb response data', JSON.stringify(response.data));
        assertType(MatchDataType, response.data);
        return response.data;
      });
  }
}
