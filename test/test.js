import assume from 'assume';
import compile from '../src/engine.js';

describe('Test', function () {
    describe('test', function () {
        it('always true', function () {
            assume(1).is.ok();
        });
    });
});



describe('Simple', function () {
    describe('simple ops', function () {
        it('First is Foo', async function () {

            const test = [
                { field: 'first', operator: 'is', value: 'foo' }
            ];


            const rule = compile({ rules: test });

            const result = await rule({
                first: 'foo',
                last: 'B'
            });

            assume(result).is.true();
        });

        it('First is not Foo', async function () {

            const test = [
                { field: 'first', operator: 'is', value: 'foo' }
            ];


            const rule = compile({ rules: test });

            const result = await rule({
                first: 'Bar',
                last: 'B'
            });

            assume(result).is.false();
        });
    });
});