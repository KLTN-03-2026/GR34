import { useState, useEffect, useCallback } from "react";
import { socket } from "../lib/socket";

const CHAT_STATE_KEY = "dispatcher_chat_state";

function loadState() {
  try {
    const raw = localStorage.getItem(CHAT_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { unreadCount: 0, hasAlert: false, lastAlertAt: null };
}

function saveState(state) {
  try {
    localStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state));
  } catch {}
}

// Module-level dispatcher chat state (survives component remounts)
let _dispatcherState = loadState();
const _listeners = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn({ ..._dispatcherState }));
}

export function useDispatcherChatState() {
  const [state, setState] = useState({ ..._dispatcherState });

  useEffect(() => {
    const fn = (s) => setState({ ...s });
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }, []);

  const setAlert = useCallback((val) => {
    _dispatcherState = { ..._dispatcherState, hasAlert: val, lastAlertAt: val ? Date.now() : _dispatcherState.lastAlertAt };
    saveState(_dispatcherState);
    notifyListeners();
  }, []);

  const setUnread = useCallback((count) => {
    _dispatcherState = { ..._dispatcherState, unreadCount: count };
    saveState(_dispatcherState);
    notifyListeners();
  }, []);

  const clearAlert = useCallback(() => {
    _dispatcherState = { ..._dispatcherState, hasAlert: false, unreadCount: 0 };
    saveState(_dispatcherState);
    notifyListeners();
  }, []);

  return { state, setAlert, setUnread, clearAlert };
}

// Singleton socket listener — attach once at app start
let _socketReady = false;

export function initDispatcherSocket() {
  if (_socketReady) return;
  _socketReady = true;

  socket.on("newMessage", (msg) => {
    if (msg.role === "customer") {
      _dispatcherState = {
        ..._dispatcherState,
        hasAlert: true,
        unreadCount: _dispatcherState.unreadCount + 1,
        lastAlertAt: Date.now(),
      };
      saveState(_dispatcherState);
      notifyListeners();
    }
  });

  socket.on("newChat", ({ chatId }) => {
    _dispatcherState = {
      ..._dispatcherState,
      hasAlert: true,
      unreadCount: _dispatcherState.unreadCount + 1,
    };
    saveState(_dispatcherState);
    notifyListeners();
  });
}
