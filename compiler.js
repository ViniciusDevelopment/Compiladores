function interpret(ast) {
  const environment = {};

  function initializeTree(name, values) {
    // Inicializa a árvore com o nó raiz
    environment[name] = {
      type: "tree",
      data: { value: parseFloat(values[0]), children: [] }
    };
  }
  

  function initializeQueue(name, values) {
    environment[name] = {
      type: "queue",
      data: values || [],
    };
  }
  function initializeStack(name, values) {
    environment[name] = {
      type: "stack",
      data: values || [],
    };
  }

  function executeTreeOperation(op) {
    let tree = environment[op.target];
  
    if (!tree || tree.type !== "tree") {
      throw new Error(`Árvore "${op.target}" não encontrada ou não é uma árvore.`);
    }
  
    if (op.operation === "addNode") {
      const parentValue = parseFloat(op.values[0].value);
      const newValue = parseFloat(op.values[1].value);
  
      function addNodeToTree(node, parentValue, newValue) {
        if (node.value === parentValue) {
          if (!node.children) {
            node.children = [];
          }
          node.children.push({ value: newValue, children: [] });
          return true;
        }
  
        if (node.children) {
          for (let child of node.children) {
            if (addNodeToTree(child, parentValue, newValue)) {
              return true;
            }
          }
        }
        return false;
      }
  
      if (!addNodeToTree(tree.data, parentValue, newValue)) {
        throw new Error(`Nó pai "${parentValue}" não encontrado.`);
      }
    }
    console.log("Árvore após a operação:", JSON.stringify(tree, null, 2));

    environment[op.target] = tree; // Atualiza a árvore no ambiente
    return;
  }
  
  function executeQueueOperation(op) {
    const queue = environment[op.target];

    if (!queue || queue.type !== "queue") {
      throw new Error(`fila "${op.target}" não encontrada ou não é uma fila.`);
    }
    if (op.operation === "enqueue") {
      const value = evaluateExpression(op.value);

      queue.data.push(value);
    } else if (op.operation === "dequeue") {
      if (queue.data.length === 0) {
        throw new Error(`Fila "${op.target}" está vazia.`);
      }
      queue.data.shift();
    }
    return;
  }
  function executeStackOperation(op) {
    const stack = environment[op.target];
    if (!stack || stack.type !== "stack") {
      throw new Error(
        `pilha "${op.target}" não encontrada ou não é uma pilha.`
      );
    }
    if (op.operation === "enstack") {
      const value = evaluateExpression(op.value);

      stack.data.push(value);
    } else if (op.operation === "destack") {
      if (stack.data.length === 0) {
        throw new Error(`Fila "${op.target}" está vazia.`);
      }
      stack.data.pop();
    }
    return;
  }

  function evaluateExpression(expr) {
    if (expr.type === "Literal") {
      return expr.value;
    }
  }

  for (const node of ast) {
    if (node.type === "DataStructure" && node.dataType === "queue") {
      initializeQueue(node.varName, node.values);
    } else if (node.type === "DataStructure" && node.dataType === "stack") {
      initializeStack(node.varName, node.values);
    }else if (node.type === "DataStructure" && node.dataType === "tree") {
      initializeTree(node.varName, node.values);
    } else if (node.type === "TreeOperation") {
      executeTreeOperation(node);
    } else if (node.type === "QueueOperation") {
      executeQueueOperation(node);
    } else if (node.type === "stackOperation") {
      executeStackOperation(node);
    }
  }

  function evaluateExpression(expr) {
    if (expr.type === "JavaScriptCode") {
      try {
        return eval(expr.value); // Nota: `eval` deve ser usado com cuidado!
      } catch (error) {
        throw new Error(`Erro ao executar código JS: ${expr.value}`);
      }
    }
    //console.log("Evaluating expression:", expr);
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
  ast.forEach((node) => {
    if (node.type === "JavaScriptCode") {
      evaluateExpression(node);
    } else if (node.type === "Assignment") {
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
