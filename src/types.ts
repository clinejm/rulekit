export type RuleConfig = {
    field?: string;
    operator: string;
    value?: any;
    not?: boolean;
    rules?: RuleConfig[];
};
export type GroupOperatorFn = (
    data: any,
    rules: CompiledRule[],
    rulesConfig: RuleConfig
) => Promise<{ result: boolean; errorRule: RuleConfig | null; } | boolean>;


export interface CompiledRule {
    op: GroupOperatorFn;
    config: RuleConfig;
}

export interface Config {
    field: string;
    value?: {
        field?: string;
    };
    time?: number;
}

export type OperatorFn = (data: any, config: Config) => boolean | Promise<boolean>;

export interface Operator {
    inputs?: (config: Config) => string[];
    fn: OperatorFn;
    async?: boolean;
}

export interface DefaultOperators {
    [key: string]: Operator;
}
