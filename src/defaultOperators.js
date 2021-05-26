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

module.exports = { defaultOperators, getValue, defaultInputs, fieldOnlyInput };