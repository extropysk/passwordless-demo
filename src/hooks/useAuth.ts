import { useEffect, useState } from "react";
import { AjaxError, ajax } from "../utils/ajax";
import { useDidMount } from "./useDidMount";

interface Token {
  sub: string;
  access_token: string;
}

interface Challenge {
  k1: string;
  lnurl: string;
}

enum ErrorCode {
  NotResponding = "NOT_RESPONDING",
}

interface Error {
  code: ErrorCode;
  message: string;
}

export function useAuth(url: string) {
  const [token, setToken] = useState<Token>();
  const [challenge, setChallenge] = useState<Challenge>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useDidMount(async () => {
    try {
      const token = await ajax<Token>(`${url}/auth/token`, {
        credentials: "include",
      });
      setToken(token);
    } catch (error: unknown) {
      if (error instanceof AjaxError && error.status === 401) {
        const lnurl = await ajax<Challenge>(`${url}/auth/challenge`, {
          credentials: "include",
        });
        setChallenge(lnurl);
      } else {
        setError({
          code: ErrorCode.NotResponding,
          message: "Not responding, try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    let eventSource: EventSource;
    if (challenge?.k1) {
      eventSource = new EventSource(`${url}/auth/sse/${challenge?.k1}`);
      eventSource.onmessage = async ({ data }) => {
        console.log(data);
        const token = await ajax<Token>(`${url}/auth/token`, {
          credentials: "include",
        });
        setToken(token);
      };
    }
    return () => {
      eventSource?.close();
    };
  }, [challenge?.k1, url]);

  return { challenge, token, error, isLoading };
}
