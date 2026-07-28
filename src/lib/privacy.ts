function configured(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || null;
}

export const privacyController = {
  legalName: configured(process.env.PRIVACY_CONTROLLER_LEGAL_NAME),
  tradeName: configured(process.env.PRIVACY_CONTROLLER_TRADE_NAME) ?? "11RUN",
  cnpj: configured(process.env.PRIVACY_CONTROLLER_CNPJ),
  address: configured(process.env.PRIVACY_CONTROLLER_ADDRESS),
  email: configured(process.env.PRIVACY_CONTACT_EMAIL),
  whatsapp: configured(process.env.PRIVACY_CONTACT_WHATSAPP),
  dpoName: configured(process.env.PRIVACY_DPO_NAME)
};

export const privacyPendingLabel = "Definição administrativa pendente";
