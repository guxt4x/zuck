/**
 * Utilitários determinísticos para manipulação de valores monetários.
 * Regra do domínio: Valores sempre em centavos inteiros (nunca float com casas decimais).
 */

export function parseAmountToCents(value: number | string): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || isNaN(value)) {
      throw new Error("Valor monetário inválido.");
    }
    // Arredondamento determinístico para centavos inteiros
    const cents = Math.round(value * 100);
    if (cents <= 0) {
      throw new Error("O valor monetário deve ser maior que zero.");
    }
    return cents;
  }

  if (typeof value === "string") {
    const cleaned = value.trim().replace(/^R\$\s?/, "");
    // Trata formato brasileiro (ex: "1.250,50" -> "1250.50") ou padrão internacional ("1250.50")
    let normalized = cleaned;
    if (cleaned.includes(",") && cleaned.includes(".")) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (cleaned.includes(",")) {
      normalized = cleaned.replace(",", ".");
    } else if (cleaned.includes(".")) {
      const dotCount = (cleaned.match(/\./g) || []).length;
      if (dotCount > 1 || /\.\d{3}$/.test(cleaned)) {
        normalized = cleaned.replace(/\./g, "");
      }
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || isNaN(parsed)) {
      throw new Error(`Não foi possível interpretar o valor monetário: "${value}"`);
    }

    const cents = Math.round(parsed * 100);
    if (cents <= 0) {
      throw new Error("O valor monetário deve ser maior que zero.");
    }
    return cents;
  }

  throw new Error("Tipo de valor monetário não suportado.");
}

export function formatCentsToBrl(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error("Valor em centavos deve ser um número inteiro.");
  }
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const reais = Math.floor(absCents / 100);
  const centavos = absCents % 100;
  const formattedCents = centavos.toString().padStart(2, "0");
  const formattedReais = reais.toLocaleString("pt-BR");

  const sign = isNegative ? "- " : "";
  return `${sign}R$ ${formattedReais},${formattedCents}`;
}
