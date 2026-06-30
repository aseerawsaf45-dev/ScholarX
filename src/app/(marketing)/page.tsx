"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { SplineScene } from "@/components/tree/SplineScene";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[calc(100vh-4rem)] min-h-[600px] flex items-center justify-center bg-background overflow-hidden">
        {/* Spline Background */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none md:pointer-events-auto">
          {/* Using a placeholder Spline scene (a generic 3D tree or shape) */}
          <SplineScene scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
        </div>
        
        {/* Content Overlay */}
        <div className="container relative z-10 px-4 mx-auto flex flex-col items-center text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.h1 
              variants={fadeUp}
              className="text-foreground mb-6"
            >
              Grow Beyond <span className="text-primary">Borders.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Discover scholarships, evaluate eligibility, and build a winning application journey with AI guidance.
            </motion.p>
            
            <motion.div 
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="premium" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl" asChild>
                <Link href="/onboarding">Start Growing</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl bg-background/50 backdrop-blur-sm" asChild>
                <Link href="/scholarships">Explore Scholarships</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground">
          <Icon name="ChevronDown" size={32} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="mb-4 text-foreground">Features Engineered for Success</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to navigate the global scholarship landscape from Bangladesh.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "Sparkles",
                title: "AI Eligibility Evaluator",
                desc: "Check your academic and language match score for top international funding instantly."
              },
              {
                icon: "Map",
                title: "Personalized Roadmap",
                desc: "Get an AI-guided step-by-step checklist customized for your chosen universities."
              },
              {
                icon: "FileText",
                title: "AI Document Reviewer",
                desc: "Review your SOPs, recommendation letters, and CVs with instant grammatical and impact scoring."
              },
              {
                icon: "TreePine",
                title: "Legacy Forest Tracker",
                desc: "Watch your interactive 3D application tree grow as you complete essential roadmap milestones."
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-soft transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={feature.icon as any} size={24} />
                </div>
                <h5 className="font-bold mb-3">{feature.title}</h5>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seed-to-Tree Scroll Journey */}
      <section id="journey" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="mb-4 text-foreground">Your Growth Journey</h2>
            <p className="text-muted-foreground text-lg">
              Nurture your credentials from an ambitious seed to a fully funded tree.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Seed", desc: "Discover opportunities and set your target academic goals." },
              { title: "Sprout", desc: "Evaluate your eligibility and build a strong profile." },
              { title: "Sapling", desc: "Craft winning essays and request recommendations with AI aid." },
              { title: "Growing Tree", desc: "Submit, track applications, and handle deadlines seamlessly." },
              { title: "Scholarship Tree", desc: "Win your funding and grow beyond borders." },
              { title: "Legacy Forest", desc: "Guide the next generation of Bangladeshi scholars." }
            ].map((stage, i) => (
              <motion.div 
                key={stage.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="p-8 rounded-2xl bg-card border border-border shadow-soft text-left"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-6">
                  {i + 1}
                </div>
                <h4 className="mb-4 text-foreground">{stage.title}</h4>
                <p className="text-muted-foreground">{stage.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section id="scholarships" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="mb-4 text-foreground">Featured Scholarships</h2>
            <p className="text-muted-foreground text-lg">
              Top global programs accepting applicants from Bangladesh.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Erasmus Mundus Joint Masters",
                provider: "European Union",
                country: "Multiple Europe",
                coverage: "Fully Funded + Stipend",
                deadline: "Jan-Mar Annually"
              },
              {
                title: "Fulbright Graduate Student Program",
                provider: "US Department of State",
                country: "United States",
                coverage: "Tuition + Airfare + Living Expense",
                deadline: "May-June Annually"
              },
              {
                title: "Eiffel Excellence Scholarship",
                provider: "French Government",
                country: "France",
                coverage: "Fully Funded Master/PhD",
                deadline: "November Annually"
              }
            ].map((sch, i) => (
              <motion.div
                key={sch.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-background border border-border flex flex-col justify-between hover:border-primary/50 transition-all duration-300"
              >
                <div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">
                    {sch.country}
                  </span>
                  <h4 className="text-xl font-bold mt-4 mb-2 leading-tight text-foreground">{sch.title}</h4>
                  <p className="text-muted-foreground text-sm mb-4">{sch.provider}</p>
                </div>
                <div className="border-t border-border pt-4 mt-4 flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Coverage: <strong className="text-foreground">{sch.coverage}</strong></span>
                  <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">{sch.deadline}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" size="lg" className="rounded-xl px-8" asChild>
              <Link href="/scholarships">Browse All Scholarships <Icon name="ArrowRight" className="ml-2" size={16} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="mb-4 text-foreground">Supported by a Growing Community</h2>
            <p className="text-muted-foreground text-lg">
              Hear from Bangladeshi scholars who realized their dreams with global education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "ScholarX made tracking my Erasmus applications incredibly simple. The AI SOP evaluator pointed out formatting mistakes that saved my essay.",
                author: "Anisur Rahman",
                meta: "Erasmus Scholar, Technical University of Munich"
              },
              {
                quote: "Securing a Fulbright scholarship required extreme detail in my study objective. The step-by-step roadmap kept me on track over the 6-month process.",
                author: "Fariha Ahmed",
                meta: "Fulbright Scholar, Boston University"
              },
              {
                quote: "Comparing different university requirements on GPA and IELTS was a headache. ScholarX's eligibility dashboard filtered out exactly where I qualified.",
                author: "Imran Khan",
                meta: "Monbukagakusho (MEXT) Scholar, Tokyo University"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-soft transition-all duration-300 text-left"
              >
                <p className="italic text-muted-foreground text-sm mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <h5 className="font-bold text-base mb-1 text-foreground">{testimonial.author}</h5>
                  <p className="text-primary text-xs font-medium">{testimonial.meta}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-white mb-6">Ready to Plant Your Seed?</h2>
          <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of Bangladeshi students building their legacy forest of achievements.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-premium" asChild>
            <Link href="/onboarding">Join ScholarX Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
