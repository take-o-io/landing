# take-o.io — landing pré-launch (v1 consolidada)

Momento zero do funil: destrava aplicações em programas de startup, valida a marca em ambiente publicado e captura leads pra régua de comunicação (Resend). Substituída pelo site real quando o MVP existir.

## Estrutura

```
├── index.html      landing completa (i18n EN/PT + tema escuro/claro/sistema)
├── privacy.html    aviso de privacidade bilíngue (/privacy via cleanUrls)
├── favicon.svg     símbolo mono
├── api/subscribe.js  serverless: contato no Resend + e-mail de confirmação
└── vercel.json     cleanUrls (privacy.html → /privacy)
```

## Publicar

1. Repo `take-o-io/landing` no GitHub, commitar tudo na raiz.
2. Vercel → Add New → Project → importar. Framework preset: **Other**, sem build command.
3. Settings → Environment Variables:
   - `RESEND_API_KEY` — API key do Resend (conta com `fantunes@take-o.io`)
   - `RESEND_AUDIENCE_ID` — criar Audience "waitlist" no Resend e copiar o ID
   - Sem as envs a página funciona, mas o e-mail só é logado (modo demo).
4. Resend → Domains → verificar `take-o.io` (registros DNS na Cloudflare) pra enviar de `hello@take-o.io`.
5. Vercel → Settings → Domains → `take-o.io` (CNAME `cname.vercel-dns.com` na Cloudflare, **DNS only**, proxy desligado).

## Decisões embutidas (rastreabilidade)

- **Idioma**: default fixo em **inglês**, independente do dispositivo — decisão deliberada para reforçar a primeira impressão de marca internacional (o crawler do F6S/Notion for Startups também vê inglês). Escolha manual do visitante persiste em `localStorage.lang`. Seletor no rodapé, pill com bandeira (padrão Cursor).
- **Tema**: default **escuro** (marca brushed) — decisão de doutrina do Manual v2 (site/hero é "momento de impacto", não segue o SO por padrão). Sistema e claro disponíveis como opções manuais no seletor de 3 estados (monitor/sol/lua). Escolha persiste em `localStorage.theme`. Escuro = brushed; claro = iridescente (mapa de aplicações, Manual v2).
- **Layout**: dobra única (single-fold) — nav + split duas colunas (headline/form à esquerda, ilustração à direita) + rodapé, sem seções de rolagem adicionais. Referência: Superpower/Monaco. Seções "dois momentos" e fecho de posicionamento foram cortadas desta versão (condensadas no subtexto do hero) — reencaixe futuro é reversível, não perdido.
- **Ilustração**: página de roteiro em silhueta (proporção carta, sem letras) → linhas de cena, dentro de moldura tom-sobre-tom (cartão elevado + janela interna, padrão Monaco). Codificação INT/EXT × DIA/NOITE: mono no escuro (luminosidade = tempo, preenchimento = ambiente); matizes categóricas do Foundations no claro (neutro/cobre/azul/oliva). Sem menção a stripboard.
- **Copy**: hero fechado em conjunto (PT/EN); IA só no fecho de posicionamento; sem PDF, sem preço, sem data. "Em minutos" pendente de medição vs. baseline da Clara (North Star candidata).
- **Privacidade**: linha "Aviso de Privacidade" sob o form (sem checkbox — envio do form já é ação afirmativa; pré-marcado seria inválido na LGPDe). Página `/privacy` bilíngue.
- **Marca**: curvas SVG oficiais embutidas; nunca recriar em fonte. Quicksand não aparece; textos em General Sans; Courier só nos números de cena (regra de textura).

## Editar

Toda a copy vive no objeto `I18N` no fim do `index.html` — editar lá altera PT e EN num lugar só. Privacidade: blocos `data-l="pt"` / `data-l="en"` no `privacy.html`.

## Pendências registradas (não bloqueiam publicação)

- **Validar em Safari/Chrome mobile real antes de divulgar** — dois bugs de CSS específicos de mobile/iOS foram corrigidos (rodapé sobrepondo a ilustração; tema escuro não cobrindo a tela inteira), mas só testados no visualizador de arquivo do app do Claude, não em navegador de verdade. Testar num preview deployment da Vercel assim que publicar.
- Medir "em minutos" contra baseline manual antes de divulgar amplamente
- Validar vocabulário de decupagem com a Clara
- OG image (og:image) quando houver arte de compartilhamento
