import ScoreInterface from './ScoreInterface';

export default interface ScoreGeneratorInterface {
  generateScore: (apiSettings: unknown) => Promise<ScoreInterface | undefined>;
}
