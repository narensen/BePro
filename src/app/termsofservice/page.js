export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-20 lg:px-40 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-yellow-500">Terms of Service</span>
        </h1>

        <p className="text-lg leading-relaxed">
          These Terms of Service (“Terms”) govern your use of BePro and its related services. By accessing or using our platform, you agree to comply with and be bound by these Terms.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">✅ Eligibility</h2>
          <p className="mt-2 text-lg">
            You must be at least 13 years old to use BePro. By using the platform, you confirm that you meet the age requirement and have the legal capacity to enter into this agreement.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🧑‍💻 User Conduct</h2>
          <ul className="mt-4 space-y-4 text-lg list-disc list-inside">
            <li>You agree to use BePro only for lawful and educational purposes.</li>
            <li>You must not impersonate others or provide false information.</li>
            <li>You must not upload malicious content or disrupt the platform.</li>
            <li>You are responsible for maintaining the confidentiality of your account.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">📦 Content & Ownership</h2>
          <p className="mt-2 text-lg">
            All content on BePro — including text, graphics, and AI-generated materials — is owned by BePro or its licensors. You retain ownership of any content you create or upload but grant us a license to use it for providing and improving our services.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">⚠️ Termination</h2>
          <p className="mt-2 text-lg">
            We reserve the right to suspend or terminate your access to BePro at any time if you violate these Terms or misuse the platform. You may also delete your account at any time.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🔄 Modifications</h2>
          <p className="mt-2 text-lg">
            BePro may update these Terms from time to time. Continued use of the platform after any such updates constitutes your acceptance of the revised Terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">📌 Disclaimer</h2>
          <p className="mt-2 text-lg">
            BePro is provided “as is” without warranties of any kind. We do not guarantee job placement, accuracy of recommendations, or uninterrupted service. You use the platform at your own risk.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">📍 Governing Law</h2>
          <p className="mt-2 text-lg">
            These Terms are governed by and interpreted in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts located in Bangalore, Karnataka.
          </p>
        </div>

        <div className="text-center pt-10">
          <p className="text-2xl font-bold mb-4">📬 Contact Us</p>
          <p className="text-lg">
            For questions or concerns about these Terms, please contact us at: <br />
            <strong>support@bepro.ai</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
