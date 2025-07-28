import { motion } from "framer-motion";

export default function QuickPrompts({ handlePrompt, disabled = false, submitting = false }) {
  const quickPrompts = [
    "Master full-stack systems with a focus on scalability and deployment",
    "Build an AI/ML path for real-world impact and research depth",
    "Bridge engineering and product for a future tech lead role",
    "Craft a DevOps track aligned with automation and SRE principles",
    "Scale from engineer to decision-maker with a systems mindset",
    "Design a founder-level roadmap with cross-domain expertise",
  ];

  return (
    <motion.div
      className="flex flex-col gap-2 lg:gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {quickPrompts.map((prompt, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left text-center rounded-lg px-3 lg:px-4 py-3 lg:py-4 bg-gradient-to-r from-yellow-100 to-yellow-100 text-amber-900 font-mono font-semibold shadow hover:bg-amber-100 transition text-sm lg:text-base leading-tight"
          onClick={() => handlePrompt(prompt)}
          disabled={disabled || submitting}
          type="button"
          style={{ transition: 'background 0.3s' }}
        >
          {prompt}
        </motion.button>
      ))}
    </motion.div>
  );
}