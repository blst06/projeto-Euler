import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, TriangleAlert, Users } from "lucide-react";
import { getStatusLabel } from "@/lib/utils";
import type { Cliente } from "@/lib/types";
import { clientesMock } from "@/mocks/clientesMock";

const statusColors: Record<string, string> = {
  adimplente: "status-adimplente",
  risco: "status-risco",
  inadimplente: "status-inadimplente",
  bloqueado: "status-bloqueado",
};

const markerColors: Record<string, string> = {
  adimplente: "#10b981",
  risco: "#f59e0b",
  inadimplente: "#ef4444",
  bloqueado: "#9ca3af",
};

function hasCoordinates(cliente: Cliente) {
  return typeof cliente.lat === "number" && typeof cliente.lng === "number";
}

function getMarkerIcon(status: string) {
  const color = markerColors[status] ?? "#0f766e";

  return L.divIcon({
    className: "border-0 bg-transparent",
    html: `<span style="display:flex;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(15, 23, 42, 0.35);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

export default function Mapa() {
  const { data: clientes = [], isLoading, isError } = useQuery<Cliente[]>({ queryKey: ["/api/clientes"] });

  const clientesAtivosApi = useMemo(() => clientes.filter(cliente => cliente.ativo), [clientes]);
  const usingMockData = isError && import.meta.env.DEV;
  const clientesAtivos = useMemo(
    () => (usingMockData ? clientesMock : clientesAtivosApi),
    [clientesAtivosApi, usingMockData]
  );
  const clientesComCoordenadas = useMemo(
    () => clientesAtivos.filter(hasCoordinates),
    [clientesAtivos]
  );
  const clientesSemCoordenadas = useMemo(
    () => clientesAtivos.filter(cliente => !hasCoordinates(cliente)),
    [clientesAtivos]
  );

  const center = useMemo<[number, number]>(() => {
    if (!clientesComCoordenadas.length) return [-14.235, -51.9253];

    const total = clientesComCoordenadas.reduce(
      (acc, cliente) => ({
        lat: acc.lat + (cliente.lat ?? 0),
        lng: acc.lng + (cliente.lng ?? 0),
      }),
      { lat: 0, lng: 0 }
    );

    return [
      total.lat / clientesComCoordenadas.length,
      total.lng / clientesComCoordenadas.length,
    ];
  }, [clientesComCoordenadas]);

  const totalsByStatus = useMemo(
    () => ["adimplente", "risco", "inadimplente", "bloqueado"].map(status => ({
      status,
      count: clientesComCoordenadas.filter(cliente => cliente.status === status).length,
    })).filter(item => item.count > 0),
    [clientesComCoordenadas]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Mapa da Carteira</h1>
        <p className="text-sm text-muted-foreground">
          {clientesComCoordenadas.length} cliente{clientesComCoordenadas.length !== 1 ? "s" : ""} exibido{clientesComCoordenadas.length !== 1 ? "s" : ""} no mapa
        </p>
      </div>

      {usingMockData && (
        <Alert variant="destructive">
          <TriangleAlert className="w-4 h-4" />
          <AlertTitle>Mapa carregado com dados temporários</AlertTitle>
          <AlertDescription>
            A API não respondeu. Como o ambiente é de desenvolvimento, o mapa está usando clientes mockados temporariamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_360px]">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Clientes com coordenadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[420px] w-full rounded-xl" />
            ) : clientesComCoordenadas.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 text-center">
                <MapPin className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum cliente com coordenadas cadastradas</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Cadastre latitude e longitude para exibir os clientes no mapa.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <MapContainer center={center} zoom={5} scrollWheelZoom className="h-[420px] w-full" data-testid="mapa-carteira">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {clientesComCoordenadas.map(cliente => (
                    <Marker
                      key={cliente.id}
                      position={[cliente.lat!, cliente.lng!]}
                      icon={getMarkerIcon(cliente.status)}
                    >
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-slate-900">{cliente.nome}</p>
                          <p><span className="font-medium">Segmento:</span> {cliente.segmento}</p>
                          <p><span className="font-medium">Status:</span> {getStatusLabel(cliente.status)}</p>
                          <p><span className="font-medium">Cidade:</span> {cliente.cidade ?? "Não informada"}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Legenda e Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { status: "adimplente", label: "Adimplente" },
                { status: "risco", label: "Em Risco" },
                { status: "inadimplente", label: "Inadimplente" },
                { status: "bloqueado", label: "Bloqueado" },
              ].map(item => (
                <div key={item.status} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: markerColors[item.status] ?? "#0f766e" }} />
                  <span className="text-xs text-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Clientes ativos</span>
                <span className="font-semibold text-foreground">{clientesAtivos.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exibidos no mapa</span>
                <span className="font-semibold text-foreground">{clientesComCoordenadas.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sem coordenadas</span>
                <span className="font-semibold text-foreground">{clientesSemCoordenadas.length}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-2">
              <p className="text-xs font-semibold text-foreground">Clientes por status no mapa</p>
              {totalsByStatus.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum status disponível para exibir.</p>
              ) : (
                totalsByStatus.map(item => (
                  <div key={item.status} className="flex items-center justify-between">
                    <Badge className={`px-2 py-0 text-xs ${statusColors[item.status] ?? ""}`} variant="secondary">
                      {getStatusLabel(item.status)}
                    </Badge>
                    <span className="text-sm font-bold text-foreground">{item.count}</span>
                  </div>
                ))
              )}
            </div>

            {clientesSemCoordenadas.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
                <Users className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{clientesSemCoordenadas.length}</span> cliente{clientesSemCoordenadas.length > 1 ? "s" : ""} ativo{clientesSemCoordenadas.length > 1 ? "s" : ""} sem latitude/longitude.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
