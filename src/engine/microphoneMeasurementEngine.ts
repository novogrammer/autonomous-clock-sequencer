type MeasurementTarget = "a" | "b";

export type MeasurementClickEvent = {
  target: MeasurementTarget;
  frequencyHz: number;
  timeMs: number;
  power: number;
};

export type MeasurementResult = {
  skewMs: number;
  eventA: MeasurementClickEvent;
  eventB: MeasurementClickEvent;
};

type MeasurementConfig = {
  frequencyAHz: number;
  frequencyBHz: number;
  onClick: (event: MeasurementClickEvent) => void;
  onResult: (result: MeasurementResult) => void;
};

type DetectorState = {
  target: MeasurementTarget;
  frequencyHz: number;
  noiseFloor: number;
  lastEventSample: number;
};

const BUFFER_SIZE = 512;
const FRAME_SIZE = 256;
const HOP_SIZE = 64;
const MIN_EVENT_INTERVAL_SECONDS = 0.45;
const PAIR_WINDOW_MS = 500;
const STARTUP_IGNORE_SECONDS = 0.35;
const POWER_THRESHOLD_RATIO = 18;

export class MicrophoneMeasurementEngine {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private processedSamples = 0;
  private detectors: DetectorState[] = [];
  private pendingEvents: Partial<Record<MeasurementTarget, MeasurementClickEvent>> =
    {};
  private config: MeasurementConfig | null = null;

  async start(config: MeasurementConfig): Promise<void> {
    this.stop();

    const audioContext = new AudioContext({ latencyHint: "interactive" });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
      },
    });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    this.audioContext = audioContext;
    this.stream = stream;
    this.source = source;
    this.processor = processor;
    this.processedSamples = 0;
    this.pendingEvents = {};
    this.config = config;
    this.detectors = [
      createDetector("a", config.frequencyAHz, audioContext.sampleRate),
      createDetector("b", config.frequencyBHz, audioContext.sampleRate),
    ];

    processor.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      output.fill(0);
      this.processAudio(event.inputBuffer.getChannelData(0), audioContext.sampleRate);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
    await audioContext.resume();
  }

  stop(): void {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.processor = null;
    this.source = null;

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    void this.audioContext?.close();
    this.audioContext = null;
    this.processedSamples = 0;
    this.detectors = [];
    this.pendingEvents = {};
    this.config = null;
  }

  private processAudio(input: Float32Array, sampleRate: number): void {
    if (this.config === null) {
      return;
    }

    for (const detector of this.detectors) {
      const detectedEvent = detectClick(input, detector, {
        blockStartSample: this.processedSamples,
        sampleRate,
      });
      if (detectedEvent !== null) {
        this.config.onClick(detectedEvent);
        this.handleDetectedEvent(detectedEvent);
      }
    }

    this.processedSamples += input.length;
  }

  private handleDetectedEvent(event: MeasurementClickEvent): void {
    if (this.config === null) {
      return;
    }

    const otherTarget = event.target === "a" ? "b" : "a";
    const otherEvent = this.pendingEvents[otherTarget];
    if (otherEvent !== undefined && Math.abs(event.timeMs - otherEvent.timeMs) <= PAIR_WINDOW_MS) {
      const eventA = event.target === "a" ? event : otherEvent;
      const eventB = event.target === "b" ? event : otherEvent;
      this.pendingEvents = {};
      this.config.onResult({
        skewMs: eventA.timeMs - eventB.timeMs,
        eventA,
        eventB,
      });
      return;
    }

    this.pendingEvents[event.target] = event;
  }
}

function createDetector(
  target: MeasurementTarget,
  frequencyHz: number,
  sampleRate: number,
): DetectorState {
  return {
    target,
    frequencyHz,
    noiseFloor: 1e-8,
    lastEventSample: -Math.round(MIN_EVENT_INTERVAL_SECONDS * sampleRate),
  };
}

function detectClick(
  input: Float32Array,
  detector: DetectorState,
  timing: { blockStartSample: number; sampleRate: number },
): MeasurementClickEvent | null {
  let maxPower = 0;
  let maxFrameStart = 0;

  for (
    let frameStart = 0;
    frameStart + FRAME_SIZE <= input.length;
    frameStart += HOP_SIZE
  ) {
    const power = goertzelPower(
      input,
      frameStart,
      FRAME_SIZE,
      detector.frequencyHz,
      timing.sampleRate,
    );
    if (power > maxPower) {
      maxPower = power;
      maxFrameStart = frameStart;
    }
  }

  detector.noiseFloor = detector.noiseFloor * 0.97 + maxPower * 0.03;

  const eventSample = timing.blockStartSample + maxFrameStart + FRAME_SIZE / 2;
  const hasStarted =
    eventSample >= STARTUP_IGNORE_SECONDS * timing.sampleRate;
  const isPastCooldown =
    eventSample - detector.lastEventSample >=
    MIN_EVENT_INTERVAL_SECONDS * timing.sampleRate;
  const isAboveThreshold =
    maxPower > Math.max(detector.noiseFloor * POWER_THRESHOLD_RATIO, 1e-7);

  if (!hasStarted || !isPastCooldown || !isAboveThreshold) {
    return null;
  }

  detector.lastEventSample = eventSample;
  return {
    target: detector.target,
    frequencyHz: detector.frequencyHz,
    timeMs: (eventSample / timing.sampleRate) * 1000,
    power: maxPower,
  };
}

function goertzelPower(
  input: Float32Array,
  offset: number,
  length: number,
  frequencyHz: number,
  sampleRate: number,
): number {
  const normalizedFrequency = frequencyHz / sampleRate;
  const coefficient = 2 * Math.cos(2 * Math.PI * normalizedFrequency);
  let previous = 0;
  let previous2 = 0;

  for (let index = 0; index < length; index += 1) {
    const sample = input[offset + index];
    const current = sample + coefficient * previous - previous2;
    previous2 = previous;
    previous = current;
  }

  const power =
    previous2 * previous2 +
    previous * previous -
    coefficient * previous * previous2;
  return power / (length * length);
}
