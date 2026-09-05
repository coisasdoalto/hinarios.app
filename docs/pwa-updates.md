# Atualizações do PWA

O navegador comum e o PWA instalado usam o mesmo service worker. O registro é
feito pela aplicação, com `updateViaCache: 'none'`. `/sw.js` exige revalidação
HTTP e não deve ser armazenado na CDN. O build continua gerando uma revisão
nova para as páginas precacheadas; os hinários continuam disponíveis offline.

As verificações acontecem ao abrir, recuperar a conexão, voltar à janela ou
restaurar a página, e a cada cinco minutos enquanto ela estiver visível e online.
Há um intervalo mínimo de um minuto entre tentativas, sem requisições
concorrentes nem reinício de uma instalação em andamento.

Depois da ativação de uma nova versão, aparece **Nova versão disponível** com
o botão **Atualizar**. O botão recarrega a página por escolha do usuário; nenhuma
verificação ou retorno da conexão provoca recarga automática. Isso evita
interromper o modo slide. O aviso fica abaixo da sobreposição do slide interno.

O worker também informa o ID do build para detectar páginas antigas quando a
troca de controlador aconteceu antes de a aplicação instalar seus listeners.
A primeira instalação não produz um aviso de atualização se o build coincide.

## Validação

Execute `yarn test:pwa` com Node 22 recente (suporte a `--experimental-strip-types`).
Os testes usam o runner nativo do Node e não precisam das dependências da UI.
Também fazem parte de `yarn test`.

Para validar em produção/preview:

1. Abra o build A e instale o PWA, mantendo também uma aba comum aberta.
2. Publique o build B na mesma origem. Volte à janela após um minuto ou espere
   a verificação periódica. Aguarde o término da instalação do worker.
3. Confira o aviso nas duas formas de acesso e use **Atualizar** para carregar B.
4. Repita com um popup de slides aberto: ele não deve fechar automaticamente.
5. Desconecte e reconecte a rede: o hino deve continuar disponível e a página
   não deve recarregar sozinha. Confira `/sw.js` e seus cabeçalhos no Network.

## Limites desta etapa

O precache ainda baixa todas as páginas com a revisão do build, então conexões
lentas podem demorar para concluir a atualização. Esta mudança não transforma
esse processo em download incremental. Falhas de instalação preservam o worker
anterior; novas verificações permitem outra tentativa.

Clientes que ainda executam uma versão anterior a esta mudança precisam
recebê-la pelo ciclo de atualização antigo antes de usar o novo mecanismo.
Não é possível forçar uma atualização instantânea em um dispositivo offline ou
em uma aplicação suspensa pelo sistema operacional.
