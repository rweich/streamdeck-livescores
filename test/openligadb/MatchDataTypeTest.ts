import { expect, use } from 'chai';
import jsonschema from 'chai-json-schema';
import 'mocha';
import { MatchDataType } from '../../src/api/openligadb/types/MatchDataType';
import matchdataBeforeStart from './fixtures/matchdata.beforestart.json';
import matchdataFinished from './fixtures/matchdata.finished.json';
import matchdataFinishedPenalty from './fixtures/matchdata.finnished.penalty-shootout.json';
import matchdataRunningNoGoals from './fixtures/matchdata.running.nogoals.json';
import matchdataRunningOneGoal from './fixtures/matchdata.running.onegoal.json';

use(jsonschema);

describe('MatchDataType', () => {
  it('should validate against a not yet started match', () => {
    expect(matchdataBeforeStart).to.be.jsonSchema(MatchDataType);
  });
  it('should validate against a running match with no goals', () => {
    expect(matchdataRunningNoGoals).to.be.jsonSchema(MatchDataType);
  });
  it('should validate against a running match with one goal', () => {
    expect(matchdataRunningOneGoal).to.be.jsonSchema(MatchDataType);
  });
  it('should validate against a finished match', () => {
    expect(matchdataFinished).to.be.jsonSchema(MatchDataType);
  });
  it('should validate against a finished match that had a penalty shootout', () => {
    expect(matchdataFinishedPenalty).to.be.jsonSchema(MatchDataType);
  });
});
