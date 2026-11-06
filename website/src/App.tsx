import { Compare } from "./components/Compare";
import { Faq } from "./components/Faq";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Metrics } from "./components/Metrics";
import { Playground } from "./components/Playground";
import { QuickStart } from "./components/QuickStart";
import { Resources } from "./components/Resources";
import { SyntaxReference } from "./components/SyntaxReference";
import { Theming } from "./components/Theming";
import { useSiteTheme } from "./lib/useSiteTheme";

export default function App() {
  const { theme, toggle } = useSiteTheme();
  return (
    <>
      <a className="w-skip" href="#main">
        Skip to content
      </a>
      <Header theme={theme} onToggleTheme={toggle} />
      <main id="main">
        <Hero theme={theme} />
        <Metrics />
        <Playground theme={theme} onToggleTheme={toggle} />
        <Features />
        <SyntaxReference theme={theme} />
        <QuickStart theme={theme} />
        <Theming theme={theme} />
        <Compare />
        <Faq />
        <Resources />
      </main>
      <Footer />
    </>
  );
}
