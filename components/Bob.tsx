import { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { PromptType } from "../types";

const randomPhrases = ["yes", "no", "ha ha ha", "i dont even know, man"];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomPhrase() {
  return randomPhrases[getRandomInt(0, randomPhrases.length - 1)];
}

type Props = {
  customPrompts: PromptType[];
};

type Command = {
  command: string;
  callback: () => void;
};

export function Bob({ customPrompts }: Props) {
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [phrase, setPhrase] = useState("");
  const [talking, setTalking] = useState(false);
  const [spokenPhrase, setSpokenPhrase] = useState("");

  const commands: Command[] = [];

  customPrompts.forEach((prompt) => {
    commands.push({
      command: prompt.input,
      callback: () => speakPhrase(prompt.answer),
    });
  });

  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true });
  }, []);

  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({
    commands,
  });

  function talk() {
    setTalking(true);
    setTimeout(() => {
      setTalking(false);
    }, 200);
  }

  const speechRef = useRef<SpeechRecognition | null>(null);

  function speakPhrase(phrase: string) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.voice = synth.getVoices()[selectedVoice];

    utterance.onend = function (event) {
      speechRef.current && speechRef.current.startListening();
    };

    utterance.onerror = function (event) {
      console.error(event, "SpeechSynthesisUtterance.onerror");
    };

    utterance.onboundary = function (event) {
      talk();
    };

    synth.speak(utterance);
  }

  function handleTextInput(e: any) {
    // get text from event
    const phrase = e.target.value;
    // speak the text
    setPhrase(phrase);
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div>
        <p>
          Sorry, your browser doesnt support Talking Bob. Try Google Chrome.
        </p>
      </div>
    );
  }

  return (
    <div className="App">
      <div>
        <p>Microphone: {listening ? "on" : "off"}</p>
      </div>
      <h1>Talking Bob</h1>
      <button
        onClick={() => {
          speakPhrase(phrase);
        }}
      >
        talk
      </button>
      <input onChange={handleTextInput} type="text" />
      <div>you said: {spokenPhrase}</div>
      <div className="guy">
        <div className="eyes">
          <div className="eye">O</div>
          <div className="eye">O</div>
        </div>
        <div className="mouth">{talking ? "O" : "---"}</div>
      </div>
    </div>
  );
}
