const fs = require('fs');

// Palavras-chave da linguagem
const KEYWORDS = ['int', 'float', 'bool', 'string', 'if', 'while'];
// Operadores
const OPERATORS = ['+', '-', '*', '/', '=', '<', '>', '==', '!='];
// Pontuações
const PUNCTUATIONS = [';', '(', ')', '{', '}'];

// Função que realiza a análise léxica
function lexer(input) {
  let tokens = [];
  let current = 0;

  // Itera sobre cada caractere do código
  while (current < input.length) {
    let char = input[current];

    // Ignora espaços em branco e quebras de linha
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    // Identifica números (inteiros ou flutuantes)
    if (/\d/.test(char)) {
      let value = '';
      while (/\d/.test(char)) {
        value += char;
        char = input[++current];
      }
      // Verifica se é um número flutuante
      if (char === '.') {
        value += char;
        char = input[++current];
        while (/\d/.test(char)) {
          value += char;
          char = input[++current];
        }
      }
      tokens.push({ type: 'NUMBER', value });
      continue;
    }

    // Identifica strings (aspas duplas ou simples)
    if (char === '"' || char === "'") {
      let value = '';
      char = input[++current]; // Avança para o primeiro caractere dentro da string
      while (char !== '"' && char !== "'" && current < input.length) {
        value += char;
        char = input[++current];
      }
      if (char === '"' || char === "'") { // Verifica se a string foi fechada corretamente
        tokens.push({ type: 'STRING', value });
        current++; // Avança após o fechamento da string
      } else {
        throw new Error(`Unterminated string literal.`);
      }
      continue;
    }

    // Identifica identificadores (variáveis, funções, etc.)
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (/[a-zA-Z0-9_]/.test(char)) {
        value += char;
        char = input[++current];
      }
      if (KEYWORDS.includes(value)) {
        tokens.push({ type: 'KEYWORD', value });
      } else {
        tokens.push({ type: 'IDENTIFIER', value });
      }
      continue;
    }

    // Identifica operadores
    if (OPERATORS.includes(char)) {
      let operator = char;
      char = input[++current];
      // Verifica operadores de dois caracteres
      if (operator === '=' && input[current] === '=') {
        operator += '=';
        current++;
      } else if (operator === '!' && input[current] === '=') {
        operator += '=';
        current++;
      }
      tokens.push({ type: 'OPERATOR', value: operator });
      continue;
    }

    // Identifica pontuações (ponto e vírgula, parênteses, chaves)
    if (PUNCTUATIONS.includes(char)) {
      tokens.push({ type: 'PUNCTUATION', value: char });
      current++;
      continue;
    }

    // Erro caso o caractere não seja identificado
    throw new Error(`Unexpected character: '${char}' at position ${current}`);
  }

  return tokens;
}

// Função para ler e tokenizar o arquivo de código
function tokenizeFile(fileName) {
  const code = fs.readFileSync(fileName, 'utf-8');
  return lexer(code);
}

module.exports = { lexer, tokenizeFile };
