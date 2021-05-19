
const getValue = (data, config) => (config.value.field ? data[config.value.field] : config.value)

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function is_empty(data, config) {
    const test = data[config.field];
    return test === null || (test.trim && test.trim().length === 0)
}

const defaultOperators = {
    is: (data, config) => (data[config.field] === getValue(data, config)),
    is_not: (data, config) => (data[config.field] !== getValue(data, config)),
    async_is: async (data, config) => {
        return sleep(config.time || 1000).then(() => data[config.field] === getValue(data, config))
    },
    is_empty: is_empty,
    not_empty: (data, config) => !is_empty(data, config)
}


const _executeAnd = async (data, rules) => {
    let isTrue = true;
    let errorRule = null;
    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        // TODO handle thrown exceptions as rule errors. 
        const result = await rule.op(data, rule.config);

        if (result === false) {
            isTrue = false;
            errorRule = rule.config;
            break;
        }
        if (result.errorRule) {
            isTrue = false;
            errorRule = result.errorRule;
            break;
        }
    }
    return {
        result: isTrue, errorRule
    };
}

const _executeOr = async (data, rules, rulesConfig) => {
    let isTrue = false;
    let errorRule = rulesConfig;
    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        const result = await rule.op(data, rule.config);
        if (result === true || result.result === true) {
            isTrue = true;
            errorRule = null;
            break;
        }
    }
    return {
        result: isTrue, errorRule
    };
}


const groupOperators = {
    or: _executeOr,
    and: _executeAnd
}

const compileGroup = (rules, operators = defaultOperators) => {
    const cmp = [];
    let fn = groupOperators[rules.operator];
    if (!fn) {
        return;
    }
    rules.rules.forEach(rule => {
        let op = operators[rule.operator];
        if (rule.rules) {
            //this is a group operator and we need to compile it first.
            op = compileGroup(rule, operators);
        }
        if (op) {
            cmp.push({ op, config: rule });
        } else {
            console.error('Operator not found for rule ', rule)
        }
    });

    const runner = (data) => fn(data, cmp, rules);
    return runner;
}


const compile = ({ rules, operators = defaultOperators }) => {
    if (Array.isArray(rules)) {
        return compileGroup({ operator: 'and', rules }, operators);
    } else {
        return compileGroup(rules, operators);
    }
}

module.exports = { compile, defaultOperators };

