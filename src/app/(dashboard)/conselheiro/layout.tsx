import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiroCompleta } from "@/services/conselheiro-dashboard";

export default async function ConselheiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let corPrimaria = "#1a2b5f";
  let corSecundaria = "#f5c518";

  if (user) {
    try {
      const unidade = await getUnidadeDoConselheiroCompleta(user.id);
      if (unidade) {
        corPrimaria = unidade.corPrimaria || "#1a2b5f";
        corSecundaria = unidade.corSecundaria || "#f5c518";
      }
    } catch (e) {
      // fallback to defaults
    }
  }

  return (
    <div
      style={
        {
          "--unit-primary": corPrimaria,
          "--unit-secondary": corSecundaria,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
