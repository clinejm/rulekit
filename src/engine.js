
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
        isTrue = await rule.op(data, rule.config);
        if (!isTrue) {
            errorRule = rule.config;
            break;
        }
    }
    return {
        result: isTrue, errorRule
    };
}

const _executeOr = async (data, rules) => {
    //console.log('_execute', data, rules);
    let isTrue = false;
    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        //console.log('eval rule ', index)
        isTrue = await rule.op(data, rule.config);
        if (isTrue) {
            break;
        }
    }
    return isTrue;
}

const compile = ({ rules, operators = defaultOperators }) => {
    const cmp = [];
    rules.forEach(rule => {
        // console.log('Compling rule', rule);
        const op = operators[rule.operator];
        if (op) {
            cmp.push({ op, config: rule });
        } else {
            console.error('Operator not found for rule ', rule)
        }
    });
    //console.log(cmp);
    const runner = async (data) => await _executeAnd(data, cmp);
    return runner;
}

export default compile;

