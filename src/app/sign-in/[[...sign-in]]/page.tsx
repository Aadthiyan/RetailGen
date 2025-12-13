import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: 'mx-auto',
                        card: 'shadow-xl',
                    },
                }}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/app/dashboard"
            />
        </div>
    );
}
