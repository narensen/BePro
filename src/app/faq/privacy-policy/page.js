import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-20 lg:px-40 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Link href="/">
        <p className="text-3xl font-bold">BePro</p>
      </Link>
      
      <section className="max-w-4xl mx-auto space-y-10 mt-8">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-gray-500">BEPRO PRIVACY POLICY</span>
        </h1>

        <p className="text-lg leading-relaxed">
          At BePro, your privacy matters. This Privacy Policy explains how we collect, use, share, and protect your personal information when you access or use BePro&apos;s services, including our website, mobile application, and all related features (collectively, the &quot;Services&quot;).
        </p>

        <p className="text-lg leading-relaxed">
          By using BePro, you agree to the practices described in this policy. If you do not agree, please do not use the platform.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">1. Overview</h2>
          <p className="mt-4 text-lg leading-relaxed">
            BePro is an AI-powered platform for skill development, project-based learning, and job discovery. In the course of delivering this experience, we collect and use data to:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Personalize your learning path</li>
            <li>Connect you to relevant job opportunities</li>
            <li>Track your progress</li>
            <li>Improve and secure our Services</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            This policy outlines what data we collect, how it is used, and your rights regarding that data.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">2. Data We Collect</h2>
          <p className="mt-4 text-lg leading-relaxed">
            We collect the following types of information:
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold">a. Account Information</h3>
            <p className="mt-2 text-lg">When you register, we may collect your:</p>
            <ul className="mt-2 space-y-1 text-lg list-disc list-inside ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Age</li>
              <li>Country or region</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold">b. Usage Data</h3>
            <p className="mt-2 text-lg">To understand how you interact with BePro, we collect:</p>
            <ul className="mt-2 space-y-1 text-lg list-disc list-inside ml-4">
              <li>IP address, browser type, device type</li>
              <li>Pages visited, time spent, interaction behavior</li>
              <li>System logs and error reports</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold">c. Learning & Skill Data</h3>
            <p className="mt-2 text-lg">To deliver a personalized learning experience, we track:</p>
            <ul className="mt-2 space-y-1 text-lg list-disc list-inside ml-4">
              <li>Selected learning tracks</li>
              <li>Project submissions and grades</li>
              <li>Badges, XP, and skill assessments</li>
              <li>Job readiness and profile metrics</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold">d. Cookies and Tracking Technologies</h3>
            <p className="mt-2 text-lg">We use cookies and other tracking tools to:</p>
            <ul className="mt-2 space-y-1 text-lg list-disc list-inside ml-4">
              <li>Improve user experience</li>
              <li>Remember your preferences</li>
              <li>Measure site performance</li>
              <li>Analyze engagement patterns</li>
            </ul>
            <p className="mt-2 text-lg">
              You may adjust your browser settings to disable cookies, but this may affect functionality.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">3. How We Use Your Data</h2>
          <p className="mt-4 text-lg">We use your information to:</p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Provide, personalize, and improve our Services</li>
            <li>Match you with relevant career opportunities</li>
            <li>Analyze trends and usage to develop new features</li>
            <li>Display your portfolio, badges, or achievements on your profile and leaderboards</li>
            <li>Send updates, alerts, or promotional content (only with your consent)</li>
          </ul>
          <p className="mt-4 text-lg">
            We do not use your data for automated decision-making without human oversight.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">4. Legal Basis for Processing</h2>
          <p className="mt-4 text-lg">We rely on several legal bases to process your data:</p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li><strong>Contractual necessity:</strong> To create and manage your account, deliver services, and communicate with you.</li>
            <li><strong>Consent:</strong> For optional features like email marketing or job-sharing.</li>
            <li><strong>Legal obligation:</strong> To comply with laws or enforce terms of service.</li>
            <li><strong>Legitimate interest:</strong> To analyze performance, prevent fraud, and maintain platform integrity.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">5. Sharing & Disclosure</h2>
          <p className="mt-4 text-lg">
            We do not sell your personal data. However, we may share your data under specific conditions:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li><strong>Service Providers:</strong> Trusted third parties who support infrastructure, analytics, or customer service. These vendors are bound by strict confidentiality agreements.</li>
            <li><strong>Recruiters/Employers:</strong> With your explicit consent, we may share your profile, portfolio, and skill data for job-matching purposes.</li>
            <li><strong>Legal Requirements:</strong> If required by law, regulation, or to protect the rights and safety of BePro, users, or others.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">6. International Data Transfers</h2>
          <p className="mt-4 text-lg">
            Your data may be processed or stored in countries outside of your own, including the United States. We implement appropriate safeguards to ensure your data remains protected, regardless of jurisdiction.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">7. Data Retention</h2>
          <p className="mt-4 text-lg">We retain your information only as long as necessary to:</p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Provide Services</li>
            <li>Fulfill legal or regulatory obligations</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
          <p className="mt-4 text-lg">
            You may request deletion of your data at any time.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">8. Your Rights</h2>
          <p className="mt-4 text-lg">Depending on your region, you may have the right to:</p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Access your personal data</li>
            <li>Correct or update inaccurate information</li>
            <li>Delete your data (&quot;right to be forgotten&quot;)</li>
            <li>Withdraw consent for optional processing (e.g., marketing)</li>
            <li>Restrict or object to certain processing activities</li>
          </ul>
          <p className="mt-4 text-lg">
            To exercise any of these rights, please email us at <strong>bepro.sunday@gmail.com</strong> or use the in-app settings (if available). We will respond to verified requests within a reasonable timeframe.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">9. Children&apos;s Privacy</h2>
          <p className="mt-4 text-lg">
            BePro is not intended for users under the age of 13. We do not knowingly collect personal data from children. If we become aware of such collection, we will delete the information promptly.
          </p>
          <p className="mt-4 text-lg">
            If you are a parent or guardian and believe your child has used BePro without consent, please contact us immediately.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">10. Data Security</h2>
          <p className="mt-4 text-lg">
            We take your data security seriously. BePro implements industry-standard measures to protect your data from:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Unauthorized access</li>
            <li>Loss or theft</li>
            <li>Misuse or alteration</li>
          </ul>
          <p className="mt-4 text-lg">
            However, no system is 100% secure. Users are encouraged to use strong passwords and log out after each session on shared devices.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-500">11. Changes to This Policy</h2>
          <p className="mt-4 text-lg">We may update this Privacy Policy from time to time. When we do:</p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>The &quot;Effective Date&quot; at the top will be revised</li>
            <li>Significant changes will be communicated via email or in-app notice</li>
          </ul>
          <p className="mt-4 text-lg">
            Your continued use of BePro means you accept the updated policy.
          </p>
        </div>

        <div className="text-center pt-10">
          <h2 className="text-2xl font-semibold text-gray-500 mb-4">12. Contact Us</h2>
          <p className="text-lg mb-2">
            For any questions, requests, or concerns regarding your data and privacy:
          </p>
          <p className="text-lg">
            <strong>Email:</strong> bepro.sunday@gmail.com<br />
            <strong>Website:</strong> bepro.live
          </p>
        </div>

        <div className="text-center pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="text-lg font-semibold">
            Your privacy is important to us.
          </p>
          <p className="text-lg mt-2">
            We&apos;re committed to protecting your data, respecting your rights, and giving you full transparency into how your information is used.
          </p>
        </div>
      </section>
    </main>
  );
}