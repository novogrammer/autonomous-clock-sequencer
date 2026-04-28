import { useState } from "react";
import { MicrophoneMeasurementPanel } from "./MicrophoneMeasurementPanel";
import { PlaybackCalibrationPanel } from "./PlaybackCalibrationPanel";

export function CalibrationPanel() {
  const [isOpen, setOpen] = useState(false);

  return (
    <section className="p-calibration">
      <div className="c-section-header">
        <div>
          <p className="c-eyebrow">Calibration</p>
          <h2 className="c-heading c-heading--2">Calibration</h2>
        </div>
        <button
          className="c-button"
          onClick={() => setOpen((current) => !current)}
        >
          {isOpen ? "隠す" : "表示"}
        </button>
      </div>

      {isOpen && (
        <div className="p-calibration__tools">
          <PlaybackCalibrationPanel />
          <MicrophoneMeasurementPanel />
        </div>
      )}
    </section>
  );
}
