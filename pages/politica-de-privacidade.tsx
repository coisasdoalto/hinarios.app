import { CONTACT_EMAIL } from 'contants';
import Head from 'next/head';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Política de Privacidade | Hinários</title>
      </Head>

      <h3 id="politica-de-privacidade-do-hinarios-app">Política de Privacidade do hinarios.app</h3>
      <p>
        <strong>Última atualização: 22/06/2024</strong>
      </p>
      <p>
        No hinarios.app, a sua privacidade é uma prioridade. Esta Política de Privacidade descreve
        como coletamos, usamos e protegemos suas informações pessoais ao acessar e utilizar nosso
        site.
      </p>
      <h4 id="1-informacoes-que-coletamos">1. Informações que Coletamos</h4>
      <p>
        <strong>1.1 Informações Pessoais:</strong> Não coletamos informações pessoais identificáveis
        a menos que você as forneça voluntariamente. Isso pode incluir, mas não se limita a, nome,
        endereço de e-mail e outras informações de contato quando você se inscreve em nosso serviço
        ou entra em contato conosco.
      </p>
      <p>
        <strong>1.2 Informações de Uso:</strong> Coletamos automaticamente informações sobre suas
        interações com o nosso site. Isso pode incluir seu endereço IP, tipo de navegador, páginas
        visitadas, tempo gasto nas páginas e outras estatísticas relacionadas à sua navegação.
      </p>
      <p>
        <strong>1.3 Cookies e Tecnologias Semelhantes:</strong> Usamos cookies e tecnologias
        semelhantes para coletar informações sobre o uso do nosso site e para melhorar a experiência
        do usuário. Um cookie é um pequeno arquivo de dados armazenado em seu dispositivo.
        Utilizamos cookies por meio de uma ferramenta de pesquisa de UX para entender melhor como
        você interage com nosso site e melhorar nossos serviços.
      </p>
      <h4 id="2-como-usamos-suas-informacoes">2. Como Usamos Suas Informações</h4>
      <p>
        <strong>2.1 Para Operar e Melhorar o Site:</strong> Usamos as informações coletadas para
        operar, manter e melhorar nossos serviços e funcionalidades do site. Isso inclui a
        personalização de conteúdo e a realização de análises para entender melhor nossos usuários.
      </p>
      <p>
        <strong>2.2 Para Comunicação:</strong> Se você nos fornecer suas informações de contato,
        podemos usar essas informações para enviar comunicações sobre atualizações, newsletters,
        ofertas promocionais e outras informações relacionadas ao Hinarios.app.
      </p>
      <p>
        <strong>2.3 Para Pesquisa e Análise:</strong> As informações coletadas através de cookies e
        tecnologias semelhantes são usadas para fins de pesquisa e análise, ajudando-nos a entender
        melhor o comportamento dos usuários e a melhorar a experiência no site.
      </p>
      <h4 id="3-compartilhamento-de-informacoes">3. Compartilhamento de Informações</h4>
      <p>
        Não vendemos, trocamos ou de outra forma transferimos para terceiros suas informações
        pessoais identificáveis. Podemos compartilhar informações agregadas e anônimas com nossos
        parceiros e anunciantes para fins de análise e marketing.
      </p>
      <h4 id="4-seguranca-das-informacoes">4. Segurança das Informações</h4>
      <p>
        Implementamos medidas de segurança apropriadas para proteger suas informações pessoais
        contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método
        de transmissão pela internet ou método de armazenamento eletrônico é 100% seguro.
      </p>
      <h4 id="5-seus-direitos">5. Seus Direitos</h4>
      <p>
        Você tem o direito de acessar, corrigir ou excluir suas informações pessoais que coletamos.
        Para exercer esses direitos, entre em contato conosco através do e-mail{' '}
        <strong>{CONTACT_EMAIL}</strong>.
      </p>
      <h4 id="6-alteraces-nesta-politica-de-privacidade">
        6. Alterações nesta Política de Privacidade
      </h4>
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em
        nossas práticas de informação. Notificaremos você sobre quaisquer alterações publicando a
        nova Política de Privacidade em nosso site. Recomendamos revisar esta Política de
        Privacidade regularmente para se manter informado sobre como protegemos suas informações.
      </p>
      <h4 id="7-contato">7. Contato</h4>
      <p>
        Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco
        através do e-mail <strong>{CONTACT_EMAIL}</strong>.
      </p>
      <p>
        <strong>hinarios.app</strong> <br />
        {CONTACT_EMAIL}
      </p>
      <hr />
      <p>Ao continuar a usar nosso site, você concorda com esta Política de Privacidade.</p>
    </>
  );
}
