const fs = require("fs");

// Função para realizar a análise léxica (tokenização)
function lexer(input) {
  const tokens = [];
  const regex =
    /\s*(js{.*?}|[{}]|\d+(\.\d*)?|\w+|==|!=|<=|>=|&&|\|\||[+\-*/=();,.<>!])/gs;

  let match;
  let isAssignment = false; // Flag para indicar se estamos dentro de uma atribuição

  while ((match = regex.exec(input)) !== null) {
    let type = "";
    const value = match[0].trim();

    if (value.startsWith("js{") && value.endsWith("}")) {
      let start = match.index + 3;
      let jsCode = "";
      let depth = 0;

      // Itera através do conteúdo para capturar o código JS corretamente
      for (let i = start + 3; i < input.length; i++) {
        let char = input[i];

        if (char === "{") {
          depth++;
        } else if (char === "}") {
          if (depth === 0) {
            // Encontramos o fechamento correto do bloco js{}
            jsCode = input.slice(start + 3, i).trim();
            break;
          } else {
            depth--;
          }
        }
      }

      // Se encontramos o fechamento correto, adicionamos o token
      if (jsCode) {
        tokens.push({ type: "JS_CODE", value: jsCode });
      }
    } else if (/^\d/.test(value)) {
      type = value.includes(".") ? "NUMBER" : "INTEGER";
    } else if (
      value === "int" ||
      value === "float" ||
      value === "bool" ||
      value === "string"
    ) {
      type = "KEYWORD";
    } else if (value === "tree" || value === "queue" || value === "stack") {
      type = "DATA_STRUCTURE";
    } else if (value === "enqueue" || value === "dequeue") {
      type = "QueueOperation";
    } else if (value === "enstack" || value === "destack") {
      type = "stackOperation";
    } else if (
      value === "=" ||
      value === "+" ||
      value === "-" ||
      value === "*" ||
      value === "/" ||
      value === "<" ||
      value === ">" ||
      value === "==" ||
      value === "!=" ||
      value === "<=" ||
      value === ">=" ||
      value === "&&" ||
      value === "||"
    ) {
      type = "OPERATOR";
    } else if (
      value === ";" ||
      value === "," ||
      value === "." ||
      value === "{" ||
      value === "}"
    ) {
      type = "PUNCTUATION";
    } else if (value === "if" || value === "while") {
      type = "KEYWORD";
    } else {
      type = "IDENTIFIER";
    }

    // Se estamos processando uma atribuição, vamos continuar coletando tokens
    if (value === "=") {
      isAssignment = true;
      tokens.push({ type: "OPERATOR", value }); // Adiciona o "=" como operador
    } else if (value === ";") {
      if (isAssignment) {
        tokens.push({ type: "OPERATOR", value }); // Adiciona ";" como operador
        isAssignment = false; // Finaliza a atribuição
      } else {
        tokens.push({ type: "PUNCTUATION", value }); // Adiciona ";" como pontuação
      }
    } else {
      if (isAssignment) {
        // Se estamos dentro de uma atribuição, adicionamos o valor do lado direito
        let assignmentValue = value; // Inicializa a string da atribuição com o valor do token atual
        while ((match = regex.exec(input)) !== null) {
          const nextValue = match[0].trim();
          if (nextValue === ";") {
            tokens.push({ type: "Literal", value: assignmentValue.trim() });
            tokens.push({ type: "OPERATOR", value: ";" });
            break;
          } else {
            assignmentValue += " " + nextValue; // Junta os tokens, excluindo '='
          }
        }
        isAssignment = false; // Finaliza a atribuição
      } else {
        if (type != "") {
          tokens.push({ type, value }); // Adiciona os tokens normalmente
        }
      }
    }
  }

  return tokens;
}

// Função para análise sintática (suporta atribuições, if e while)
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

function tokenizeFile(fileName) {
  const input = fs.readFileSync(fileName, "utf8");
  return lexer(input);
}

function AST(tokens) {
  console.log("fffffffffffffff");
  const ast = parser(tokens);
  return ast;
}

module.exports = { lexer, tokenizeFile, AST };
