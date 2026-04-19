import { MicrophoneMeasurementPanel } from "./MicrophoneMeasurementPanel";
import { PlaybackCalibrationPanel } from "./PlaybackCalibrationPanel";

export function CalibrationPanel() {
  return (
    <section className="calibration-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Calibration</p>
          <h2>Calibration</h2>
        </div>
      </div>

      <div className="calibration-tools">
        <PlaybackCalibrationPanel />
        <MicrophoneMeasurementPanel />
      </div>
    </section>
  );
}
