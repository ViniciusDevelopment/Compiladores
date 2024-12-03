const fs = require("fs");

// Função para realizar a análise léxica (tokenização)
function lexer(input) {
  const tokens = [];
  const regex = /\s*(\d+(\.\d*)?|\w+|==|!=|<=|>=|&&|\|\||[+\-*/=(){};,.<>!])/g;
  let match;

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

    tokens.push({ type, value });
  }

  return tokens;
}

// Função para análise sintática (suporta atribuições, if e while)
function parser(tokens) {
  let index = 0;
  const variables = {};

  // Enhanced function to handle more complex expressions
  // function parseExpression() {
  //   let token = tokens[index++];

  //   if (token.type === "IDENTIFIER" || token.type === "NUMBER") {
  //     return token; // Directly return identifiers or numbers
  //   } else if (token.value === "(") {
  //     const expr = parseExpression(); // Handle expressions within parentheses
  //     if (tokens[index].value === ")") {
  //       index++; // Advance past ')'
  //     } else {
  //       throw new Error("Expected closing parenthesis ')'");
  //     }
  //     return expr;
  //   } else if (
  //     token.type === "OPERATOR" &&
  //     (token.value === "+" || token.value === "-")
  //   ) {
  //     // Handle unary expressions
  //     const expr = parseExpression();
  //     return { type: "UnaryExpression", operator: token.value, argument: expr };
  //   } else if (token.type === "OPERATOR") {
  //     // Handle binary operators
  //     const left = parseExpression();
  //     const operator = token;
  //     const right = parseExpression();
  //     return { type: "BinaryExpression", left, operator, right };
  //   }

  //   throw new Error("Unrecognized expression: " + token.value);
  // }

  function parseExpression() {
    let token = tokens[index++];

    if (token.type === "INTEGER" || token.type === "NUMBER") {
      return token; // Directly return numbers
    } else if (token.type === "IDENTIFIER") {
      return token; // Directly return identifiers
    } else if (token.value === "(") {
      const expr = parseExpression(); // Handle expressions within parentheses
      if (tokens[index].value === ")") {
        index++; // Advance past ')'
      } else {
        throw new Error("Expected closing parenthesis ')'");
      }
      return expr;
    } else if (token.type === "OPERATOR") {
      // Handle binary operators
      const left = parseExpression();
      const operator = token;
      const right = parseExpression();
      return { type: "BinaryExpression", left, operator, right };
    }

    throw new Error("Unrecognized expression: " + token.value);
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
