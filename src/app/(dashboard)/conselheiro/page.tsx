import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ConselheiroPage() {
  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Dashboard - Conselheiro
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Minha Unidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Nenhuma unidade vinculada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membros na Unidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">--</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
