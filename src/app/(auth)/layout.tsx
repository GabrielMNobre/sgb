import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-4">
            <Image
              src="/logo.png"
              alt="SGB - Borba Gato"
              width={120}
              height={120}
              className="h-28 w-auto"
              priority
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
