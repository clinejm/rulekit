import { defaultOperators, getValue, defaultInputs, fieldOnlyInput } from './defaultOperators';

import { GroupOperatorFn, RuleConfig, CompiledRule, DefaultOperators, OperatorFn } from './types';

const _executeAnd: GroupOperatorFn = async (data, rules) => {
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

const _executeOr: GroupOperatorFn = async (data, rules, rulesConfig) => {
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


const groupOperators: DefaultOperators = {
    or: _executeOr,
    and: _executeAnd
}

const NOT = (op: OperatorFn): OperatorFn => ((data, config) => (!op(data, config)));

const compileGroup = (rules: RuleConfig, operators: DefaultOperators, ruleFields: {}, defaultField: string): OperatorFn | undefined => {
    const cmp: CompiledRule[] = [];
    let fn = groupOperators[rules.operator];
    if (!fn || !rules.rules) {
        return;
    }
    rules.rules.forEach(ruleConf => {
        let rule = ruleConf;
        let operator = operators[rule.operator];

        let op: OperatorFn | undefined = operator?.fn;


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

    const runner = (data: any) => fn(data, cmp, rules);
    return runner;
}

type CompileProps = {
    rules: RuleConfig | RuleConfig[],
    operators?: DefaultOperators,
    defaultField?: string
}

const compile = ({ rules, operators = defaultOperators, defaultField }: CompileProps) => {
    const ruleFields = {};
    const rule = compileGroup(Array.isArray(rules) ? { operator: 'and', rules } : rules, operators, ruleFields, defaultField);
    rule.fields = Object.keys(ruleFields);
    return rule;
}

export { compile, defaultOperators, getValue, defaultInputs, fieldOnlyInput };

