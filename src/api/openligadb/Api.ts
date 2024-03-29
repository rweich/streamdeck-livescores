import { AxiosInstance } from 'axios';
import { setup } from 'axios-cache-adapter';
import { requestLogger, responseLogger, setGlobalConfig } from 'axios-logger';
import PQueue from 'p-queue';
import { Logger } from 'ts-log';

import assertType from '../../AssertType';
import { MatchDataInterface, MatchDataType } from './types/MatchDataType';
import { MatchDaySchema } from './types/MatchDayType';

export default class Api {
  private static axiosInstance: AxiosInstance | undefined;
  private readonly logger: Logger;
  private readonly queue: PQueue;

  constructor(logger: Logger) {
    this.logger = logger;
    this.queue = new PQueue({ concurrency: 1 });
  }

  public fetchMatchData(matchId: string): Promise<MatchDataInterface> {
    return this.queue.add(
      () =>
        this.getAxiosInstance()
          .get('https://api.openligadb.de/getmatchdata/' + matchId, { cache: { maxAge: 60 * 60 * 1000 } })
          .then((response) => {
            this.logger.debug('got response from cache?', response.request.fromCache === true);
            assertType(MatchDataType, response.data);
            return response.data;
          }),
      { throwOnTimeout: true },
    );
  }

  public fetchMatchDay(league: string): Promise<MatchDataInterface[]> {
    return this.queue.add(
      () =>
        this.getAxiosInstance()
          .get('https://api.openligadb.de/getmatchdata/' + league)
          .then((response) => {
            assertType(MatchDaySchema, response.data);
            return response.data;
          }),
      { throwOnTimeout: true },
    );
  }

  private getAxiosInstance(): AxiosInstance {
    if (Api.axiosInstance === undefined) {
      Api.axiosInstance = this.createAxiosInstance();
    }
    return Api.axiosInstance;
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = setup({
      cache: {
        maxAge: 20 * 1000,
      },
      headers: { ContentType: 'application/json' },
    });
    setGlobalConfig({
      logger: this.logger.info.bind(this),
      prefixText: 'Api',
    });
    instance.interceptors.request.use(requestLogger);
    instance.interceptors.response.use(responseLogger);
    return instance;
  }
}
