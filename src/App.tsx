import { MetronomePanel } from "./components/MetronomePanel";
import { PlaybackCalibrationPanel } from "./components/PlaybackCalibrationPanel";
import "./styles.css";

function App() {
  return (
    <main className="app-shell">
      <section className="panel">
        <MetronomePanel />

        <PlaybackCalibrationPanel />

        <footer className="app-footer">
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
