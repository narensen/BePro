import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-20 lg:px-40 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Link href="/">
        <p className="text-3xl font-bold">BePro</p>
      </Link>
      
      <section className="max-w-4xl mx-auto space-y-10 mt-8">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-yellow-500">TERMS OF SERVICE</span>
        </h1>

        <p className="text-lg leading-relaxed">
          Welcome to BePro, an AI-powered platform designed to enhance professional skill development through personalized learning, project-based evaluation, peer networking, and job discovery. These Terms of Service ("Terms") outline the rules and responsibilities that govern your use of our website, mobile application, and associated services (collectively, the "Services").
        </p>

        <p className="text-lg leading-relaxed">
          By accessing or using BePro, you agree to be legally bound by these Terms, as well as our Privacy Policy. If you do not agree, please do not use the platform.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">1. Eligibility</h2>
          <p className="mt-4 text-lg leading-relaxed">
            You may use BePro only if you are at least 13 years of age. If you are under 18, you must have the consent of a parent or legal guardian. By registering or accessing BePro, you confirm that you meet these eligibility requirements and are capable of entering into a legally binding agreement.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            BePro reserves the right to deny access to anyone for any lawful reason, including violations of these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">2. Account Registration & Responsibility</h2>
          <p className="mt-4 text-lg leading-relaxed">
            To access many features of BePro, you must create an account. You agree to:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Provide accurate, current, and complete information during registration.</li>
            <li>Keep your login credentials confidential and secure.</li>
            <li>Accept full responsibility for any activity under your account.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">You may not:</p>
          <ul className="mt-2 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Create an account on behalf of someone else without authorization.</li>
            <li>Use false or misleading information.</li>
            <li>Impersonate another individual or entity.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            If you suspect any unauthorized activity on your account, you must notify us immediately.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">3. Use of the Services</h2>
          <p className="mt-4 text-lg leading-relaxed">
            BePro is intended to be used for lawful, ethical, and constructive purposes. By using our Services, you agree to:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Comply with all applicable laws and regulations.</li>
            <li>Respect the integrity and performance of the platform.</li>
            <li>Avoid engaging in disruptive, harmful, or abusive conduct.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">You agree not to:</p>
          <ul className="mt-2 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Attempt unauthorized access to any part of the system.</li>
            <li>Interfere with platform operations or security features.</li>
            <li>Manipulate gamified features such as XP, badges, leaderboards, or AI grading.</li>
            <li>Upload or distribute malicious code, software, or content.</li>
            <li>Violate intellectual property or privacy rights of others.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            Violations may result in temporary or permanent suspension of access.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">4. Content Ownership and License</h2>
          
          <div className="mt-4">
            <h3 className="text-xl font-semibold">a. Your Content</h3>
            <p className="mt-2 text-lg leading-relaxed">
              You retain full ownership of any original content you upload or submit to BePro, including projects, comments, and profile data.
            </p>
            <p className="mt-2 text-lg leading-relaxed">
              By submitting content, you grant BePro a non-exclusive, royalty-free, worldwide license to host, display, reproduce, and promote that content strictly in connection with platform functions, such as:
            </p>
            <ul className="mt-2 space-y-1 text-lg list-disc list-inside ml-4">
              <li>Leaderboards</li>
              <li>Portfolios</li>
              <li>Project showcases</li>
              <li>Internal assessments</li>
            </ul>
            <p className="mt-2 text-lg leading-relaxed">
              This license helps us deliver platform features and does not allow BePro to sell or redistribute your content for unrelated purposes.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold">b. Platform Content</h3>
            <p className="mt-2 text-lg leading-relaxed">
              All intellectual property associated with BePro, including software, design, text, visuals, AI models, and branding, is the sole property of BePro or its licensors and is protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the platform without written permission.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">5. AI-Powered Features</h2>
          <p className="mt-4 text-lg leading-relaxed">
            BePro uses artificial intelligence to enhance your learning experience, assess your progress, and match you with potential job opportunities.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            While we strive to ensure the reliability of AI-generated outputs, you acknowledge that:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>AI-generated feedback is informational and not definitive advice.</li>
            <li>Job matches and suggestions are based on algorithmic logic and not guaranteed.</li>
            <li>You are responsible for evaluating and interpreting AI recommendations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">6. Paid Services & Subscriptions</h2>
          <p className="mt-4 text-lg leading-relaxed">
            BePro may offer Pro Plans and other subscription-based premium features. By purchasing a subscription, you agree to:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Pay the subscription fee in advance for the selected billing cycle.</li>
            <li>Understand that all payments are non-refundable, unless required by applicable law.</li>
            <li>Manage your subscription settings through your account dashboard.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            You may cancel your subscription at any time. Cancellation will prevent further charges but will not retroactively refund prior payments. Access to paid features will remain active until the end of the billing period.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">7. Termination & Account Suspension</h2>
          <p className="mt-4 text-lg leading-relaxed">
            We reserve the right to suspend, restrict, or terminate your access to the Services, with or without notice, if:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>You violate these Terms or our policies.</li>
            <li>Your behavior causes harm or legal risk to BePro, our users, or third parties.</li>
            <li>You misuse or exploit platform features.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">Upon termination:</p>
          <ul className="mt-2 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Your access to the platform will be revoked.</li>
            <li>Certain data may be retained for legal, operational, or audit purposes in accordance with our Privacy Policy.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">8. Disclaimer of Warranties</h2>
          <p className="mt-4 text-lg leading-relaxed">
            BePro provides its Services "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>That the Services will always be secure, uninterrupted, or error-free.</li>
            <li>That AI outputs or job matches will be accurate or suitable for your needs.</li>
            <li>That content provided by other users will meet your expectations or be error-free.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            Your use of the platform is at your sole risk.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">9. Limitation of Liability</h2>
          <p className="mt-4 text-lg leading-relaxed">
            To the fullest extent permitted by law, BePro shall not be held liable for any:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Indirect, incidental, or consequential damages.</li>
            <li>Loss of profits, data, or business opportunities.</li>
            <li>Harm arising from your reliance on AI assessments or job matches.</li>
            <li>Conduct or content of other users, including recruiters or contributors.</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            Some jurisdictions do not allow certain exclusions, so parts of this section may not apply to you.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">10. Changes to These Terms</h2>
          <p className="mt-4 text-lg leading-relaxed">
            We may update or revise these Terms from time to time. If we make material changes, we will:
          </p>
          <ul className="mt-4 space-y-2 text-lg list-disc list-inside ml-4">
            <li>Update the "Effective Date" at the top of this page.</li>
            <li>Notify users via email or in-app notification (where possible).</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed">
            By continuing to use BePro after changes are published, you agree to be bound by the updated Terms.
          </p>
        </div>

        <div className="text-center pt-10">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-4">11. Contact Information</h2>
          <p className="text-lg mb-4">
            If you have any questions, concerns, or feedback about these Terms, please reach out to us at:
          </p>
          <p className="text-lg">
            <strong>Email:</strong> bepro.sunday@gmail.com<br />
            
          </p>
        </div>

        <div className="text-center pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="text-lg font-semibold mb-2">
            Thank you for being part of the BePro community.
          </p>
          <p className="text-lg">
            We're committed to building a safe, inclusive, and growth-focused space for professionals at every stage of their journey.
          </p>
        </div>
      </section>
    </main>
  );
}