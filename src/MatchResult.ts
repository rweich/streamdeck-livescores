interface TeamInterface {
  name: string;
  iconUrl: string;
  points: number;
}

export enum MatchIsEnum {
  NotStarted = 'not-started',
  Running = 'running',
  Finished = 'finished',
}

export default interface MatchResult {
  team1: TeamInterface;
  team2: TeamInterface;
  startDate: Date;
  matchIs: MatchIsEnum;
}
