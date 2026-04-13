import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultMortgageState,
  SCHEMA_VERSION,
  serializeMortgageState,
  type AppPersisted,
} from "../storage/mortgageState";
import {
  loadPersistedMortgageState,
  savePersistedMortgageState,
  subscribeMortgageStateRemote,
} from "../storage/localStore";

export function useMortgageSyncedState() {
  const [state, setState] = useState<AppPersisted>(loadPersistedMortgageState);
  const lastSerialized = useRef(serializeMortgageState(state));

  useEffect(() => {
    return subscribeMortgageStateRemote((remote) => {
      const incoming = serializeMortgageState(remote);
      if (incoming === lastSerialized.current) return;
      lastSerialized.current = incoming;
      setState(remote);
    });
  }, []);

  useEffect(() => {
    const serialized = serializeMortgageState(state);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    savePersistedMortgageState(state);
  }, [state]);

  const patch = useCallback((partial: Partial<AppPersisted>) => {
    setState((prev) => ({ ...prev, ...partial, v: SCHEMA_VERSION }));
  }, []);

  const reset = useCallback(() => {
    const next = defaultMortgageState();
    lastSerialized.current = serializeMortgageState(next);
    savePersistedMortgageState(next);
    setState(next);
  }, []);

  const replace = useCallback((next: AppPersisted) => {
    lastSerialized.current = serializeMortgageState(next);
    savePersistedMortgageState(next);
    setState(next);
  }, []);

  return { state, patch, reset, replace };
}
