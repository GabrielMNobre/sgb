import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TesoureiroPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard - Tesoureiro
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mensalidades Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mensalidades Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-error">--</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
