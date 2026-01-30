import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { APP_NAME, CLUB_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">{APP_NAME}</CardTitle>
        <p className="text-sm text-gray-500">{CLUB_NAME}</p>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-600">
          Página de login em construção
        </p>
      </CardContent>
    </Card>
  );
}
