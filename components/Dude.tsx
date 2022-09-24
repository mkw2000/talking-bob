import { useEffect, useRef, useState } from "react";
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

export function Dude({ customPrompts }: Props) {
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [phrase, setPhrase] = useState("");
  const [talking, setTalking] = useState(false);
  const [spokenPhrase, setSpokenPhrase] = useState("");

  console.log("custon", customPrompts);

  function talk() {
    console.log("talking");
    setTalking(true);
    setTimeout(() => {
      setTalking(false);
    }, 200);
  }

  useEffect(() => {
    console.log("talking changed", talking);
  }, [talking]);

  const speechRef = useRef<SpeechRecognition | null>(null);

  function speakPhrase(phrase: any) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.voice = synth.getVoices()[selectedVoice];

    utterance.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
      speechRef.current && speechRef.current.start();
    };

    utterance.onerror = function (event) {
      console.error(event, "SpeechSynthesisUtterance.onerror");
    };

    utterance.onboundary = function (event) {
      talk();
      console.log("bouncary", event);
    };

    console.log("utterance", utterance);
    speechRef.current && speechRef.current.stop();
    synth.cancel();
    synth.speak(utterance);
  }

  function handleTextInput(e: any) {
    // get text from event
    const phrase = e.target.value;
    // speak the text
    setPhrase(phrase);
  }

  useEffect(() => {
    console.log(
      window.speechSynthesis.getVoices()[selectedVoice],
      "voice selected"
    );
  }, [selectedVoice]);

  useEffect(() => {
    if (speechRef.current === null) return;

    speechRef.current = new webkitSpeechRecognition();

    speechRef.current && speechRef.current.start();

    speechRef.current.addEventListener("result", (event) => {
      const result = event.results[0][0].transcript;
      setSpokenPhrase(result);

      const customPrompt = customPrompts.filter(
        (prompt) => prompt.input === result
      );

      if (customPrompt.length > 0) {
        speakPhrase(customPrompt[0].answer);
      } else {
        speakPhrase(getRandomPhrase());
      }
    });

    return () => {
      speechRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <div></div>
      <h1>Talking Dude</h1>
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
