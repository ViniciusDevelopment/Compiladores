function parser(tokens) {
    let index = 0;
    const variables = {};
  
    function parseExpression() {
      let token = tokens[index++];
  
      // Ignorar palavras-chave de tipo (int, float, bool, string)
      while (
        token &&
        token.type === "KEYWORD" &&
        (token.value === "int" ||
          token.value === "float" ||
          token.value === "bool" ||
          token.value === "string")
      ) {
        token = tokens[index++];
      }
  
      // Ignorar palavras-chave de estruturas de dados (tree, queue, stack)
  
      while (
        token &&
        token.type === "DATA_STRUCTURE" &&
        (token.value === "tree" ||
          token.value === "queue" ||
          token.value === "stack")
      ) {
        token = tokens[index++];
      }
  
      if (token.type === "IDENTIFIER" && tokens[index] && tokens[index].value === '.') {
        const treeName = token.value;  // Ex: "arvore"
        index++;  // Avança para o próximo token (o ".")
        const operation = tokens[index++].value;  // Ex: "addNode"
        if (operation === "addNode") {
          // Avança até os parâmetros do addNode
          const nodeValue1 = parseExpression();  // Ex: 10
          const nodeValue2 = parseExpression();  // Ex: 20
          if (tokens[index].value === ";") {
            index++; // Avança após o ponto e vírgula
          }
          return {
            type: "TreeOperation",
            operation: "addNode",
            tree: treeName,
            values: [nodeValue1, nodeValue2],
          };
        }
      }
  
      if (token.type === "JS_CODE") {
        // Retorna um nó de JavaScript para a árvore de sintaxe abstrata (AST)
        return {
          type: "JavaScriptCode",
          value: token.value, // Código JS literal
        };
      }
      // Caso de atribuição: token 'x = 5'
      if (
        token.type === "IDENTIFIER" &&
        tokens[index] &&
        tokens[index].value === "="
      ) {
        const identifier = token;
        const operator = tokens[index++]; // Avança após o '='
        const right = parseExpression(); // Parte à direita da atribuição
        return {
          type: "AssignmentExpression",
          left: identifier,
          operator,
          right,
        };
      }
  
      // Verifica se o token é um número ou identificador
      if (
        token.type === "INTEGER" ||
        token.type === "NUMBER" ||
        token.type === "Literal"
      ) {
        return { type: "Literal", value: token.value }; // Retorna diretamente números
      } else if (token.value === "(") {
        const expr = parseExpression();
        const operator = tokens[index].value;
        const right = tokens[index + 1].value;
        const value = expr.value + operator + right;
  
        // Lida com expressões entre parênteses
        if (tokens[index] && tokens[index + 2].value === ")") {
          index = index + 3; // Avança após ')'
        } else {
          throw new Error("Expected closing parenthesis ')'");
        }
        return { type: "Expression", value };
      } else if (token.type === "OPERATOR") {
        // Se encontrar um operador, tenta formar uma expressão binária
        const left = parseExpression(); // Captura a expressão à esquerda
        const operator = token; // O operador
        const right = parseExpression(); // Captura a expressão à direita
        return { type: "BinaryExpression", left, operator, right };
      } else if (token.type === "ASSIGNMENT") {
        return { type: "Assignment", value: token.value };
      } else if (token.type === "IDENTIFIER") {
        return { type: "IDENTIFIER", value: token.value }; // Retorna diretamente identificadores
      }
  
      throw new Error(
        "Unrecognized expression: " + (token ? token.value : "undefined")
      );
    }
  
    function parseBlock() {
      const block = [];
  
      if (tokens[index].value === "{") {
        index++; // Avança para dentro do bloco
        while (tokens[index] && tokens[index].value !== "}") {
          block.push(parseStatement());
        }
        index++; // Fecha o bloco
      }
      return block;
    }
  
    function parseIfStatement() {
      // Avança pelo 'if'
      index++;
      const condition = parseExpression(); // Condição do if
  
      const body = parseBlock();
      return {
        type: "IfStatement",
        condition,
        body,
      };
    }
  
    function parseWhileStatement() {
      index++; // Avança pelo 'while'
      const condition = parseExpression(); // Condição do while
      const body = parseBlock();
  
      return {
        type: "WhileStatement",
        condition,
        body,
      };
    }
  
    function parseAssignment() {
      const varType = tokens[index++].value; // Ex: 'int'
      const varName = tokens[index++].value; // Ex: 'x'
      const operator = tokens[index++].value; // Ex: '='
      let value = parseExpression(); // Ex: 'x + 10'
  
      if (tokens[index].value === ";") {
        index++; // Avança o ponto de leitura para o ponto e vírgula
      }
  
      return {
        type: "Assignment",
        varType,
        varName,
        operator,
        value,
      };
    }
  
    function parseTreeOperation(varName) {
      const operation = tokens[index++].value; // Pega a operação, ex: "addNode"
      if (operation === "addNode") {
        index++; // Avança após "addNode"
        const values = []; // Array para armazenar os valores dos nós
    
        // Continua pegando valores até encontrar um ponto e vírgula
        while (tokens[index] && tokens[index].value !== ";") {
          const value = parseExpression(); // Pega o valor do nó
          values.push(value); // Adiciona o valor ao array
          if (tokens[index] && tokens[index].value === ",") {
            index++; // Avança após a vírgula
          }
        }
    
        if (tokens[index] && tokens[index].value === ";") {
          index++; // Avança após o ponto e vírgula
        }
    
        return {
          type: "TreeOperation",
          operation: "addNode",
          target: varName,
          values, // Retorna todos os valores capturados
        };
  
      }
      throw new Error(`Operação desconhecida para árvore: ${operation}`);
    }
    
  
    function parseQueueOperation(varName) {
      const operation = tokens[index++].value; // Pega a operação, ex: "enqueue" ou "dequeue"
      if (operation === "enqueue") {
        index++;
        const value = parseExpression(); // Pega o valor a ser enfileirado
        return {
          type: "QueueOperation",
          operation: "enqueue",
          target: varName,
          value,
        };
      } else if (operation === "dequeue") {
        return {
          type: "QueueOperation",
          operation: "dequeue",
          target: varName,
        };
      }
      throw new Error(`Operação desconhecida para fila: ${operation}`);
    }
    function parseStackOperation(varName) {
      const operation = tokens[index++].value; // Pega a operação, ex: "enqueue" ou "dequeue"
      if (operation === "enstack") {
        index++;
        const value = parseExpression(); // Pega o valor a ser enfileirado
        return {
          type: "stackOperation",
          operation: "enstack",
          target: varName,
          value,
        };
      } else if (operation === "destack") {
        return {
          type: "stackOperation",
          operation: "destack",
          target: varName,
        };
      }
      throw new Error(`Operação desconhecida para fila: ${operation}`);
    }
  
    function parseDataStructure() {
      const dataType = tokens[index++].value;
      const varName = tokens[index++].value;
      let values = [];
      let data;
      if (tokens[index]?.value === "=") {
        index++;
  
        values.push(tokens[index++].value);
        data = values[0]
          .split(",")
          .map((num) => num.trim())
          .map(Number);
      }
  
      return {
        type: "DataStructure",
        dataType,
        varName,
        values: data,
      };
    }
  
    function parsejs() {
      return parseExpression();
    }
  
    function parseStatement() {
      if (tokens[index].type === "JS_CODE") {
        return parsejs();
      } else if (tokens[index].type === "KEYWORD") {
        if (tokens[index].value === "if") {
          return parseIfStatement();
        } else if (tokens[index].value === "while") {
          return parseWhileStatement();
        } else {
          return parseAssignment();
        }
      } else if (tokens[index].type === "DATA_STRUCTURE") {
        return parseDataStructure();
      } else if (tokens[index].type === "QueueOperation") {
        return parseQueueOperation(tokens[index - 2].value);
      } else if (tokens[index].type === "TreeOperation") {
        return parseTreeOperation(tokens[index - 2].value);
      } else if (tokens[index].type === "stackOperation") {
        return parseStackOperation(tokens[index - 2].value);
      } else if (
        tokens[index].type === "PUNCTUATION" &&
        tokens[index].value === ";"
      ) {
        index++; // Ignora o ';'
      } else {
        index++; // Ignora tokens desconhecidos
      }
    }
  
    function parseProgram() {
      const program = [];
      while (index < tokens.length) {
        const statement = parseStatement();
        if (statement) program.push(statement);
      }
      return program;
    }
  
    return parseProgram();
  }
  
  // Função para imprimir a árvore de sintaxe
  function printAST(ast) {
    function traverse(node, indent = "") {
      console.log(`${indent}${node.type}:`);
      for (const key in node) {
        if (key !== "type") {
          const value = node[key];
          if (Array.isArray(value)) {
            console.log(`${indent}  ${key}:`);
            value.forEach((child) => traverse(child, indent + "    "));
          } else if (typeof value === "object" && value !== null) {
            console.log(`${indent}  ${key}:`);
            traverse(value, indent + "  ");
          } else {
            console.log(`${indent}  ${key}: ${value}`);
          }
        }
      }
    }
    ast.forEach((node) => traverse(node));
  }


  function AST(tokens) {
    const ast = parser(tokens);
    return ast;
  }

  module.exports = { AST };