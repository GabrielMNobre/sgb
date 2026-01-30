import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard - Administrador
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Membros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximo Encontro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Nenhum agendado</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
