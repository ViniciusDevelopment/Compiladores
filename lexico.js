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
    } else if (value === "addNode") {
      type = "TreeOperation";
    } else if (value === "enqueue" || value === "dequeue") {
      type = "QueueOperation";
    }else if (value === "enstack" || value === "destack") {
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

function tokenizeFile(fileName) {
  const input = fs.readFileSync(fileName, "utf8");
  return lexer(input);
}


module.exports = { lexer, tokenizeFile };
