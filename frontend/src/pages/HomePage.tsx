import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function HomePage() {
  return (
    <section className="py-24">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl text-6xl font-medium leading-[1.05] tracking-tight">
        Lunch, made fresh and ready when you are.
      </motion.h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">Browse today's menu, add dishes to your bag and pick up in minutes.</p>
      <Link to="/menu" className="mt-10 inline-block rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground">Browse the menu</Link>
    </section>
  );
}
