import { useState, useEffect } from "react";
import { PromptType } from "../types";
import { supabase } from "../utils/supabaseClient";
import { Bob } from "./Bob";
import { NewPrompt } from "./NewPrompt";
import { Prompt } from "./Prompt";

type Props = {
  session: any;
};

export default function Account({ session }: Props) {
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [prompts, setPrompts] = useState<PromptType[]>([]);
  const [settingsActive, setSettingsActive] = useState(false);

  useEffect(() => {
    getProfile();
    getPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const refresh = () => {
    getPrompts();
  };

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

  async function getPrompts() {
    const user = await getCurrentUser();
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
    setPrompts(prompts);
    return;
  }

  async function getProfile() {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createPrompt({ input, answer }: any) {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from("prompts")
        .insert([{ user_id: user.id, input, answer }]);

      if (error) {
        throw error;
      }

      getPrompts();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePrompt(prompt: PromptType) {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      const updates = {
        id: prompt.id,
        user_id: prompt.user_id,
        input: prompt.input,
        answer: prompt.answer,
        inserted_at: prompt.inserted_at,
      };

      let { error } = await supabase.from("prompts").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({ username, website, avatar_url }: any) {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const Guy = () => {
    return <Bob customPrompts={prompts} />;
  };

  const Settings = () => {
    return (
      <div className="form-widget">
        <NewPrompt refresh={getPrompts} />
        {prompts?.map((prompt: PromptType, i: number) => (
          <Prompt refresh={getPrompts} key={i} index={i} prompt={prompt} />
        ))}
        <div>
          <button
            className="button block"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  return <Guy />;
}
