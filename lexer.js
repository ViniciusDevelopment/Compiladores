const fs = require("fs");

// Função para realizar a análise léxica (tokenização)
function lexer(input) {
  const tokens = [];
  const regex = /\s*(\d+(\.\d*)?|\w+|==|!=|<=|>=|&&|\|\||[+\-*/=(){};,.<>!])/g;
  let match;
  let isAssignment = false; // Flag para indicar se estamos dentro de uma atribuição

  while ((match = regex.exec(input)) !== null) {
    let type = "";
    const value = match[0].trim();

    // Identifica o tipo do token
    if (/^\d/.test(value)) {
      type = value.includes(".") ? "NUMBER" : "INTEGER";
    } else if (
      value === "int" ||
      value === "float" ||
      value === "bool" ||
      value === "string"
    ) {
      type = "KEYWORD";
    } else if (value === "tree" || value === "queue" || value === "stack") {
      type = "DATA_STRUCTURE"; // Reconhece as estruturas de dados
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
        tokens.push({ type, value }); // Adiciona os tokens normalmente
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

    // console.log("token");
    // console.log(token);

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
    } else if (token.type === "IDENTIFIER") {
      return { type: "Identifier", name: token.value }; // Retorna diretamente identificadores
    } else if (token.value === "(") {
      // Lida com expressões entre parênteses
      const expr = parseExpression();
      if (tokens[index] && tokens[index].value === ")") {
        index++; // Avança após ')'
      } else {
        throw new Error("Expected closing parenthesis ')'");
      }
      return expr;
    } else if (token.type === "OPERATOR") {
      // Se encontrar um operador, tenta formar uma expressão binária
      const left = parseExpression(); // Captura a expressão à esquerda
      const operator = token; // O operador
      const right = parseExpression(); // Captura a expressão à direita
      return { type: "BinaryExpression", left, operator, right };
    } else if (token.type === "ASSIGNMENT") {
      return { type: "Assignment", value: token.value };
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
    index++; // Avança pelo 'if'
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
    // console.log("QQQQQ")
    // console.log("1: "+ varType)
    // console.log("2: "+ varName)
    // console.log("3: "+ operator)
    let value = parseExpression(); // Ex: 'x + 10'
    // console.log("4: "+ value)

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

  function parseDataStructure() {
    const dataType = tokens[index++].value; // Ex: 'tree', 'queue', 'stack'
    const varName = tokens[index++].value; // Ex: 'arvore', 'fila', 'pilha'
    let values = [];
    if (tokens[index].value === "=") {
      index++; // Avança pelo '='
      if (tokens[index].value === "[") {
        index++; // Avança pelo '['
        while (tokens[index] && tokens[index].value !== "]") {
          values.push(parseExpression().value);
        }
        index++; // Fecha o ']'
      }
    }
    return {
      type: "DataStructure",
      dataType,
      varName,
      values,
    };
  }

  function parseStatement() {
    if (tokens[index].type === "KEYWORD") {
      if (tokens[index].value === "if") {
        return parseIfStatement();
      } else if (tokens[index].value === "while") {
        return parseWhileStatement();
      } else {
        return parseAssignment();
      }
    } else if (tokens[index].type === "DATA_STRUCTURE") {
      return parseDataStructure(); // Adiciona o suporte para as estruturas de dados
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
