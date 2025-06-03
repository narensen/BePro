export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-20 lg:px-40 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-yellow-500">Privacy Policy</span>
        </h1>

        <p className="text-lg leading-relaxed">
          At BePro, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal data when you use our platform.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🔍 Information We Collect</h2>
          <ul className="mt-4 space-y-4 text-lg list-disc list-inside">
            <li><strong>Account Information:</strong> Name, email, and other registration details.</li>
            <li><strong>Usage Data:</strong> Interactions with our platform, preferences, learning paths, and job applications.</li>
            <li><strong>Content Submissions:</strong> Projects, assignments, resumes, and portfolios you create or upload.</li>
            <li><strong>Device & Log Data:</strong> Browser type, IP address, device identifiers, and cookies.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🛠️ How We Use Your Data</h2>
          <ul className="mt-4 space-y-4 text-lg list-disc list-inside">
            <li>To personalize your learning experience and recommend career paths.</li>
            <li>To analyze job markets and match you with relevant opportunities.</li>
            <li>To provide AI-generated feedback on projects and resumes.</li>
            <li>To improve platform performance and user experience.</li>
            <li>To communicate updates, tips, and support-related messages.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🔐 Data Security</h2>
          <p className="mt-2 text-lg">
            We implement industry-standard security measures to protect your information. While no system is entirely immune to risks, we continually update our protocols to keep your data safe.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">📤 Data Sharing</h2>
          <p className="mt-2 text-lg">
            BePro does <strong>not sell</strong> your personal data. We may share your information with trusted service providers for analytics, hosting, or support — but only under strict confidentiality agreements.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">⚖️ Your Rights</h2>
          <ul className="mt-4 space-y-4 text-lg list-disc list-inside">
            <li>You can request access to, correction, or deletion of your personal data.</li>
            <li>You can opt out of marketing communications at any time.</li>
            <li>You can request that we stop processing your data for specific purposes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🌍 International Users</h2>
          <p className="mt-2 text-lg">
            If you are accessing BePro from outside India, note that your data will be processed in accordance with Indian privacy regulations and applicable international standards.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">📅 Policy Updates</h2>
          <p className="mt-2 text-lg">
            This Privacy Policy may be updated from time to time. We encourage you to review it periodically to stay informed of how we are protecting your data.
          </p>
        </div>

        <div className="text-center pt-10">
          <p className="text-2xl font-bold mb-4">📬 Contact Us</p>
          <p className="text-lg">
            If you have questions or concerns about this Privacy Policy, please reach out to us at: <br />
            <strong>support@bepro.ai</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
