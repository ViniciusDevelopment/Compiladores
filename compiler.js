function interpret(ast) {
    const environment = {}; // Ambiente de variáveis
    
    // Função para avaliar uma expressão
    function evaluateExpression(expr) {
        if (expr.type === 'NUMBER' || expr.type === 'INTEGER') {
            return parseFloat(expr.value); // Retorna o valor numérico
        } else if (expr.type === 'IDENTIFIER') {
            return environment[expr.value]; // Retorna o valor da variável
        } else if (expr.type === 'OPERATOR') {
            const left = evaluateExpression(expr.left);
            const right = evaluateExpression(expr.right);
            
            // Avalia operações matemáticas
            switch (expr.value) {
                case '+':
                    return left + right;
                case '-':
                    return left - right;
                case '*':
                    return left * right;
                case '/':
                    return left / right;
                case '<':
                    return left < right;
                default:
                    throw new Error(`Operador desconhecido: ${expr.value}`);
            }
        }
    }

    // Função para interpretar uma atribuição
    function interpretAssignment(node) {
        const value = evaluateExpression(node.value);
        environment[node.varName] = value; // Atribui o valor calculado à variável
    }

    // Função para interpretar estruturas de dados (tree, queue, stack)
    function interpretDataStructure(node) {
        environment[node.varName] = node.values || []; // Inicializa a estrutura de dados como um array vazio
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
