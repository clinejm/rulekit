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
    rulesConfig?: RuleConfig
) => OperatorReturnType;


export interface CompiledRule {
    op: OperatorFn;
    config: RuleConfig;
}

export interface Config {
    field: string;
    value?: {
        field?: string;
    };
    time?: number;
}

export type OperatorResults = boolean | { result: boolean; errorRule: RuleConfig | null; };

export type OperatorReturnType = OperatorResults | Promise<OperatorResults>;

export type OperatorFn = (data: any, config: Config) => OperatorReturnType;

export interface Operator {
    inputs?: (config: Config) => string[];
    fn: OperatorFn;
    async?: boolean;
}

export interface Operators {
    [key: string]: Operator;
}
