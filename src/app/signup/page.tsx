import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
      <div className="mb-8">
        <span className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          Hand<span className="text-emerald-500">off</span>
        </span>
      </div>
      <SignUp
        afterSignUpUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: "w-full flex justify-center",
            card: "shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 rounded-2xl",
            headerTitle: "text-gray-900 font-bold",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "border border-gray-200 hover:border-gray-300 rounded-lg font-medium text-gray-700",
            dividerLine: "bg-gray-100",
            dividerText: "text-gray-400 text-xs",
            formFieldLabel: "text-gray-500 font-semibold text-xs",
            formFieldInput: "border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg",
            footerActionLink: "text-emerald-600 hover:text-emerald-500 font-semibold",
          },
        }}
      />
    </div>
  );
}
