type Registration = {
  category?: string | null;
  city?: string | null;
  state?: string | null;
  pipeline_status: string;
  payload_json: string;
};

export type AthleteCount = { label: string; count: number };
const missing = "Não informado";
const states = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
const clean = (value: unknown) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
const stateNames: Record<string, string> = {
  acre: "AC", alagoas: "AL", amapa: "AP", amazonas: "AM", bahia: "BA", ceara: "CE",
  "distrito federal": "DF", "espirito santo": "ES", goias: "GO", maranhao: "MA",
  "mato grosso": "MT", "mato grosso do sul": "MS", "minas gerais": "MG", para: "PA",
  paraiba: "PB", parana: "PR", pernambuco: "PE", piaui: "PI", "rio de janeiro": "RJ",
  "rio grande do norte": "RN", "rio grande do sul": "RS", rondonia: "RO", roraima: "RR",
  "santa catarina": "SC", "sao paulo": "SP", sergipe: "SE", tocantins: "TO"
};

function cityLabel(city: string, state: string) {
  let region = stateNames[normalize(state)] || state.toUpperCase();
  // Older registrations sometimes include the UF in both city and state.
  let suffix = city.match(/\s*[-/,]\s*([a-z]{2})$/i);
  while (suffix && states.has(suffix[1].toUpperCase())) {
    if (!states.has(region)) region = suffix[1].toUpperCase();
    city = city.slice(0, suffix.index).trim();
    suffix = city.match(/\s*[-/,]\s*([a-z]{2})$/i);
  }
  if (!city) return missing;
  const name = city.toLocaleLowerCase("pt-BR").replace(/(^|[\s-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
  return states.has(region) ? `${name}/${region}` : name;
}

export function crossCountryDashboard(leads: readonly Registration[]) {
  const categories = new Map<string, AthleteCount>(Array.from({ length: 9 }, (_, i) => [`sub ${i + 10}`, { label: `Sub ${i + 10}`, count: 0 }]));
  const genders = new Map<string, AthleteCount>([
    ["feminino", { label: "Feminino", count: 0 }],
    ["masculino", { label: "Masculino", count: 0 }]
  ]);
  const cities = new Map<string, AthleteCount>();
  function increment(groups: Map<string, AthleteCount>, label: string) {
    const key = normalize(label);
    const item = groups.get(key);
    if (item) item.count++;
    else groups.set(key, { label, count: 1 });
  }
  for (const lead of leads) {
    let payload: Record<string, unknown> = {};
    try {
      const parsed: unknown = JSON.parse(lead.payload_json);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) payload = parsed as Record<string, unknown>;
    } catch { /* Incomplete legacy records remain visible in the totals. */ }
    const category = clean(lead.category) || clean(payload.category);
    increment(categories, category.replace(/^sub\s*(\d+)$/i, "Sub $1") || missing);
    const gender = normalize(clean(payload.gender));
    increment(genders, ["f", "feminino"].includes(gender) ? "Feminino" : ["m", "masculino"].includes(gender) ? "Masculino" : missing);
    increment(cities, cityLabel(clean(lead.city) || clean(payload.city), clean(lead.state) || clean(payload.state)));
  }
  return {
    total: leads.length,
    accepted: leads.filter((lead) => lead.pipeline_status === "Aceitas").length,
    cityCount: [...cities.values()].filter((city) => city.label !== missing).length,
    categories: [...categories.values()],
    genders: [...genders.values()],
    cities: [...cities.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"))
  };
}
