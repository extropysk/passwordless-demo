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

export function useAuth(url: string) {
  const [token, setToken] = useState<Token>();
  const [challenge, setChallenge] = useState<Challenge>();

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
        console.error(error);
      }
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

  return { challenge, token };
}
