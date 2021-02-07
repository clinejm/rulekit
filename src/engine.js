
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



const _executeAnd = async (data, rules) => {
    //console.log('_execute', data, rules);
    let isTrue = true;
    let errorRule = null;
    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        const result = await rule.op(data, rule.config);
        console.log("_executeAnd", result, rule.config);
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
    //console.log('_execute', data, rules);
    let isTrue = false;
    let errorRule = rulesConfig;
    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        //  console.log('eval rule ', index)
        isTrue = await rule.op(data, rule.config);
        if (isTrue) {
            errorRule = null;
            break;
        }
    }
    return {
        result: isTrue, errorRule
    };
}

const compileGroup = (rules, operators = defaultOperators) => {
    const cmp = [];
    rules.rules.forEach(rule => {
        // console.log('Compling rule', rule);
        let op = operators[rule.operator];
        if (rule.rules) {
            //this is a group operator and we need to compile it first.
            //TODO group functions return object {result, errorRule}, vs normal ops that return true. 
            //  need to nomalize. 
            op = compileGroup(rule, operators);
        }
        if (op) {
            cmp.push({ op, config: rule });
        } else {
            console.error('Operator not found for rule ', rule)
        }
    });
    const fn = rules.operator === 'or' ? _executeOr : _executeAnd
    const runner = async (data) => await fn(data, cmp, rules);
    return runner;
}


const compile = ({ rules, operators = defaultOperators }) => {
    if (Array.isArray(rules)) {
        return compileGroup({ operator: 'and', rules }, operators);
    } else {
        return compileGroup(rules, operators);
    }
}

export default compile;

