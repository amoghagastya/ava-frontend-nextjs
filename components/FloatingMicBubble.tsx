import { AgentState, useVoiceAssistant } from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MicrophoneIcon } from "./MicrophoneIcon";

type FloatingMicBubbleProps = {
  onStateChange: (state: AgentState) => void;
  onConnectButtonClicked?: () => void;
};

export function FloatingMicBubble(props: FloatingMicBubbleProps) {
  const { state, audioTrack } = useVoiceAssistant();
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    props.onStateChange(state);
    setIsAnimating(state === "connecting");

    if (state === "connecting") {
      setShowExtendedMessage(false);
      timeoutRef.current = window.setTimeout(() => {
        setShowExtendedMessage(true);
      }, 10000);
    } else {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      setShowExtendedMessage(false);
    }

    // Set up audio analysis when speaking
    if (audioTrack && state === "speaking") {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Connect the audio track to the analyser
      if (audioTrack?.publication?.track?.mediaStreamTrack) {
        const source = audioContext.createMediaStreamSource(
          new MediaStream([audioTrack.publication.track.mediaStreamTrack])
        );
        source.connect(analyser);
        analyserRef.current = analyser;
      }

      // Function to update audio levels
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume level
          const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
          // Normalize to 0-1 range and smooth the values
          const normalizedLevel = Math.min(average / 128, 1);
          setAudioLevel(normalizedLevel);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        audioContext.close();
      };
    } else {
      setAudioLevel(0);
    }
  }, [props, state, audioTrack]);

  return (
    <div className="h-[200px] max-w-[90vw] mx-auto flex items-center justify-center">
      <div className="relative animate-float pt-10"> {/* Changed p-10 to pt-10 */}
        {/* Speech reactive glow effect - only visible during speaking */}
        {state === "speaking" && (
          <motion.div
            className="absolute inset-[-40px] rounded-full blur-2xl pointer-events-none"
            animate={{
              opacity: [0.4, 0.7],
              scale: [1 + audioLevel * 0.2, 1 + audioLevel * 0.4]
            }}
            transition={{
              repeat: Infinity,
              duration: 0.3,
              ease: "linear"
            }}
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)"
            }}
          />
        )}

        {/* Transparent bubble with gradient border */}
        <motion.div
          className="w-[180px] h-[180px] rounded-full backdrop-blur-sm flex items-center justify-center overflow-hidden relative"
          style={{
            background: state === 'disconnected' ? 'linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(59, 130, 246, 0.1))' :
                      state === 'connecting' ? 'linear-gradient(to right, rgba(37, 99, 235, 0.08), rgba(59, 130, 246, 0.15))' :
                      state === 'listening' ? 'linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.2))' :
                      state === 'speaking' ? 'linear-gradient(to right, rgba(37, 99, 235, 0.15), rgba(59, 130, 246, 0.25))' :
                      'linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(59, 130, 246, 0.1))',
            border: `1px solid ${state === 'disconnected' ? 'rgba(37, 99, 235, 0.2)' :
                                state === 'connecting' ? 'rgba(37, 99, 235, 0.3)' :
                                state === 'listening' ? 'rgba(37, 99, 235, 0.4)' :
                                state === 'speaking' ? 'rgba(37, 99, 235, 0.5)' :
                                'rgba(37, 99, 235, 0.2)'}`,
            boxShadow: isAnimating ? '0 0 25px rgba(37, 99, 235, 0.25)' : '0 10px 25px -5px rgba(37, 99, 235, 0.15)'
          }}
          whileHover={{ 
            scale: 1.02,
            background: 'linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.3))',
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)',
            transition: { duration: 0.05, ease: [0.16, 1, 0.3, 1] }
          }}
          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          onClick={props.onConnectButtonClicked}
          animate={{
            boxShadow: state === "speaking"
              ? ['0 0 20px rgba(37, 99, 235, 0.3)', `0 0 ${30 + audioLevel * 20}px rgba(37, 99, 235, ${0.4 + audioLevel * 0.2})`]
              : isAnimating
                ? ['0 0 15px rgba(37, 99, 235, 0.2)', '0 0 25px rgba(37, 99, 235, 0.3)', '0 0 15px rgba(37, 99, 235, 0.2)']
                : '0 10px 25px -5px rgba(37, 99, 235, 0.15)'
          }}
          transition={{
            boxShadow: {
              repeat: Infinity,
              duration: state === "speaking" ? 0.3 : 3
            },
            duration: 0.1,
            ease: 'easeOut'
          }}
        >
          {/* Microphone icon */}
          <div className="relative z-10 scale-75">
            <MicrophoneIcon isActive={state !== "disconnected"} />
          </div>

          {/* Enhanced waveform animation circles - Centered */}
          <AnimatePresence>
            {state === "connecting" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`wave-${i}`}
                    className="absolute rounded-full"
                    style={{
                      border: '1.5px solid rgba(59, 130, 246, 0.2)',
                      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)'
                    }}
                    initial={{ width: "100%", height: "100%", opacity: 0.3 }}
                    animate={{
                      width: [`${100 + i * 10}%`, `${130 + i * 10}%`],
                      height: [`${100 + i * 10}%`, `${130 + i * 10}%`],
                      opacity: [0.3, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Centered connecting text */}
        {state === 'connecting' && (
          <motion.div 
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <span className="text-blue-500/70 text-sm font-light tracking-wide">{showExtendedMessage ? "give it a sec..." : "connecting..."}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}