import { Config, DefaultOperators, Operator } from "./types";


const getValue = (data: any, config: Config): any => (config.value?.field ? data[config.value.field] : config.value);

const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

function is_empty(data: any, config: Config): boolean {
    const test = data[config.field];
    return !test || (test.trim && test.trim().length === 0);
}

const defaultInputs = (config: Config): string[] => (config?.value?.field ? [config.field, config?.value?.field] : [config.field]);
const fieldOnlyInput = (config: Config): string[] => ([config.field]);

const defaultOperators: DefaultOperators = {
    is: {
        inputs: defaultInputs,
        fn: (data, config) => data[config.field] === getValue(data, config),
    },
    async_is: {
        async: true,
        inputs: defaultInputs,
        fn: async (data, config) => {
            await sleep(config.time || 1000);
            return data[config.field] === getValue(data, config);
        },
    },
    is_empty: {
        inputs: fieldOnlyInput,
        fn: is_empty,
    },
    not_empty: {
        inputs: fieldOnlyInput,
        fn: (data, config) => !is_empty(data, config),
    },
};

export { defaultOperators, getValue, defaultInputs, fieldOnlyInput, Config, Operator };
