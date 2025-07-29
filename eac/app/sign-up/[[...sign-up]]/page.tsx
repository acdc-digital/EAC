import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#252526] border border-[#454545] shadow-xl",
              headerTitle: "text-[#cccccc]",
              headerSubtitle: "text-[#969696]",
              socialButtonsBlockButton: "bg-[#0e639c] hover:bg-[#1177bb] text-white border-0",
              socialButtonsBlockButtonText: "text-white",
              formButtonPrimary: "bg-[#0e639c] hover:bg-[#1177bb] text-white",
              footerActionLink: "text-[#0e639c] hover:text-[#1177bb]",
              identityPreviewText: "text-[#cccccc]",
              identityPreviewEditButton: "text-[#0e639c]",
              formFieldInput: "bg-[#3c3c3c] border border-[#454545] text-[#cccccc]",
              formFieldLabel: "text-[#cccccc]",
              dividerLine: "bg-[#454545]",
              dividerText: "text-[#969696]"
            }
          }}
        />
      </div>
    </div>
  );
}
