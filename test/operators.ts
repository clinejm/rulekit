import assume from 'assume';
import { compile } from '../src/index';

type Test = {
    label: string;
    rule: any;
    fields?: string[];
    data: any;
    result: boolean;
    errorRuleIndex?: number;
};

type TestGroup = {
    label: string;
    tests: Test[];
};


const tests: TestGroup[] = [
    {
        label: 'Single Operators',
        tests: [
            {
                label: 'First `is` foo',
                rule: [
                    { field: 'first', operator: 'is', value: 'foo' }
                ],
                fields: ['first'],
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
                fields: ['first'],
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
            },
            {
                label: 'First `is` (not) is not foo',
                rule: [
                    { field: 'first', not: true, operator: 'is', value: 'foo' }
                ],
                fields: ['first'],
                data: {
                    first: 'foodd'
                },
                result: true
            },
            {
                label: 'First `is` (not) is foo',
                rule: [
                    { field: 'first', not: true, operator: 'is', value: 'foo' }
                ],
                fields: ['first'],
                data: {
                    first: 'foo'
                },
                result: false
            },
            {
                label: 'Compare Field `is` (not) not equal',
                rule: [
                    { field: 'password', not: true, operator: 'is', value: { field: 'confirmpass' } }
                ],
                fields: ['password', 'confirmpass'],
                data: {
                    password: 'foo',
                    confirmpass: 'foo3'
                },
                result: true
            },
            {
                label: 'Compare Field `is` (not) values equal',
                rule: [
                    { field: 'password', not: true, operator: 'is', value: { field: 'confirmpass' } }
                ],
                fields: ['password', 'confirmpass'],
                data: {
                    password: 'foo',
                    confirmpass: 'foo'
                },
                result: false
            },
            {
                label: 'First `is_empty`',
                rule: [
                    { field: 'first', operator: 'is_empty' }
                ],
                fields: ['first'],
                data: {
                    first: 'foo'
                },
                result: false
            },
            {
                label: 'First `is_empty` (empty string)',
                rule: [
                    { field: 'first', operator: 'is_empty' }
                ],
                fields: ['first'],
                data: {
                    first: ''
                },
                result: true
            },
            {
                label: 'First `not_empty`',
                rule: [
                    { field: 'first', operator: 'not_empty' }
                ],
                fields: ['first'],
                data: {
                    first: 'foo'
                },
                result: true
            },
            {
                label: 'First `not_empty` (empty string, return false)',
                rule: [
                    { field: 'first', operator: 'not_empty' }
                ],
                fields: ['first'],
                data: {
                    first: ''
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
                fields: ['first', 'last'],
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
                fields: ['first', 'last'],
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
                fields: ['first'],
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
                fields: ['first'],
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
                fields: ['first', 'last'],
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
                fields: ['first', 'last'],
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
                fields: ['first', 'last'],
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
                    if (test.fields) {
                        assume(rule.fields).eqls(test.fields);
                    }
                    const { result, errorRule } = await rule(test.data);
                    assume(result).equal(test.result);
                    if (result === false) {
                        const ruleIndex = test.errorRuleIndex || 0;
                        assume(errorRule).equal(test.rule[ruleIndex]);
                    } else {
                        assume(errorRule).equal(null);
                    }
                });

            })
        });
    });

});