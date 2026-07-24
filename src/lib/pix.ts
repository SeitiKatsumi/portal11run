const PIX_GUI = "br.gov.bcb.pix";

function field(id: string, value: string) {
  const length = Buffer.byteLength(value, "utf8");
  if (length > 99) throw new Error(`Campo PIX ${id} excede o limite.`);
  return `${id}${String(length).padStart(2, "0")}${value}`;
}

function normalizeText(value: string, limit: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, limit);
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (const byte of Buffer.from(payload, "utf8")) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload({
  key,
  amountCents,
  merchantName,
  merchantCity,
  reference
}: {
  key: string;
  amountCents: number;
  merchantName: string;
  merchantCity: string;
  reference: string;
}) {
  if (!Number.isInteger(amountCents) || amountCents < 100) {
    throw new Error("A doação mínima é de R$ 1,00.");
  }
  const account = field("00", PIX_GUI) + field("01", key.replace(/\D/g, ""));
  const additional = field("05", normalizeText(reference, 25) || "***");
  const base = [
    field("00", "01"),
    field("26", account),
    field("52", "0000"),
    field("53", "986"),
    field("54", (amountCents / 100).toFixed(2)),
    field("58", "BR"),
    field("59", normalizeText(merchantName, 25)),
    field("60", normalizeText(merchantCity, 15)),
    field("62", additional),
    "6304"
  ].join("");
  return `${base}${crc16(base)}`;
}
