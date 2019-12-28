import {Visitor} from '../Visitor';
import {expect} from 'chai';
import {PackageLock, PackageLockDependency} from '../PackageLock';

class MockVisitor extends Visitor {
  public visit(_root: PackageLock): Promise<void> {
    return Promise.resolve();
  }

  public visitDependency(
    _name: string,
    _data: PackageLockDependency
  ): Promise<void> {
    return Promise.resolve();
  }
}

describe('Visitor', () => {
  describe('constructor', () => {
    it('should set options', () => {
      const v = new MockVisitor({path: 'foo'});
      expect(v.options).to.deep.equal({
        path: 'foo'
      });
    });
  });
});
