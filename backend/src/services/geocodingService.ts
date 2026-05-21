/**
 * Serviço de Geocodificação — Cartivore
 * CART-002B | backend/src/services/geocodingService.ts
 *
 * Usa OpenStreetMap Nominatim (gratuito, sem API key).
 * Node 20+ → fetch nativo, sem node-fetch.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Cartivore/1.0 (github.com/eulerazevedo/cartivore)";

// Rate-limit: Nominatim exige ≤ 1 req/s
let lastCall = 0;
async function rateLimit(): Promise<void> {
  const wait = 1100 - (Date.now() - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
}

export interface EnderecoInput {
  endereco?: string | null;
  cidade?:   string | null;
  estado?:   string | null;
  cep?:      string | null;
}

export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Converte endereço em lat/lng via Nominatim.
 * Retorna null se não encontrar ou se a API falhar — nunca lança exceção.
 * Critério CART-002: falha silenciosa, cadastro nunca é bloqueado.
 */
export async function geocodeEndereco(
  input: EnderecoInput
): Promise<Coordenadas | null> {
  const query = [input.endereco, input.cidade, input.estado, "Brasil"]
    .filter(Boolean)
    .join(", ");

  if (!query.replace(/[,\s]/g, "")) return null;

  try {
    await rateLimit();

    const params = new URLSearchParams({
      q:            query,
      format:       "json",
      limit:        "1",
      countrycodes: "br",
    });

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent":      USER_AGENT,
        "Accept-Language": "pt-BR",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.warn(`[geocoding] Nominatim retornou ${res.status} na busca de endereço.`);
      return null;
    }

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;

    if (!results.length) {
      console.warn("[geocoding] Nenhum resultado retornado para o endereço.");
      return null;
    }

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    console.info("[geocoding] Iniciando busca no Nominatim...");
    console.info(`[geocoding] Sucesso. Coordenadas: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    return { lat, lng };
    
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "timeout 8s" : (err?.message ?? "erro desconhecido");
    console.warn(`[geocoding] Falha — ${msg}. lat/lng ficam null.`);
    return null;
  }
}

/**
 * Retorna true se algum campo de endereço relevante foi alterado.
 * Evita chamar a API desnecessariamente no PUT (CART-002D).
 */
export function enderecoMudou(atual: any, novo: any): boolean {
  if (novo.endereco !== undefined && novo.endereco !== atual.endereco) return true;
  if (novo.cidade !== undefined && novo.cidade !== atual.cidade) return true;
  if (novo.estado !== undefined && novo.estado !== atual.estado) return true;
  if (novo.cep !== undefined && novo.cep !== atual.cep) return true;
  return false;
}
