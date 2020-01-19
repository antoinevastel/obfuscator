const assert = require('assert');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const {ifStatementToTernary} = require('../src/nodes/IfStatement');

/**
 * 
 * @param {*} ast 
 * @param {*} transFunction : a transformation function to apply on all if statements
 */
function replaceIfStatements(ast, transFunction) {
    estraverse.replace(ast, {
        enter : function (node, parent) {
            if (node.type === 'IfStatement') {
                return transFunction(node)
            }
        }
    });
}

describe('Transformation on if statements', () => {
    it('if to ternary (1 var assignement in if/else (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a) {
                isTrue = true;
            } else {
                isTrue = false;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })

    it('if to ternary (1 var assignement in if/else (alternate))', () => {     
        const ast = esprima.parseScript(`
            const a = false;
            let isTrue;
            if (a) {
                isTrue = true;
            } else {
                isTrue = false;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), false);
    })

    it('if to ternary (1 array declaration in if/ 1 var assignement in else (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a) {
                isTrue = [1, 2, 3];
            } else {
                isTrue = false;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.deepEqual(eval(escodegen.generate(ast) + '\n isTrue;'), [1, 2, 3]);
    })

    it('if to ternary (1 array declaration in if/ 1 var assignement in else (alternate))', () => {     
        const ast = esprima.parseScript(`
            const a = false;
            let isTrue;
            if (a) {
                isTrue = [1, 2, 3];
            } else {
                isTrue = false;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), false);
    })

    it('if to ternary (2 var assignements in if/else (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a) {
                isTrue = true;
                isTrue = false;
            } else {
                isTrue = false;
                isTrue = true;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), false);
    })

    it('if to ternary (2 var assignements in if/else (alternate))', () => {     
        const ast = esprima.parseScript(`
            const a = false;
            let isTrue;
            if (a) {
                isTrue = true;
                isTrue = false;
            } else {
                isTrue = false;
                isTrue = true;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })

    it('if to ternary (1 var assignement + function call in if/else)', () => {     
        const ast = esprima.parseScript(`
            function f() {return true};
            const a = true;
            let isTrue;
            if (a) {
                isTrue = f();
            } else {
                isTrue = !f();
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })

    it('if to ternary (2 var assignements + function calls in if/else (consequent))', () => {     
        const ast = esprima.parseScript(`
            function f() {return true};
            const a = true;
            let isTrue;
            if (a) {
                isTrue = f();
                isTrue = !f();
            } else {
                isTrue = !f();
                isTrue = f();
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), false);
    })

    it('if to ternary (2 var assignements + function calls in if/else (alternate))', () => {     
        const ast = esprima.parseScript(`
            function f() {return true};
            const a = false;
            let isTrue;
            if (a) {
                isTrue = f();
                isTrue = !f();
            } else {
                isTrue = !f();
                isTrue = f();
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })

    it('if to ternary (consequent but no alternate, 2 var assignements (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a) {
                isTrue = true;
                isTrue = false;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), false);
    })

    it('if to ternary (consequent but no alternate, 2 var assignements (alternate))', () => {     
        const ast = esprima.parseScript(`
            const a = false;
            let isTrue;
            if (a) {
                isTrue = true;
                isTrue = false;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), undefined);
    })

    it('if to ternary (consequent but no alternate, 1 var assignement (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a) {
                isTrue = true;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })

    it('if to ternary (consequent but no alternate, 1 var assignement (alternate))', () => {     
        const ast = esprima.parseScript(`
            const a = false;
            let isTrue;
            if (a) {
                isTrue = true;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), undefined);
    })

    it('if to ternary (consequent but no alternate, 1 var assignement with ternary (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a) {
                isTrue = a ? 2 * 5 : 0 ;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), 10);
    })

    it('if to ternary (test with multiple logical expression members, consequent but no alternate, 1 var assignement (consequent))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a && 2 * 5 > 2) {
                isTrue = a ? 2 * 5 : 0 ;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), 10);
    })

    it('if to ternary (test with multiple logical expression members, consequent but no alternate, 1 var assignement (alternate))', () => {     
        const ast = esprima.parseScript(`
            const a = true;
            let isTrue;
            if (a && 2 * 5 > 100) {
                isTrue = a ? 2 * 5 : 0 ;
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), undefined);
    })

    it('if to ternary (consequent but no alternate, 1 function call (consequent))', () => {     
        const ast = esprima.parseScript(`
            let isTrue = false;
            function f() {
                isTrue = true;
            }
            const a = true;
            if (a) {
                f();
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })

    it('if to ternary (consequent but no alternate, 1 binary expression + 1 function call (consequent))', () => {     
        const ast = esprima.parseScript(`
            let isTrue = false;
            function f() {
                isTrue = true;
            }
            const a = true;
            if (a) {
                2 + 3;
                f();
            }
        `)
        
        replaceIfStatements(ast, ifStatementToTernary);
        assert.strictEqual(eval(escodegen.generate(ast) + '\n isTrue;'), true);
    })
})