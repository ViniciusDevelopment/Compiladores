function interpret(ast) {
    const environment = {}; // Ambiente de variáveis
    
    // Função para interpretar uma expressão
    function evaluateExpression(expr) {
        if (expr.type === 'NUMBER' || expr.type === 'INTEGER') {
            return parseFloat(expr.value);
        } else if (expr.type === 'IDENTIFIER') {
            return environment[expr.value];
        }
    }

    // Função para interpretar atribuições
    function interpretAssignment(node) {
        environment[node.varName] = evaluateExpression(node.value);
    }

    // Função para interpretar estruturas de dados (tree, queue, stack)
    function interpretDataStructure(node) {
        environment[node.varName] = node.values || [];
    }

    // Função para interpretar blocos de código
    function interpretBlock(block) {
        block.forEach(statement => {
            if (statement.type === 'Assignment') {
                interpretAssignment(statement);
            } else if (statement.type === 'DataStructure') {
                interpretDataStructure(statement);
            } else if (statement.type === 'IfStatement') {
                interpretIf(statement);
            } else if (statement.type === 'WhileStatement') {
                interpretWhile(statement);
            }
        });
    }

    // Função para interpretar instruções if
    function interpretIf(statement) {
        if (evaluateExpression(statement.condition)) {
            interpretBlock(statement.body);
        }
    }

    // Função para interpretar instruções while
    function interpretWhile(statement) {
        while (evaluateExpression(statement.condition)) {
            interpretBlock(statement.body);
        }
    }

    // Interpreta o programa (AST)
    ast.forEach(node => {
        if (node.type === 'Assignment') {
            interpretAssignment(node);
        } else if (node.type === 'DataStructure') {
            interpretDataStructure(node);
        } else if (node.type === 'IfStatement') {
            interpretIf(node);
        } else if (node.type === 'WhileStatement') {
            interpretWhile(node);
        }
    });

    return environment; // Retorna o estado final das variáveis
}

module.exports = { interpret };
