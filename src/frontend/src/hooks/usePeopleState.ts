/**
 * Shared state for the People module.
 * Both SecondaryPanel and MainPanel are lazy-loaded independently by the shell,
 * so module-level state is used to share selected filter + member across them.
 * Uses useSyncExternalStore for reliable cross-panel reactivity.
 */
import { useSyncExternalStore } from "react";

interface PeopleStore {
  selectedFilter: string;
  selectedMemberId: string | null;
}

let _state: PeopleStore = {
  selectedFilter: "All Members",
  selectedMemberId: null,
};

const _listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

function getSnapshot(): PeopleStore {
  return _state;
}

function notify(next: PeopleStore) {
  _state = next;
  for (const fn of _listeners) fn();
}

export function usePeopleState() {
  const state = useSyncExternalStore(subscribe, getSnapshot);

  return {
    selectedFilter: state.selectedFilter,
    selectedMemberId: state.selectedMemberId,
    setSelectedFilter: (f: string) => {
      notify({ ..._state, selectedFilter: f });
    },
    setSelectedMemberId: (id: string | null) => {
      notify({ ..._state, selectedMemberId: id });
    },
  };
}
