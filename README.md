# @rule-kit/core

modern async rules engine.

## When to use

- Use were hand-coding javascript logic isn't practical or safe. 
    - No code tools where users don't want to or can't be trusted to write javascript
    - Large and complex or dynamic forms where hand-coded validation is unreliable. 
    - Workflows
    - Data processing

## Features

- No runtime dependencies in core engine, or transpiling (just needs `async/await`)
- Small core, easy to read and if needed copypasta and hack up. 
- Specify rules in `JSON` which allows for 
    - dynamic rules
    - fetch rules from server
    - run the same rules on client and server
- `compile` a rule once at runtime and execute the rule multiple times
    - the `compile` function converts the rules to executeable 
    code with out the use of `eval` or any other shady hacks. 
- Mix and match `sync` and `async` rules.
- Rule Groups
    - `and` all rules must be true for grouop to be true (this is the default)
    - `or` if any rule returns true then the group is true
- Groups can be nested.
- The rule or rule group that causes the rule to be `false` is returned as `errorRule`
- Add custom operators (these are just simple `sync` or `async` functions)
- Operators can compare a field to a literal value or another field in the data object 


## Built-in Operators

- `is`  
- `is_not`

See roadmap for more operators to come. 

## Installation

```bash
npm install @rule-kit/core
```

## Basic Usage

```javascript

import compile, baseOperators from '@rule-kit/core';

const rules = [
    {  field: 'first', operator: 'is', value: 'foo' },
    { field: 'last', operator: 'is_not', value: 'A' },
    { field: 'last', operator: 'is_not', value: 'C' },
];

const rule = compile({ rules: rules, operators:baseOperators })

let {result, errorRule} = await rule({
    first: 'foo',
    last: 'B'
});

console.log('Results (True)', result, errorRule);
// true, null

let {result, errorRule} = await rule({
    first: 'foo',
    last: 'A'
});

console.log('Results (False)', result, errorRule);
// false,  {  field: 'first', operator: 'is', value: 'foo' }


```

### Nested Rules

```javascript

const rule = { 
    operator: 'or', 
    rules:[
        { field: 'first', operator: 'is', value: 'foo' },
        {
            operator: 'or', 
            rules: [
                { field: 'last', operator: 'is', value: 'foo' },
                { field: 'last', operator: 'is', value: 'blort' }
            ]
        }
    ]
}

const rule = compile({ rules: rule })

let {result, errorRule} = await rule({
    first: 'foo',
    last: 'A'
});
// result === false (because last isn't foo or blort)

let {result, errorRule} = await rule({
    first: 'foo',
    last: 'foo'
});
// result === true (because first and last are foo )

```

In the above example the the field `first` must have a value or `foo`
and the field `last` must have a value of either `foo` or `blort` 


### Compare one field to another

```javascript

//value can be an object not just a literal. 
// in this case provide the field to compare
const rules = [{ field: 'password', operator: 'is', value: { field: 'confirmpass' } }];

const rule = compile({ rules });

let {result, errorRule} = await rule({
    password: 'foo',
    confirmpass: 'foo'
});
// result === true (because they match)


let {result, errorRule} = await rule({{
    password: 'foo',
    confirmpass: 'dddd'
});
// result === false (because they don't match)


```

### Custom Operators

An operator is just a function it will receive to arguments 
- `data` the object that contains the data the function is to evaulate
- `config` the configuration of the rule. this will contain at least the key `field` or the location of the data being evaulated by this rule. 

```javascript

const getValue = (data, config) => (config.value.field ? data[config.value.field] : config.value)


const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}


const defaultOperators = {
    is: (data, config) => (data[config.field] === getValue(data, config)),
    is_not: (data, config) => (data[config.field] !== getValue(data, config)),
    async_is: async (data, config) => {
        return sleep(config.time || 1000).then(() => data[config.field] === getValue(data, config))
    },
}


```

## Road Map

- Real docs
- More tests
- Sync only comple (if you don't need async functions)
- More Operators
    - Strings 
    - Math/Numbers
    - Dates
    - Arrays
- Extensions
    - `react` `useRule` hook
    - utlity to display user friendly localized error messages (eg form validation)
    - GUI builder

