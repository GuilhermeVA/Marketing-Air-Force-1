import { Link } from 'react-router'
import { Screen } from '../ui'

/** Termo de privacidade (LGPD) da campanha acadêmica. */
export function PrivacyPage() {
  return (
    <Screen>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
      <h1 className="mt-3 text-3xl">Privacidade</h1>
      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-graphite">
        <section>
          <h2 className="text-lg">Sobre esta campanha</h2>
          <p className="mt-2">
            O Código de Cor é um projeto acadêmico da disciplina de Marketing Digital. É uma
            campanha simulada, sem vínculo oficial com a Nike. Cupons e prêmios são fictícios.
          </p>
        </section>
        <section>
          <h2 className="text-lg">Quais dados coletamos</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>No cadastro: apelido, e-mail e senha (guardada de forma criptografada).</li>
            <li>
              Na experiência: os tênis que você resgatou, o seu cupom e a data do seu consentimento.
            </li>
          </ul>
          <p className="mt-2">Não coletamos dados sensíveis, documentos nem dados de pagamento.</p>
        </section>
        <section>
          <h2 className="text-lg">Para que usamos</h2>
          <p className="mt-2">
            Só para fazer a experiência funcionar (guardar o seu closet e o seu cupom) e para a
            avaliação acadêmica do projeto, com números agregados. Não vendemos nem compartilhamos
            seus dados com terceiros, e não enviamos e-mails de marketing.
          </p>
        </section>
        <section>
          <h2 className="text-lg">Por quanto tempo</h2>
          <p className="mt-2">
            Todos os dados serão apagados ao fim da disciplina. Você pode pedir a exclusão antes
            disso falando com o grupo responsável pelo projeto.
          </p>
        </section>
        <section>
          <h2 className="text-lg">Onde ficam</h2>
          <p className="mt-2">
            Os dados ficam no Supabase, serviço de banco de dados usado pelo projeto, com acesso
            restrito: cada pessoa só consegue ler os próprios dados.
          </p>
        </section>
      </div>
      <Link
        to="/"
        className="mt-10 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
      >
        Voltar ao início
      </Link>
    </Screen>
  )
}
