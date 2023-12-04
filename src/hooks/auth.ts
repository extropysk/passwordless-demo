import { useDidMount } from "@/hooks/did-mount";
import { useCallback, useEffect, useState } from "react";
import { AjaxError, ajax } from "../utils/ajax";

interface Token {
  sub: string;
  access_token: string;
}

interface Challenge {
  k1: string;
  lnurl: string;
  id: string;
}

enum ErrorCode {
  NotResponding = "NOT_RESPONDING",
}

interface Error {
  code: ErrorCode;
  message?: string;
}

interface Options {
  url?: string;
  onSuccess?: (token: Token) => void;
}

const DEFAULT_OPTIONS = {
  url: "https://pwd.extropy.sk",
};

export function useAuth(options: Options = {}) {
  const { url, onSuccess } = { ...DEFAULT_OPTIONS, ...options };
  const [token, setToken] = useState<Token | null>();
  const [challenge, setChallenge] = useState<Challenge>();
  const [error, setError] = useState<Error>();

  useDidMount(async () => {
    try {
      const token = await ajax<Token>(`${url}/auth/token`, {
        credentials: "include",
      });
      setToken(token);
    } catch (error: unknown) {
      if (error instanceof AjaxError && error.status === 401) {
        setToken(null);
      } else {
        setError({
          code: ErrorCode.NotResponding,
        });
      }
    }
  });

  const login = useCallback(async () => {
    if (token) {
      onSuccess?.(token);
    } else {
      const challenge = await ajax<Challenge>(`${url}/auth/challenge`, {
        credentials: "include",
      });
      setChallenge(challenge);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const logout = useCallback(async () => {
    if (token) {
      await ajax<object>(`${url}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setToken(null);
    }
  }, [token, url]);

  useEffect(() => {
    let eventSource: EventSource;
    if (challenge) {
      eventSource = new EventSource(`${url}/auth/sse/${challenge.id}`);
      eventSource.onmessage = async ({ data }) => {
        console.log(data);
        const token = await ajax<Token>(`${url}/auth/token`, {
          credentials: "include",
        });
        setToken(token);
        onSuccess?.(token);
      };
    }
    return () => {
      eventSource?.close();
    };
  }, [challenge, url, onSuccess]);

  return { challenge, token, error, login, logout };
}
