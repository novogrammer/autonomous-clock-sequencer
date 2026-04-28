import { CalibrationPanel } from "./components/CalibrationPanel";
import { MetronomePanel } from "./components/MetronomePanel";
import "./styles.scss";

function App() {
  return (
    <main className="l-app-shell">
      <section className="l-panel">
        <MetronomePanel />

        <CalibrationPanel />

        <footer className="c-app-footer">
          <a
            href="https://github.com/novogrammer/autonomous-clock-sequencer"
            target="_blank"
            rel="noreferrer"
          >
            GitHub repository
          </a>
        </footer>
      </section>
    </main>
  );
}

export default App;
