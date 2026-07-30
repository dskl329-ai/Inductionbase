import { Suspense } from 'react';
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-4xl animate-pulse">🔐</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
