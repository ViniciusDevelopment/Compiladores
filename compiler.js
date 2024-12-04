function interpret(ast) {
  const environment = {}; // Ambiente de variáveis

  // Função para avaliar uma expressão
  function evaluateExpression(expr) {
    console.log("Evaluating expression:", expr);
    if (/[+\-*/<>!=]/.test(expr.value)) {
      expr.type = "Expression";
    }

    if (expr.type === "Literal") {
      // Caso a expressão seja um valor literal, retornamos o valor numérico ou booleano
      if (expr.value === "true") return true;

      if (expr.value === "false") return false;

      return isNaN(expr.value) ? expr.value : parseFloat(expr.value); // Tenta converter para número
    } else if (expr.type === "Identifier") {
      // Caso seja um identificador (variável), retornamos o valor da variável no ambiente
      return environment[expr.value];
    } else if (expr.type === "Expression") {
      // Caso seja uma expressão de string (ex: 'x + 10')
      const expression = expr.value;

      // Substitui as variáveis pelo seu valor no ambiente
      const evaluatedExpression = expression.replace(
        /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g,
        (match) => {
          return environment[match] !== undefined ? environment[match] : match;
        }
      );

      // Avalia a expressão final usando eval
      try {
        return eval(evaluatedExpression); // Pode ser substituído por algo mais seguro em um ambiente de produção
      } catch (e) {
        throw new Error(`Erro ao avaliar a expressão: ${expression}`);
      }
    }
    return null;
  }

  // Função para interpretar atribuições
  function interpretAssignment(node) {
    const value = evaluateExpression(node.value); // Avalia a expressão à direita
    environment[node.varName] = value; // Atribui o valor calculado à variável
  }

  // Função para interpretar estruturas de dados (tree, queue, stack)
  function interpretDataStructure(node) {
    environment[node.varName] = node.values || [];
  }

  // Função para interpretar blocos de código
  function interpretBlock(block) {
    block.forEach((statement) => {
      if (statement.type === "Assignment") {
        interpretAssignment(statement);
      } else if (statement.type === "DataStructure") {
        interpretDataStructure(statement);
      } else if (statement.type === "IfStatement") {
        interpretIf(statement);
      } else if (statement.type === "WhileStatement") {
        interpretWhile(statement);
      }
    });
  }

  // Função para interpretar instruções if
  function interpretIf(statement) {
    console.log("-------------");
    console.log(statement);
    console.log("-------------");
    if (evaluateExpression(statement.condition)) {
      interpretBlock(statement.body);
    }
  }

  // Função para interpretar instruções while
  function interpretWhile(statement) {
    console.log("-------------");
    console.log(statement);
    console.log("-------------");
    while (evaluateExpression(statement.condition)) {
      console.log("TETGGGGS");
      interpretBlock(statement.body);
    }
  }

  // Interpreta o programa (AST)
  ast.forEach((node) => {
    if (node.type === "Assignment") {
      interpretAssignment(node);
    } else if (node.type === "DataStructure") {
      interpretDataStructure(node);
    } else if (node.type === "IfStatement") {
      interpretIf(node);
    } else if (node.type === "WhileStatement") {
      interpretWhile(node);
    }
  });

  return environment; // Retorna o estado final das variáveis
}

module.exports = { interpret };
