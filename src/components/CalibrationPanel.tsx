import { useState } from "react";
import { MicrophoneMeasurementPanel } from "./MicrophoneMeasurementPanel";
import { PlaybackCalibrationPanel } from "./PlaybackCalibrationPanel";

export function CalibrationPanel() {
  const [isOpen, setOpen] = useState(false);

  return (
    <section className="calibration-section">
      <div className="section-header">
        <div>
          <p className="c-eyebrow">Calibration</p>
          <h2>Calibration</h2>
        </div>
        <button
          className="c-button"
          onClick={() => setOpen((current) => !current)}
        >
          {isOpen ? "隠す" : "表示"}
        </button>
      </div>

      {isOpen && (
        <div className="calibration-tools">
          <PlaybackCalibrationPanel />
          <MicrophoneMeasurementPanel />
        </div>
      )}
    </section>
  );
}
