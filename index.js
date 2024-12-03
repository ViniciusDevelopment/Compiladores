const { tokenizeFile, AST } = require('./lexer');
const { interpret } = require('./compiler');  // Supondo que o código de interpretação esteja em 'interpreter.js'

const fileName = 'code.txt'; // Certifique-se de que o arquivo code.txt está na mesma pasta

try {
  const tokens = tokenizeFile(fileName);
  console.log('Tokens:', tokens);
  const ast = AST(tokens);

  // Executar o código interpretado
  console.log("ast");
  console.log(ast);
  const finalEnvironment = interpret(ast); // Armazenar o estado final das variáveis

  // Mostrar o estado final das variáveis
  console.log('Estado final das variáveis:', finalEnvironment);

} catch (error) {
  console.error('Erro ao analisar o arquivo:', error.message);
}
