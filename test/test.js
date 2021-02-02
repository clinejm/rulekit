import assume from 'assume';
import compile from '../src/engine.js';


const simple = [
    {
        label: 'First is foo',
        rule: [
            { field: 'first', operator: 'is', value: 'foo' }
        ],
        data: {
            first: 'foo'
        },
        result: true
    },
    {
        label: 'First is not foo',
        rule: [
            { field: 'first', operator: 'is', value: 'foo' }
        ],
        data: {
            first: 'adlakjdflskj'
        },
        result: false
    }
];

describe('Operator Test', function () {
    describe('single operators', function () {

        simple.forEach((test) => {

            it(test.label, async function () {

                const rule = compile({ rules: test.rule });
                const result = await rule(test.data);
                assume(result).equal(test.result);
            });

        })


        it('Can execute rule more than once', async function () {

            const test = [
                { field: 'first', operator: 'is', value: 'foo' }
            ];


            const rule = compile({ rules: test });

            const result = await rule({
                first: 'Bar',
            });

            assume(result).is.false();

            const result2 = await rule({
                first: 'foo'
            });

            assume(result2).is.true();
        });
    });
});