
const defaultOperators = {
    is: (data, config) => {
        let value = config.value;
        if (config.value.field) {
            value = data[config.value.field]
        }
        return data[config.field] === value;
    },
    is_not: (data, config) => (data[config.field] !== config.value),
    async_test: async (data, config) => {
        return sleep(1000).then(() => data[config.field] === config.value)
    },
}



const _executeAnd = async (data, rules) => {
    console.log('_execute', data, rules);
    let isTrue = true;
    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        console.log('eval rule ', index)
        isTrue = await rule(data);
        if (!isTrue) {
            break;
        }
    }
    return isTrue;
}

const compile = ({ rules, operators = defaultOperators }) => {
    const cmp = [];
    rules.forEach(rule => {
        console.log('Compling rule', rule);
        const op = operators[rule.operator];
        if (op) {
            cmp.push((data) => (op(data, rule)));
        } else {
            console.error('Invalid rule ', rule)
        }
    });
    console.log(cmp);
    const runner = async (data) => await _executeAnd(data, cmp);
    return runner;
}

export default compile;

