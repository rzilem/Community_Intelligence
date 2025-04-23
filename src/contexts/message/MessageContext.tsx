
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { MessageContextState, MessageContextValue } from '@/types/message-form-types';
import { MessageCategory } from '@/types/communication-types';

const initialState: MessageContextState = {
  messageType: 'email',
  subject: '',
  content: '',
  selectedGroups: [],
  selectedAssociationId: '',
  category: 'general',
  isScheduled: false,
  scheduledDate: null,
  previewMode: false,
};

type MessageAction =
  | { type: 'SET_MESSAGE_TYPE'; payload: 'email' | 'sms' }
  | { type: 'SET_SUBJECT'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SELECTED_GROUPS'; payload: string[] }
  | { type: 'SET_ASSOCIATION_ID'; payload: string }
  | { type: 'SET_CATEGORY'; payload: MessageCategory }
  | { type: 'TOGGLE_SCHEDULE' }
  | { type: 'SET_SCHEDULED_DATE'; payload: Date | null }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'RESET' };

function messageReducer(state: MessageContextState, action: MessageAction): MessageContextState {
  switch (action.type) {
    case 'SET_MESSAGE_TYPE':
      return { ...state, messageType: action.payload };
    case 'SET_SUBJECT':
      return { ...state, subject: action.payload };
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_SELECTED_GROUPS':
      return { ...state, selectedGroups: action.payload };
    case 'SET_ASSOCIATION_ID':
      return { ...state, selectedAssociationId: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'TOGGLE_SCHEDULE':
      return { ...state, isScheduled: !state.isScheduled };
    case 'SET_SCHEDULED_DATE':
      return { ...state, scheduledDate: action.payload };
    case 'TOGGLE_PREVIEW':
      return { ...state, previewMode: !state.previewMode };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  const contextValue: MessageContextValue = {
    ...state,
    setMessageType: useCallback((type) => dispatch({ type: 'SET_MESSAGE_TYPE', payload: type }), []),
    setSubject: useCallback((subject) => dispatch({ type: 'SET_SUBJECT', payload: subject }), []),
    setContent: useCallback((content) => dispatch({ type: 'SET_CONTENT', payload: content }), []),
    setSelectedGroups: useCallback((groups) => dispatch({ type: 'SET_SELECTED_GROUPS', payload: groups }), []),
    setSelectedAssociationId: useCallback((id) => dispatch({ type: 'SET_ASSOCIATION_ID', payload: id }), []),
    setCategory: useCallback((category) => dispatch({ type: 'SET_CATEGORY', payload: category }), []),
    toggleSchedule: useCallback(() => dispatch({ type: 'TOGGLE_SCHEDULE' }), []),
    setScheduledDate: useCallback((date) => dispatch({ type: 'SET_SCHEDULED_DATE', payload: date }), []),
    togglePreview: useCallback(() => dispatch({ type: 'TOGGLE_PREVIEW' }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return <MessageContext.Provider value={contextValue}>{children}</MessageContext.Provider>;
}

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
}
