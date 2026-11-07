import dynamic from "next/dynamic";
import Head from "next/head";
import About from "@/components/site/About";
import Architecture from "@/components/site/Architecture";
import CaseStudies from "@/components/site/CaseStudies";
import Contact from "@/components/site/Contact";
import Cursor from "@/components/site/Cursor";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Nav from "@/components/site/Nav";
import Philosophy from "@/components/site/Philosophy";
import Principles from "@/components/site/Principles";
import Process from "@/components/site/Process";
import Services from "@/components/site/Services";
import SmoothScroll from "@/components/site/SmoothScroll";
import TechStack from "@/components/site/TechStack";
import Seo from "@/components/Seo/Seo";
import { BRAND, HERO } from "@/json/site/content";

const WorldCanvas = dynamic(() => import("@/components/three/WorldCanvas"), {
  ssr: false
});

const SITE_URL = "https://www.synkinnovations.in";

/**
 * Homepage narrative: problem → complexity → possibility → engineering →
 * product → scale → partnership → action. Each section is its own component;
 * this file only decides the order they're told in. One scene runs under all
 * of them, and every section is a set of instructions to it.
 */
export default function Home() {
  return (
    <>
      <Seo
        title={`${BRAND.name} — We build what comes next`}
        description={HERO.lede}
        canonical={SITE_URL}
        url={SITE_URL}
        siteName={BRAND.name}
        image={`${SITE_URL}/og.png`}
      />
      <Head>
        <meta name="theme-color" content="#050505" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SmoothScroll />
      <Cursor />
      <WorldCanvas />

      <a
        href="#main"
        onClick={() => document.getElementById("main")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:rounded-full focus:bg-violet-600 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Hero />
        <Philosophy />
        <Services />
        <TechStack />
        <CaseStudies />
        <Process />
        <Architecture />
        <Principles />
        <About />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
