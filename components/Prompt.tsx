import { useEffect, useState } from "react";
import { PromptType } from "../types";
import { supabase } from "../utils/supabaseClient";

type Props = {
  prompt: PromptType;
  index: number;
  refresh: any;
};

export function Prompt({ prompt, index, refresh }: Props) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInput(prompt.input);
    setAnswer(prompt.answer);
  }, [prompt]);

  async function getCurrentUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!session?.user) {
      throw new Error("User not logged in");
    }

    return session.user;
  }

  async function updatePrompt() {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      const updates = {
        id: prompt.id,
        user_id: prompt.user_id,
        input: input,
        answer: answer,
        inserted_at: prompt.inserted_at,
      };

      let { error } = await supabase.from("prompts").upsert(updates);

      if (error) {
        throw error;
      }
      refresh();
      alert("prompt updated");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deletePrompt() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", prompt.id);

      if (error) {
        throw error;
      }

      refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {`prompt ${index + 1}`}
      <div>
        <label htmlFor="prompt">Input</label>
        <input
          id="input"
          type="text"
          defaultValue={input || ""}
          onChange={(e: any) => setInput(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="answer">Answer</label>
        <input
          id="answer"
          type="answer"
          defaultValue={answer || ""}
          onChange={(e: any) => setAnswer(e.target.value)}
        />
      </div>
      <div
        className="buttons"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <button onClick={updatePrompt}>update</button>
        <button onClick={deletePrompt}>delete</button>
      </div>
    </>
  );
}
