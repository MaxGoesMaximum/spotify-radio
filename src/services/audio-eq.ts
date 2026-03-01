// ═══════════════════════════════════════════════════════════════
//  Audio EQ Manager — Web Audio API equalizer
//  Connects to Spotify SDK's <audio> element via MediaElementSource
//  Gracefully degrades to visual-only if CORS blocks connection
// ═══════════════════════════════════════════════════════════════

export type EQConnectionStatus = "disconnected" | "connecting" | "connected" | "failed";

type StatusListener = (status: EQConnectionStatus) => void;

const BAND_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const Q_VALUE = 1.4; // quality factor for peaking filters

export class AudioEQManager {
  private audioContext: AudioContext | null = null;
  private filters: BiquadFilterNode[] = [];
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private connectedElement: HTMLMediaElement | null = null;
  private observer: MutationObserver | null = null;
  private status: EQConnectionStatus = "disconnected";
  private statusListeners: Set<StatusListener> = new Set();
  private enabled = true;
  private currentBands: number[] = new Array(10).fill(0);
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private processedElements: WeakSet<HTMLMediaElement> = new WeakSet();

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Immediately notify current status
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: EQConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  getStatus(): EQConnectionStatus {
    return this.status;
  }

  /**
   * Start watching the DOM for audio/video elements from Spotify SDK
   */
  startObserving() {
    if (this.observer) return;

    // Check for existing elements first
    this.scanForMediaElements();

    // Watch for new elements being added
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLMediaElement) {
            this.tryConnect(node);
          }
          // Also check children (SDK might add a container with audio inside)
          if (node instanceof HTMLElement) {
            const mediaElements = node.querySelectorAll("audio, video");
            mediaElements.forEach((el) => {
              if (el instanceof HTMLMediaElement) {
                this.tryConnect(el);
              }
            });
          }
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("[AudioEQ] Started observing DOM for media elements");
  }

  /**
   * Scan existing DOM for media elements
   */
  private scanForMediaElements() {
    const elements = document.querySelectorAll("audio, video");
    elements.forEach((el) => {
      if (el instanceof HTMLMediaElement) {
        this.tryConnect(el);
      }
    });
  }

  /**
   * Try to connect to a media element via Web Audio API
   */
  private async tryConnect(element: HTMLMediaElement) {
    // Skip if already connected or if we already tried this element
    if (this.sourceNode || this.processedElements.has(element)) return;
    this.processedElements.add(element);

    // Skip TTS audio elements (our own speech system)
    if (element.dataset.ttsAudio === "true") return;
    if (element.src && element.src.startsWith("blob:")) {
      // Could be TTS blob URL, but could also be Spotify
      // Spotify SDK typically uses encrypted media, not blob URLs for audio
    }

    this.setStatus("connecting");
    console.log("[AudioEQ] Found media element, attempting connection...", element.tagName, element.src?.substring(0, 50));

    try {
      // Create or reuse AudioContext
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Create MediaElementSource
      this.sourceNode = this.audioContext.createMediaElementSource(element);
      this.connectedElement = element;

      // Create filter chain
      this.createFilters();

      // Connect: source → filters → destination
      this.connectChain();

      // Apply current band settings
      this.applyAllBands();

      this.setStatus("connected");
      console.log("[AudioEQ] Successfully connected to media element!");
    } catch (error) {
      console.warn("[AudioEQ] Failed to connect:", (error as Error).message);

      // Clean up failed attempt
      this.sourceNode = null;
      this.connectedElement = null;

      // Check if it's a CORS/security error
      const msg = (error as Error).message?.toLowerCase() || "";
      if (
        msg.includes("cors") ||
        msg.includes("not allowed") ||
        msg.includes("security") ||
        msg.includes("mediaelementaudiosourcenode") ||
        msg.includes("already been") // "has already been previously connected"
      ) {
        this.setStatus("failed");
        console.log("[AudioEQ] CORS/security restriction detected. Falling back to visual-only mode.");
      } else {
        // Might be a timing issue, retry later
        this.setStatus("disconnected");
        this.scheduleRetry();
      }
    }
  }

  /**
   * Create 10-band BiquadFilter nodes
   */
  private createFilters() {
    if (!this.audioContext) return;

    // Clear old filters
    this.filters.forEach((f) => f.disconnect());
    this.filters = [];

    BAND_FREQUENCIES.forEach((freq, i) => {
      const filter = this.audioContext!.createBiquadFilter();
      filter.frequency.value = freq;
      filter.gain.value = 0;

      if (i === 0) {
        // Lowest band: lowshelf
        filter.type = "lowshelf";
      } else if (i === BAND_FREQUENCIES.length - 1) {
        // Highest band: highshelf
        filter.type = "highshelf";
      } else {
        // Middle bands: peaking
        filter.type = "peaking";
        filter.Q.value = Q_VALUE;
      }

      this.filters.push(filter);
    });
  }

  /**
   * Connect the audio graph: source → [filters] → destination
   */
  private connectChain() {
    if (!this.sourceNode || !this.audioContext || this.filters.length === 0) return;

    // Disconnect existing connections
    this.sourceNode.disconnect();

    if (this.enabled && this.filters.length > 0) {
      // source → filter[0] → filter[1] → ... → filter[9] → destination
      this.sourceNode.connect(this.filters[0]);
      for (let i = 0; i < this.filters.length - 1; i++) {
        this.filters[i].connect(this.filters[i + 1]);
      }
      this.filters[this.filters.length - 1].connect(this.audioContext.destination);
    } else {
      // Bypass: source → destination
      this.sourceNode.connect(this.audioContext.destination);
    }
  }

  /**
   * Schedule a retry scan
   */
  private scheduleRetry() {
    if (this.retryTimeout) return;
    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      if (!this.sourceNode) {
        this.scanForMediaElements();
      }
    }, 3000);
  }

  /**
   * Set a single EQ band value
   * @param band Band index (0-9)
   * @param gainDb Gain in dB (-12 to +12)
   */
  setBand(band: number, gainDb: number) {
    if (band < 0 || band >= 10) return;
    this.currentBands[band] = gainDb;

    if (this.filters[band] && this.enabled) {
      this.filters[band].gain.setTargetAtTime(
        gainDb,
        this.audioContext?.currentTime || 0,
        0.02 // 20ms smoothing
      );
    }
  }

  /**
   * Set all 10 bands at once
   */
  setAllBands(bands: number[]) {
    if (bands.length !== 10) return;
    this.currentBands = [...bands];
    this.applyAllBands();
  }

  /**
   * Apply all current band values to filters
   */
  private applyAllBands() {
    if (!this.enabled) return;
    this.currentBands.forEach((gain, i) => {
      if (this.filters[i]) {
        this.filters[i].gain.setTargetAtTime(
          gain,
          this.audioContext?.currentTime || 0,
          0.02
        );
      }
    });
  }

  /**
   * Enable or disable the EQ (bypass mode)
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;

    if (this.sourceNode && this.audioContext) {
      this.connectChain();
      if (enabled) {
        this.applyAllBands();
      }
    }
  }

  /**
   * Reset all bands to flat (0 dB)
   */
  reset() {
    this.currentBands = new Array(10).fill(0);
    this.applyAllBands();
  }

  /**
   * Get current band values
   */
  getBands(): number[] {
    return [...this.currentBands];
  }

  /**
   * Clean up everything
   */
  destroy() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.observer?.disconnect();
    this.observer = null;

    this.filters.forEach((f) => f.disconnect());
    this.filters = [];

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.connectedElement = null;
    this.statusListeners.clear();
    this.setStatus("disconnected");

    console.log("[AudioEQ] Destroyed");
  }
}

// Singleton instance
export const audioEQManager = new AudioEQManager();
