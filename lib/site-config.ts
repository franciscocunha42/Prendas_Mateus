// Configuração geral do site — fácil de editar pela Lúcia e pelo Francisco.

export const siteConfig = {
  // Nome do bebé — deixar vazio por enquanto. Quando souberem, é só preencher.
  babyName: "",

  // Data prevista para o nascimento.
  // Texto mostrado no site e ano (usado para a contagem decrescente).
  dueDateText: "5 de outubro de 2026",
  dueDateISO: "2026-10-05",

  // Email para onde são enviadas as notificações de "já comprei".
  // (Também definido em NOTIFICATION_EMAIL para o envio do email.)
  notificationEmail: "luciaefrancisco2025@gmail.com",

  // Descrição sugerida para as transferências.
  transferDescription: "Presente Bebé",

  // Dados de pagamento mostrados a quem quer transferir o valor em vez de
  // comprar na loja.
  payment: {
    revolut: {
      name: "Francisco",
      link: "https://revolut.me/fmcamposcunha",
      linkLabel: "revolut.me/fmcamposcunha",
    },
    bankAccounts: [
      {
        label: "Conta Portugal — Lúcia",
        holder: "Lúcia Manuela Antunes Roque",
        iban: "PT50 0023 0000 4567 4250 7099 4",
      },
      {
        label: "Conta Países Baixos — Francisco",
        holder: "Francisco Miguel Campos Cunha",
        iban: "NL69 ABNA 0118 0202 85",
      },
    ],
  },
} as const;

// Título mostrado no topo, adaptado a se já existe nome ou não.
export function pageTitle(): string {
  return siteConfig.babyName
    ? `À espera do ${siteConfig.babyName}`
    : "À espera do nosso bebé";
}
