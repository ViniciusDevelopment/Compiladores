const lexer = require('./lexer');

// Função para verificar a sintaxe dos tokens
function parser(tokens) {
  let position = 0;

  // Função para parsear expressões (simples para esse exemplo)
  function parseExpression() {
    let token = tokens[position];
    if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
      position++;
      return { type: 'Literal', value: token.value };
    }
    throw new Error(`Unexpected token: ${token ? token.type : 'EOF'}`);
  }

  // Função para parsear declarações de variáveis
  function parseStatement() {
    let token = tokens[position];
    
    // Verificando palavras-chave para declarar variáveis
    if (token.type === 'KEYWORD' && ['int', 'float', 'bool', 'string'].includes(token.value)) {
      const type = token.value;
      position++; // Consome a palavra-chave (int, float, etc.)
      
      let varName = tokens[position];
      if (varName.type !== 'IDENTIFIER') {
        throw new Error(`Expected identifier, found: ${varName.type}`);
      }
      position++; // Consome o identificador (nome da variável)
      
      let equals = tokens[position];
      if (equals.type !== 'OPERATOR' || equals.value !== '=') {
        throw new Error(`Expected '=', found: ${equals.type}`);
      }
      position++; // Consome o sinal de igual (=)
      
      let expr = parseExpression();

      let semicolon = tokens[position];
      if (semicolon.type !== 'PUNCTUATION' || semicolon.value !== ';') {
        throw new Error(`Expected ';', found: ${semicolon.type}`);
      }
      position++; // Consome o ponto e vírgula (;)

      return {
        type: 'VariableDeclaration',
        name: varName.value,
        value: expr,
        dataType: type
      };
    }

    // Verificando instruções if
    if (token.type === 'KEYWORD' && token.value === 'if') {
      position++; // Consome 'if'
      
      let openParen = tokens[position];
      if (openParen.type !== 'PUNCTUATION' || openParen.value !== '(') {
        throw new Error(`Expected '(', found: ${openParen.type}`);
      }
      position++; // Consome '('

      let condition = parseExpression();

      let closeParen = tokens[position];
      if (closeParen.type !== 'PUNCTUATION' || closeParen.value !== ')') {
        throw new Error(`Expected ')', found: ${closeParen.type}`);
      }
      position++; // Consome ')'

      let blockStart = tokens[position];
      if (blockStart.type !== 'PUNCTUATION' || blockStart.value !== '{') {
        throw new Error(`Expected '{', found: ${blockStart.type}`);
      }
      position++; // Consome '{'

      let statements = [];
      while (tokens[position] && tokens[position].value !== '}') {
        statements.push(parseStatement());
      }

      let blockEnd = tokens[position];
      if (blockEnd.type !== 'PUNCTUATION' || blockEnd.value !== '}') {
        throw new Error(`Expected '}', found: ${blockEnd.type}`);
      }
      position++; // Consome '}'

      return {
        type: 'IfStatement',
        condition,
        statements
      };
    }

    throw new Error(`Unexpected token: ${token ? token.type : 'EOF'}`);
  }

  // Função para parsear o programa completo
  function parseProgram() {
    let statements = [];
    while (position < tokens.length) {
      statements.push(parseStatement());
    }
    return { type: 'Program', body: statements };
  }

  return parseProgram();
}

module.exports = parser;
