import {Logger, LogLevel} from '../Logger';
import {expect} from 'chai';
import * as sinon from 'sinon';

describe('Logger', () => {
  let logger: Logger;
  let logStub: sinon.SinonStub<[LogLevel, ...unknown[]]>;

  beforeEach(() => {
    logger = new Logger();
    logStub = sinon.stub(logger, 'logWithLevel');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('warn', () => {
    it('should log a warning', () => {
      logger.warn('foo', 'bar');
      const args = logStub.lastCall.args;

      expect(args[0]).to.equal('warn');
      expect(args[2]).to.equal('foo');
      expect(args[3]).to.equal('bar');
    });

    it('should increment warnings count', () => {
      expect(logger.warnings).to.equal(0);
      logger.warn('foo');
      expect(logger.warnings).to.equal(1);
    });
  });

  describe('error', () => {
    it('should log an error', () => {
      logger.error('foo', 'bar');
      const args = logStub.lastCall.args;

      expect(args[0]).to.equal('error');
      expect(args[2]).to.equal('foo');
      expect(args[3]).to.equal('bar');
    });

    it('should increment errors count', () => {
      expect(logger.errors).to.equal(0);
      logger.error('foo');
      expect(logger.errors).to.equal(1);
    });
  });

  describe('info', () => {
    it('should log a message', () => {
      logger.info('foo', 'bar');
      const args = logStub.lastCall.args;

      expect(args[0]).to.equal('info');
      expect(args[2]).to.equal('foo');
      expect(args[3]).to.equal('bar');
    });
  });

  describe('log', () => {
    it('should log a default-level message', () => {
      logger.log('foo', 'bar');
      const args = logStub.lastCall.args;

      expect(args[0]).to.equal('default');
      expect(args[1]).to.equal('foo');
      expect(args[2]).to.equal('bar');
    });
  });

  describe('empty', () => {
    it('should log an empty line', () => {
      logger.empty();
      expect(logStub.lastCall.args).to.deep.equal(['default', '']);
    });
  });
});
