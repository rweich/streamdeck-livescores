import { assertType } from '@rweich/streamdeck-ts';
import { AxiosInstance } from 'axios';
import { setup } from 'axios-cache-adapter';
import { requestLogger, responseLogger, setGlobalConfig } from 'axios-logger';
import PQueue from 'p-queue';
import { Logger } from 'ts-log';
import { MatchDataInterface, MatchDataType } from './types/MatchDataType';
import { MatchDaySchema } from './types/MatchDayType';

export default class Api {
  private static axiosInstance: AxiosInstance | null = null;
  private readonly logger: Logger;
  private readonly queue: PQueue;

  constructor(logger: Logger) {
    this.logger = logger;
    this.queue = new PQueue({ concurrency: 1 });
  }

  public fetchMatchData(matchId: string): Promise<MatchDataInterface> {
    return this.queue.add(() =>
      this.getAxiosInstance()
        .get('https://www.openligadb.de/api/getmatchdata/' + matchId)
        .then((response) => {
          assertType(MatchDataType, response.data);
          return response.data;
        }),
    );
  }

  public fetchMatchDay(league: string): Promise<MatchDataInterface[]> {
    return this.queue.add(() =>
      this.getAxiosInstance()
        .get('https://www.openligadb.de/api/getmatchdata/' + league)
        .then((response) => {
          assertType(MatchDaySchema, response.data);
          return response.data;
        }),
    );
  }

  private getAxiosInstance(): AxiosInstance {
    if (Api.axiosInstance === null) {
      Api.axiosInstance = this.createAxiosInstance();
    }
    return Api.axiosInstance;
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = setup({
      headers: { ContentType: 'application/json' },
      cache: {
        maxAge: 20 * 1000,
      },
    });
    setGlobalConfig({
      prefixText: 'Api',
      logger: this.logger.info.bind(this),
    });
    instance.interceptors.request.use(requestLogger);
    instance.interceptors.response.use(responseLogger);
    return instance;
  }
}
