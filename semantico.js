const fs = require('fs');

// Tabela de símbolos para armazenar as variáveis e seus tipos
const symbolTable = {};

// Função para verificar se o valor atribuído corresponde ao tipo da variável
function checkTypeCompatibility(variableType, value) {
    console.log("symbolTable")
    console.log(symbolTable)    
    console.log("value")
    console.log(value)
  // Verifica o tipo para int
  if(variableType === 'int' && symbolTable[value] !== undefined){
    value = symbolTable[value].value;
  }
  if(variableType === 'float' && symbolTable[value] !== undefined){
    value = symbolTable[value].value;
  }
  if (variableType === 'int' && isNaN(parseInt(value))) {
    return false; // O valor não pode ser convertido para um int
  }
  
  // Verifica o tipo para float
  if (variableType === 'float' && isNaN(parseFloat(value)) && value !== " (") {
    console.log("ghghghg")
    console.log(value)
    return false; // O valor não pode ser convertido para um float
  }
  // Verifica o tipo para bool
  if (variableType === 'bool' && (value !== ' true' && value !== ' false')) {
    return false; // O valor não é um booleano válido
  }
  // Verifica o tipo para string
  if (variableType === 'string' && typeof value !== 'string') {
    return false; // O valor não é uma string
  }
  return true;
}

function processDeclarationsAndAssignments(tokens) {
    let i = 0;
    const errors = [];
  
    while (i < tokens.length) {
      const token = tokens[i];
  
      if (token.type === 'KEYWORD') {
        const type = token.value; // tipo da variável (int, float, etc.)
        const name = tokens[i + 1].value; // nome da variável
        const operator = tokens[i + 2].value; // operador '='
        let value = tokens[i + 3].value; // valor a ser atribuído
  

          symbolTable[name] = { type: type, value: null, declared: true };
        
  
        // Se o valor for uma expressão, tenta calcular
        if (value && (value.includes('+') || value.includes('-') || value.includes('*') || value.includes('/'))) {
          try {
            value = eval(value); // Avalia a expressão matemática
          } catch (error) {
            errors.push(`Error evaluating expression for variable "${name}": ${error.message}`);
            i += 4;
            continue;
          }
        }
  
        // Verifica a compatibilidade do tipo
        if (!checkTypeCompatibility(type, value)) {
          errors.push(`Cannot assign value of type "${typeof value}" to ${type} variable "${name}".`);
        } else {
          symbolTable[name].value = value; // Atribui o valor
        }
  
        i += 4; // Avança para o próximo conjunto de tokens
      } else {
        i++;
      }
    }
  
    return errors;
  }

// Função de tokenização
function tokenize(input) {
  const regex = /\s*(=>|[-+*/()=<>,;{}]|\b(?:int|float|bool|string)\b|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+(?:\.[0-9]+)?|\S)/g;
  const tokens = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    const value = match[0];
    let type = 'UNKNOWN';

    if (/\b(int|float|bool|string)\b/.test(value)) {
      type = 'KEYWORD'; // Tipo de variável (int, float, bool, etc.)
    } else if (/^[a-zA-Z_][a-zA10-9_]*$/.test(value)) {
      type = 'IDENTIFIER'; // Identificador (nome da variável)
    } else if (/^\d+\.\d+$/.test(value)) {
      type = 'NUMBER'; // Número de ponto flutuante
    } else if (/^\d+$/.test(value)) {
      type = 'NUMBER'; // Número inteiro
    } else if (/^".*"$/.test(value)) {
      type = 'STRING'; // String entre aspas
    } else if (/^(true|false)$/.test(value)) {
      type = 'BOOL'; // Booleano
    }

    tokens.push({ type, value });
  }

  return tokens;
}

// Função para verificar erros semânticos
function semantico(input) {
  const tokens = tokenize(input);
  const errors = processDeclarationsAndAssignments(tokens);

  return errors.length > 0 ? errors : 'No semantic errors found.';
}

// Função para processar o arquivo e verificar os erros
function ErrosFile(fileName) {
  const input = fs.readFileSync(fileName, 'utf8');
  const lines = input.split('\n'); // Divida o conteúdo do arquivo em linhas
  let allErrors = [];

  // Processar cada linha do arquivo
  lines.forEach((line, index) => {
    const lineErrors = semantico(line);
    if (lineErrors !== 'No semantic errors found.') {
      allErrors.push(`Line ${index + 1}: ${lineErrors}`);
    }
  });

  return allErrors.length > 0 ? allErrors : 'No semantic errors found.';
}

module.exports = { semantico, ErrosFile };
