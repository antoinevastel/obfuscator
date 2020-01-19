function ifStatementToTernary(ifStatement) {
    if (ifStatement.type !== 'IfStatement') {
        return ifStatement;
    }

    let ternaryAlternate;
    // If statement may not have an alternate
    // In this case we use null as an alternate in the ternary statement
    if (!ifStatement.alternate) {
        ternaryAlternate = [{
            type: "Literal",
            value: null,
            raw: "null"
        }]
    } else {
        ternaryAlternate = ifStatement.alternate.body.map(node => {
            if (node.type === 'ExpressionStatement') {
                return node.expression;
            } else {
                return node;
            }
        })
    }

    return {
        type: "ExpressionStatement",
        expression: {
            type: "ConditionalExpression",
            test: ifStatement.test,
            consequent: {
                type: "SequenceExpression",
                expressions: ifStatement.consequent.body.map(node => {
                    if (node.type === 'ExpressionStatement') {
                        return node.expression;
                    } else {
                        return node;
                    }
                })
            },
            alternate: {
                type: "SequenceExpression",
                expressions: ternaryAlternate
            }
        }
    }
}

module.exports.ifStatementToTernary = ifStatementToTernary;