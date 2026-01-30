import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SecretariaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard - Secretaria
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Desbravadores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Diretoria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">--</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
