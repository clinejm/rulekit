const assume = require('assume');
const { compile } = require('../src/index.js');

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
        assume(errorRule).equal(test[0]);

        const { result: result2, errorRule: errorRule2 } = await rule({
            first: 'foo'
        });

        assume(result2).is.true();
        assume(errorRule2).equal(null);
    });

    it('Can inverse (not) an operator', async function () {

        const test = [
            { field: 'first', not: true, operator: 'is', value: 'foo' }
        ];

        const rule = compile({ rules: test });

        const { result, errorRule } = await rule({
            first: 'Bar',
        });

        assume(result).is.true();
        assume(errorRule).equal(null);
    });

    it('All/And Operator Group', async function () {

        const test =
        {
            operator: 'and', rules: [
                { field: 'first', operator: 'is', value: 'foo' },
                { field: 'last', operator: 'is', value: 'blort' }
            ]
        };


        const rule = compile({ rules: test });


        const { result, errorRule } = await rule({
            first: 'Bar',
        });
        assume(result).is.false();
        assume(errorRule).equal(test.rules[0]);


        const { result: result2, errorRule: errorRule2 } = await rule({
            first: 'foo',
            last: 'blort'
        });

        assume(result2).is.true();
        assume(errorRule2).equal(null);

    });

    it('Any/Or Operator Group', async function () {

        const test =
        {
            operator: 'or', rules: [
                { field: 'first', operator: 'is', value: 'foo' },
                { field: 'first', operator: 'is', value: 'blort' }
            ]
        };


        const rule = compile({ rules: test });


        const { result, errorRule } = await rule({
            first: 'Bar',
        });
        assume(result).is.false();
        assume(errorRule).equal(test);


        const { result: result2, errorRule: errorRule2 } = await rule({
            first: 'foo'
        });

        assume(result2).is.true();
        assume(errorRule2).equal(null);


        const { result: result3, errorRule: errorRule3 } = await rule({
            first: 'blort'
        });

        assume(result3).is.true();
        assume(errorRule2).equal(null);


        const { result: result4, errorRule: errorRule4 } = await rule({
            first: 'aaaaa'
        });
        assume(result4).is.false();
    });


    it('Nested group (And)', async function () {

        const test = [
            { field: 'first', operator: 'is', value: 'foo' },
            {
                operator: 'or', rules: [
                    { field: 'last', operator: 'is', value: 'foo' },
                    { field: 'last', operator: 'is', value: 'blort' }
                ]
            }
        ];


        const rule = compile({ rules: test });

        const { result, errorRule } = await rule({
            first: 'Bar',
        });

        assume(result).is.false();
        assume(errorRule).equal(test[0]);

        const { result: result2, errorRule: errorRule2 } = await rule({
            first: 'foo',
            last: 'aaaa'
        });

        assume(result2).is.false();
        assume(errorRule2).equal(test[1]);

        const { result: result3, errorRule: errorRule3 } = await rule({
            first: 'foo',
            last: 'blort'
        });

        assume(result3).is.true();
        assume(errorRule3).equal(null);
    });

    it('Rule.fields contains set of all fields used in the rules', async function () {

        const test = [
            { field: 'first', operator: 'is', value: 'foo' },
            { field: 'bob', operator: 'is', value: 'blort' },
            { field: 'stan', operator: 'is', value: 'foo' },
            {
                operator: 'or', rules: [
                    { field: 'last', operator: 'is', value: 'foo' },
                    { field: 'stan', operator: 'is', value: 'foo' },
                    { field: 'steve', operator: 'is', value: 'blort' },
                    { field: 'aaaaa', operator: 'is', value: { field: 'fieldcompare' } },
                    {
                        operator: 'or', rules: [
                            { field: 'stan', operator: 'is', value: 'foo' },
                            { field: 'blort', operator: 'is', value: 'blort' }
                        ]
                    }
                ],
            }
        ];

        const rule = compile({ rules: test });
        const sorted = [...rule.fields].sort();
        assume(rule.fields).is.a('array');
        assume(sorted).eqls(["aaaaa", "blort", "bob", "fieldcompare", "first", "last", "stan", "steve"]);

    });


    it('Nested group (Or)', async function () {

        const test = {
            operator: 'or', rules: [
                { field: 'first', operator: 'is', value: 'foo' },
                {
                    operator: 'or', rules: [
                        { field: 'last', operator: 'is', value: 'foo' },
                        { field: 'last', operator: 'is', value: 'blort' }
                    ]
                }
            ]
        };


        const rule = compile({ rules: test });

        const { result, errorRule } = await rule({
            first: 'Bar',
        });

        assume(result).is.false();
        assume(errorRule).equal(test);

        const { result: result2, errorRule: errorRule2 } = await rule({
            first: 'foo',
            last: 'aaaa'
        });

        assume(result2).is.true();
        assume(errorRule2).equal(null);

        const { result: result3, errorRule: errorRule3 } = await rule({
            first: 'foo',
            last: 'blort'
        });

        assume(result3).is.true();
        assume(errorRule3).equal(null);
    });
});
