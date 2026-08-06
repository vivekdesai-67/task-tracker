import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(160deg, #07090e 0%, #111726 100%)' }}>
      <SignIn />
    </div>
  );
}
