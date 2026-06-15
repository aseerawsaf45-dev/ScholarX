"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { SplineScene } from "@/components/tree/SplineScene";
import { Icon } from "@/components/ui/icon";

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
              <Button variant="premium" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl">
                Start Growing
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl bg-background/50 backdrop-blur-sm">
                Explore Scholarships
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground">
          <Icon name="ChevronDown" size={32} />
        </div>
      </section>

      {/* Seed-to-Tree Scroll Journey (Placeholder for GSAP) */}
      <section id="journey" className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-16">Your Growth Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Seed", desc: "Discover opportunities and set your goals." },
              { title: "Sprout", desc: "Evaluate eligibility and prepare your profile." },
              { title: "Sapling", desc: "Build applications with AI guidance." },
              { title: "Growing Tree", desc: "Submit and track progress." },
              { title: "Scholarship Tree", desc: "Achieve success and secure funding." },
              { title: "Legacy Forest", desc: "Give back to the community." }
            ].map((stage, i) => (
              <motion.div 
                key={stage.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="p-8 rounded-2xl bg-background border border-border shadow-soft"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-6">
                  {i + 1}
                </div>
                <h4 className="mb-4">{stage.title}</h4>
                <p className="text-muted-foreground">{stage.desc}</p>
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
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-premium">
            Join ScholarX Today
          </Button>
        </div>
      </section>
    </div>
  );
}
