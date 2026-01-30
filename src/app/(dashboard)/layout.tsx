export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar será adicionada aqui */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
