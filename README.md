# rulekit

modern async rules engine

## Installation

```bash
npm install @rule-kit/core
```

## Usage

```javascript

import compile, baseOperators from '@rule-kit/core';

const rules = [
    {  field: 'first', operator: 'is', value: 'foo' },
    { field: 'last', operator: 'is_not', value: 'A' },
    { field: 'last', operator: 'is_not', value: 'C' },
];

const rule = compile({ rules: rules, operators:baseOperators });

let {result, message} = await rule({
    first: 'foo',
    last: 'B'
});

console.log('Results (True)', result, message);
// true, null

let {result, message} = await rule({
    first: 'foo',
    last: 'A'
});

console.log('Results (False)', result, message);
// false, "`last` is `A`"


```
