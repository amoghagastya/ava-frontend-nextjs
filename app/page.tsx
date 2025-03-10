"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { FloatingMicBubble } from "@/components/FloatingMicBubble";
import {
  AgentState,
  DisconnectButton,
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar
} from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { AnimatePresence, motion } from "framer-motion";
import { MediaDeviceFailure } from "livekit-client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ConnectionDetails } from "./api/connection-details/route";

// Create a context to pass the onConnectButtonClicked function down to child components
const ConnectionContext = createContext<{ onConnectButtonClicked?: () => void }>({});

export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
      "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, []);

  return (
    <main
      data-lk-theme="default"
      className="h-full grid content-center"
    >
      <ConnectionContext.Provider value={{ onConnectButtonClicked }}>
        <LiveKitRoom
          token={connectionDetails?.participantToken}
          serverUrl={connectionDetails?.serverUrl}
          connect={connectionDetails !== undefined}
          audio={true}
          video={false}
          onMediaDeviceFailure={onDeviceFailure}
          onDisconnected={() => {
            updateConnectionDetails(undefined);
          }}
          className="grid grid-rows-[1fr_auto] gap-8 items-center bg-transparent"
          style={{ 
            background: 'transparent',
            '--lk-background-color': 'transparent',
            '--lk-component-background-color': 'transparent'
          } as React.CSSProperties}
        >
          <SimpleVoiceAssistant onStateChange={setAgentState} />
          <ControlBar
            onConnectButtonClicked={onConnectButtonClicked}
            agentState={agentState}
          />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </ConnectionContext.Provider>
    </main>
  );
}

// Using the new FloatingMicBubble component instead of SimpleVoiceAssistant with BarVisualizer
function SimpleVoiceAssistant(props: {
  onStateChange: (state: AgentState) => void;
}) {
  // Get access to the onConnectButtonClicked function from the parent component
  const { onConnectButtonClicked } = useContext(ConnectionContext) || {};
  
  return (
    <FloatingMicBubble 
      onStateChange={props.onStateChange} 
      onConnectButtonClicked={onConnectButtonClicked}
    />
  );
}

function ControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
}) {
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, [krisp]);

  return (
    <div className="relative h-[120px] flex items-start justify-center">
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-10 justify-center items-center gap-4"
            >
              <div className="opacity-60 hover:opacity-100 transition-opacity">
                <VoiceAssistantControlBar controls={{ leave: false }} />
              </div> 

              <DisconnectButton 
                className="opacity-60 hover:opacity-100 hover:text-rose-300 transition-opacity"
              >
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
