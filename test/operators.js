import assume from 'assume';
import compile from '../src/engine.js';

const tests = [
    {
        label: 'Single Operators',
        tests: [
            {
                label: 'First `is` foo',
                rule: [
                    { field: 'first', operator: 'is', value: 'foo' }
                ],
                data: {
                    first: 'foo'
                },
                result: true
            },
            {
                label: 'First `is` not foo',
                rule: [
                    { field: 'first', operator: 'is', value: 'foo' }
                ],
                data: {
                    first: 'adlakjdflskj'
                },
                result: false
            },
            {
                label: 'Compare Field `is` equal',
                rule: [
                    { field: 'password', operator: 'is', value: { field: 'confirmpass' } }
                ],
                data: {
                    password: 'foo',
                    confirmpass: 'foo'
                },
                result: true
            },
            {
                label: 'Compare Field `is` value not equal',
                rule: [
                    { field: 'password', operator: 'is', value: { field: 'confirmpass' } }
                ],
                data: {
                    password: 'foo',
                    confirmpass: 'dfdfd'
                },
                result: false
            }
        ]
    },
    {
        label: 'Multiple Operators',
        tests: [
            {
                label: 'First `is` foo and `last` is bar',
                rule: [
                    { field: 'first', operator: 'is', value: 'foo' },
                    { field: 'last', operator: 'is', value: 'bar' }
                ],
                data: {
                    first: 'foo',
                    last: 'bar'
                },
                result: true
            },
            {
                label: 'First `is` foo and `last` is not bar',
                rule: [
                    { field: 'first', operator: 'is', value: 'foo' },
                    { field: 'last', operator: 'is', value: 'ddddddd' }
                ],
                data: {
                    first: 'foo',
                    last: 'bar'
                },
                result: false,
                errorRuleIndex: 1
            }
        ]
    },
    {
        label: 'Async Operators',
        tests: [
            {
                label: 'First `async_is` foo',
                rule: [
                    { field: 'first', operator: 'async_is', time: 10, value: 'foo' },
                ],
                data: {
                    first: 'foo',
                },
                result: true
            },
            {
                label: 'First `async_is` not foo ',
                rule: [
                    { field: 'first', operator: 'async_is', time: 10, value: 'foo' },
                ],
                data: {
                    first: 'fodddddo',
                },
                result: false,
            },
            {
                label: 'First `async_is` foo and last `is` not bar ',
                rule: [
                    { field: 'first', operator: 'async_is', time: 10, value: 'foo' },
                    { field: 'last', operator: 'is', value: 'bar' }
                ],
                data: {
                    first: 'foo',
                    last: 'bar'
                },
                result: true
            },
            {
                label: 'First `async_is` foo and last `is` not bar ',
                rule: [
                    { field: 'first', operator: 'async_is', time: 10, value: 'foo' },
                    { field: 'last', operator: 'is', value: 'bar' }
                ],
                data: {
                    first: 'foo',
                    last: 'bardd'
                },
                errorRuleIndex: 1,
                result: false
            },
            {
                label: 'First `async_is` not foo ',
                rule: [
                    { field: 'first', operator: 'async_is', time: 10, value: 'foo' },
                    { field: 'last', operator: 'is', value: 'bar' }
                ],
                data: {
                    first: 'fodddddo',
                    last: 'bar'
                },
                result: false,
            },
        ]
    }
];

describe('Operator Test', function () {
    tests.forEach((group) => {
        describe(group.label, function () {
            group.tests.forEach((test) => {
                it(test.label, async function () {
                    const rule = compile({ rules: test.rule });
                    const { result, errorRule } = await rule(test.data);
                    assume(result).equal(test.result);
                    if (result === false) {
                        const ruleIndex = test.errorRuleIndex || 0;
                        assume(errorRule).equal(test.rule[ruleIndex]);
                    }
                });

            })
        });
    });

});