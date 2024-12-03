const { tokenizeFile } = require('./lexer');

const fileName = 'code.txt'; // Certifique-se de que o arquivo code.txt está na mesma pasta

try {
  const tokens = tokenizeFile(fileName);
  console.log('Tokens:', tokens);
} catch (error) {
  console.error('Erro ao analisar o arquivo:', error.message);
}
