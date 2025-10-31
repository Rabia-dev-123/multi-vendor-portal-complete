import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <section className="grid flex-1 lg:grid-cols-2">
      <div className="hidden lg:flex">
        <div className="relative w-full overflow-hidden bg-brand-500">
          <div className="px-10 py-12">
            <h1 className="mb-5 text-4xl font-semibold text-white">
              Reset Your Password
            </h1>
            <p className="text-lg font-normal text-brand-50">
              Enter your email address and new password to regain access to your
              account.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              className="w-full"
              viewBox="0 0 1440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 224L60 213.3C120 203 240 181 360 181.3C480 181 600 203 720 213.3C840 224 960 224 1080 213.3C1200 203 1320 181 1380 170.7L1440 160V320H1380C1320 320 1200 320 1080 320C960 320 840 320 720 320C600 320 480 320 360 320C240 320 120 320 60 320H0V224Z"
                fill="rgba(255, 255, 255, 0.1)"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm />
      </div>
    </section>
  );
}

