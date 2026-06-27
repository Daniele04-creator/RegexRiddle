import { webSmokeCopy } from "./content.js";

export function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">GOAL 00 scaffold</p>
        <h1 id="hero-title">{webSmokeCopy.title}</h1>
        <p className="summary">{webSmokeCopy.summary}</p>
      </section>
    </main>
  );
}
