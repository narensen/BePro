import { Link } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-20 lg:px-40 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <section className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold tracking-tight">
         BePro is your <span className="text-yellow-500">Career Operating System</span>
        </h1>

        <p className="text-lg leading-relaxed">
          We help students and early professionals go from learning to getting hired — with <strong>AI</strong> at the core of every step.
        </p>

        <p className="text-lg leading-relaxed">
          In a world full of random tutorials, job boards, and resume tips, BePro brings it all together into one smart platform that adapts to you.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">🎯 Our Mission</h2>
          <p className="mt-2 text-lg italic">
            “To bridge the gap between learning and earning — for every student, in every role, everywhere.”
          </p>
          <p className="mt-4 text-lg">
            We believe careers shouldn’t depend on privilege, luck, or guesswork. BePro gives every learner a fair, guided, and smart path to becoming a pro.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">⚙️ What We Do</h2>
          <ul className="mt-4 space-y-4 text-lg list-disc list-inside">
            <li>
              <strong>🔎 Scrape Jobs from Real Companies</strong> – Our AI analyzes job roles and extracts in-demand skills, tools, and project ideas.
            </li>
            <li>
              <strong>📚 Personalized Learning Paths</strong> – Get step-by-step study timelines from real-world job descriptions, curated with tutorials and roadmaps.
            </li>
            <li>
              <strong>📁 Project Grading & Portfolio</strong> – Submit real projects, get AI feedback, and build a public portfolio.
            </li>
            <li>
              <strong>📈 Gamified Growth</strong> – Track streaks, earn XP, unlock role-based badges, and stay consistent.
            </li>
            <li>
              <strong>🌐 Social Learning</strong> – Follow others, team up, join skill battles, and share progress.
            </li>
            <li>
              <strong>🧠 AI Resume & Job Tracker</strong> – Auto-generate tailored resumes, track job applications, and prep for interviews.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-yellow-500">💡 Why We Exist</h2>
          <p className="mt-2 text-lg">
            Because most students don’t know where to start.
            <br />
            Because courses are too long and disconnected from real jobs.
            <br />
            Because LinkedIn is not enough.
          </p>
          <p className="mt-4 text-lg">
            BePro is here to change that — helping you <strong>BeProductive</strong>, <strong>BeProfessional</strong>, and <strong>BePrepared</strong>.
          </p>
        </div>

        <div className="text-center pt-10">
          <p className="text-2xl font-bold mb-4">🚀 Join the Journey</p>
<p className="text-lg">
  {"Whether you're a coder, designer, analyst, marketer, or future PM — BePro is the OS that helps you take the leap."}
  <br />
  <strong>Start small. Build real. Get hired.</strong>
</p>

          <Link
            href="/waitlist"
            className="inline-block mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-all"
          >
            👉 Join the Waitlist
          </Link>
        </div>
      </section>
    </main>
  );
}
