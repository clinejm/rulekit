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


export type OperatorResults = boolean | { result: boolean; errorRule: RuleConfig | null; };

export type OperatorReturnType = OperatorResults | Promise<OperatorResults>;

export type OperatorFn = {
    (data: any, config: RuleConfig): OperatorReturnType;
}


export type Rule = {
    (data: any): { result: boolean; errorRule: RuleConfig | null };
    fields?: string[];
    fieldMap?: { [key: string]: boolean };
}

export interface Operator {
    inputs?: (config: RuleConfig) => string[];
    fn: OperatorFn;
    async?: boolean;
}




export interface Operators {
    [key: string]: Operator;
}

export interface GroupOperators {
    [key: string]: GroupOperatorFn;
}
