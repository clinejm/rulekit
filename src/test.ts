import {
    defaultOperators,
    getValue,
    defaultInputs,
    fieldOnlyInput,
    Operator,
} from './defaultOperators';

import { GroupOperatorFn, RuleConfig, CompiledRule, DefaultOperators } from './types';


const _executeAnd: GroupOperatorFn = async (data, rules, rulesConfig) => {
    let isTrue = true;
    let errorRule: RuleConfig | null = null;

    for (const rule of rules) {
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
        result: isTrue,
        errorRule,
    };
};

const _executeOr: GroupOperatorFn = async (data, rules, rulesConfig) => {
    let isTrue = false;
    let errorRule = rulesConfig;

    for (const rule of rules) {
        const result = await rule.op(data, rule.config);

        if (result === true || result.result === true) {
            isTrue = true;
            errorRule = null;
            break;
        }
    }

    return {
        result: isTrue,
        errorRule,
    };
};

const groupOperators: Record<string, GroupOperatorFn> = {
    or: _executeOr,
    and: _executeAnd,
};

const NOT = (op: GroupOperatorFn): GroupOperatorFn => (
    (data, config) => op(data, config).then(result => !result)
);

const compileGroup = (
    rules: RuleConfig,
    operators: Record<string, Operator>,
    ruleFields: Record<string, boolean>,
    defaultField?: string
): GroupOperatorFn => {
    const cmp: CompiledRule[] = [];
    const fn = groupOperators[rules.operator];

    if (!fn) {
        throw new Error(`Group operator not found: ${rules.operator}`);
    }

    rules.rules.forEach((ruleConf) => {
        let rule = ruleConf;
        const operator = operators[rule.operator];

        let op = operator?.fn;

        if (defaultField && !rule.field) {
            rule = { ...ruleConf, field: defaultField };
        }

        if (rule.rules) {
            op = compileGroup(rule, operators, ruleFields, defaultField);
        }

        if (op) {
            if (rule.not === true) {
                op = NOT(op);
            }

            if (operator && operator.inputs) {
                const fields = operator.inputs(rule);

                if (fields) {
                    fields.forEach((item) => (ruleFields[item] = true));
                }
            }

            cmp.push({ op, config: rule });
        } else {
            console.error('Operator not found for rule ', rule);
        }
    });

    const runner: GroupOperatorFn = (data) => fn(data, cmp, rules);
    return runner;
}

const compile = ({ rules, operators = defaultOperators, defaultField }: { rules: RuleConfig | RuleConfig[], operators?: DefaultOperators, defaultField?: string }) => {
    const ruleFields = {};
    const rule = compileGroup(Array.isArray(rules) ? { operator: 'and', rules } : rules, operators, ruleFields, defaultField);
    rule.fields = Object.keys(ruleFields);
    return rule;
}

export { compile, defaultOperators, getValue, defaultInputs, fieldOnlyInput };

