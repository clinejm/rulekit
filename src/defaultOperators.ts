import { RuleConfig, Operators, Operator } from "./types";


const getValue = (data: any, config: RuleConfig): any => (config.value?.field ? data[config.value.field] : config.value);

const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

function is_empty(data: any, config: RuleConfig): boolean {
    const test = config.field ? data[config.field] : "";
    return !test || (test.trim && test.trim().length === 0);
}

const defaultInputs = (config: RuleConfig): string[] => (config?.value?.field ? [config.field, config?.value?.field] : [config.field]);
const fieldOnlyInput = (config: RuleConfig): string[] => (config.field ? [config.field] : []);

type AsyncIsConfig = RuleConfig & { time?: number };

const defaultOperators: Operators = {
    is: {
        inputs: defaultInputs,
        fn: (data, config) => config.field !== undefined && data[config.field] === getValue(data, config),
    },
    async_is: {
        async: true,
        inputs: defaultInputs,
        fn: async (data, config: AsyncIsConfig) => {
            await sleep(config.time || 1000);
            return config.field !== undefined && data[config.field] === getValue(data, config);
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

export { defaultOperators, getValue, defaultInputs, fieldOnlyInput, RuleConfig, Operator };
