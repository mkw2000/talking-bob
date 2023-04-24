import { useEffect, useRef, useState } from "react";

import { PromptType } from "../types";

type Props = {
  customPrompts: PromptType[];
};

type Command = {
  command: string;
  callback: () => void;
};

export function Bob({ customPrompts }: Props) {
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [talking, setTalking] = useState(false);
  const [spokenPhrase, setSpokenPhrase] = useState("");

  const voiceIds = [
    {
      id: "Mmcxgtk6qVdkx0YUY9Qf",
      description:
        "I want you to act like Joe Rogan. I want you to respond and answer like Joe Rogan using the tone, manner and vocabulary Joe Rogan would use but try not to use profanity. Do not write any explanations. Only answer like Joe Rogan. You must know all of the knowledge of Joe Rogan.",
    },
    {
      id: "RzfLDq21WFZwLJR8aJ0n",
      description:
        "I want you to act like the character Din Djarin from the Mandalorian. I want you to respond and answer like Din Djarin using the tone, manner and vocabulary he would use. Do not write any explanations. Only answer like Din Djarin. You must know all of the knowledge of Din Djarin.",
    },
  ];

  const commands: Command[] = [];

  customPrompts.forEach((prompt) => {
    commands.push({
      command: prompt.input,
      callback: () => speakPhrase(prompt.answer),
    });
  });

  function talk() {
    setTalking(true);
    setTimeout(() => {
      setTalking(false);
    }, 200);
  }

  async function fetchChatGptResponse(input: string) {
    const openaiApiKey = process.env.NEXT_PUBLIC_OPEN_AI_API_KEY;
    const url = "https://api.openai.com/v1/chat/completions";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    };

    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: voiceIds[selectedVoice].description },
        { role: "user", content: input },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from ChatGPT.");
      }

      const jsonResponse = await response.json();
      return jsonResponse.choices[0].message.content.trim();
    } catch (error) {
      console.error(error);
    }
  }

  async function queryChatGPT(input: string) {
    setLoadingResponse(true);
    const chatGptResponse = await fetchChatGptResponse(input);

    if (!chatGptResponse) {
      speakPhrase("Sorry, I don't know what to say.");
      setLoadingResponse(false);

      return;
    } else {
      setLoadingResponse(false);
      speakPhrase(chatGptResponse);
    }
  }

  async function speakPhrase(input: string) {
    setLoadingAudio(true);
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceIds[selectedVoice].id}`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || "",
          },
          body: JSON.stringify({
            text: input,
            voice_settings: {
              stability: 0,
              similarity_boost: 0,
            },
          }),
        }
      );

      if (!response.ok) {
        setLoadingAudio(false);
        throw new Error("Failed to generate speech.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.addEventListener("ended", () => {
        setTalking(false);
      });

      audio.addEventListener("error", (event) => {
        console.error(event, "Audio.onerror");
      });

      audio.addEventListener("play", () => {
        setLoadingAudio(false);

        setTalking(true);
        talk();
      });
      setLoadingAudio(false);

      audio.play();
      setSpokenPhrase(phrase);
    } catch (error) {
      console.error(error);
    }
  }

  function handleTextInput(e: any) {
    const phrase = e.target.value;
    setPhrase(phrase);
  }

  function toggleVoice() {
    setSelectedVoice((prevVoice) => (prevVoice === 0 ? 1 : 0));
  }

  return (
    <div className="App">
      <h1>VoiceGPT</h1>

      <input onChange={handleTextInput} type="text" />
      <button
        onClick={() => {
          queryChatGPT(phrase);
        }}
      >
        send
      </button>
      {loadingResponse && <div>thinking...</div>}
      {loadingAudio && <div>loading spoken response...</div>}

      <button onClick={toggleVoice}>
        Toggle Voice:{" "}
        {voiceIds[selectedVoice].id === "Mmcxgtk6qVdkx0YUY9Qf"
          ? "Joe Rogan"
          : "Mandalorian"}
      </button>

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
