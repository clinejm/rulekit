
const getValue = (data, config) => (config.value.field ? data[config.value.field] : config.value)

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function is_empty(data, config) {
    const test = data[config.field];
    return !test || (test.trim && test.trim().length === 0)
}
/**
 * the operator provides a `inputs` function that returns the fields it uses when evaluating. 
 * inputs is run once when the rule is constructed. 
 */
const defaultInputs = (config) => (config?.value?.field ? [config.field, config?.value?.field] : [config.field]);
const fieldOnlyInput = (config) => ([config.field]);

const defaultOperators = {
    is: {
        inputs: defaultInputs,
        fn: (data, config) => (data[config.field] === getValue(data, config)),
    },
    async_is: {
        async: true,
        inputs: defaultInputs,
        fn: async (data, config) => {
            return sleep(config.time || 1000).then(() => data[config.field] === getValue(data, config))
        }
    },
    is_empty: {
        inputs: fieldOnlyInput,
        fn: is_empty
    },
    not_empty: {
        inputs: fieldOnlyInput,
        fn: (data, config) => !is_empty(data, config)
    }
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

const NOT = (op) => ((data, config) => (!op(data, config)));

const compileGroup = (rules, operators, ruleFields, defaultField) => {
    const cmp = [];
    let fn = groupOperators[rules.operator];
    if (!fn) {
        return;
    }
    rules.rules.forEach(ruleConf => {
        let rule = ruleConf;
        let operator = operators[rule.operator];

        let op = operator?.fn;


        if (defaultField && !rule.field) {
            rule = { ...ruleConf, field: defaultField }
        }

        if (rule.rules) {
            //this is a group operator and we need to compile it first.
            op = compileGroup(rule, operators, ruleFields, defaultField);
        }
        if (op) {
            if (rule.not === true) {
                //flip the results of of the operator
                op = NOT(op);
            }

            if (operator && operator.inputs) {
                const fields = operator.inputs(rule);
                if (fields) {
                    fields.forEach(item => ruleFields[item] = true);
                }
            }
            cmp.push({ op, config: rule });
        } else {
            console.error('Operator not found for rule ', rule)
        }
    });

    const runner = (data) => fn(data, cmp, rules);
    return runner;
}

const compile = ({ rules, operators = defaultOperators, defaultField }) => {
    const ruleFields = {};
    const rule = compileGroup(Array.isArray(rules) ? { operator: 'and', rules } : rules, operators, ruleFields, defaultField);
    rule.fields = Object.keys(ruleFields);
    return rule;
}

module.exports = { compile, defaultOperators };

