import assume from 'assume';
import compile from '../src/engine.js';

describe('Check Engine', function () {
    it('Can execute rule more than once', async function () {

        const test = [
            { field: 'first', operator: 'is', value: 'foo' }
        ];


        const rule = compile({ rules: test });

        const { result, errorRule } = await rule({
            first: 'Bar',
        });

        assume(result).is.false();

        const { result: result2, errorRule2 } = await rule({
            first: 'foo'
        });

        assume(result2).is.true();
    });
});
