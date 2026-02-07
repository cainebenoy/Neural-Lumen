'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Info, Zap, CloudFog, CheckCircle, Clock } from 'lucide-react';

export interface SystemEvent {
  id: string;
  type: 'crash' | 'weather' | 'grid' | 'info' | 'success';
  message: string;
  timestamp: Date;
}

// Event log store (simple in-memory)
let eventLog: SystemEvent[] = [];
let eventListeners: ((events: SystemEvent[]) => void)[] = [];

export const addSystemEvent = (type: SystemEvent['type'], message: string) => {
  const event: SystemEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    timestamp: new Date()
  };
  eventLog = [event, ...eventLog].slice(0, 10); // Keep last 10
  eventListeners.forEach(listener => listener([...eventLog]));
};

export const clearEventLog = () => {
  eventLog = [];
  eventListeners.forEach(listener => listener([]));
};

const getEventIcon = (type: SystemEvent['type']) => {
  switch (type) {
    case 'crash':
      return <AlertTriangle size={12} className="text-red-400" />;
    case 'weather':
      return <CloudFog size={12} className="text-amber-400" />;
    case 'grid':
      return <Zap size={12} className="text-orange-400" />;
    case 'success':
      return <CheckCircle size={12} className="text-emerald-400" />;
    default:
      return <Info size={12} className="text-cyan-400" />;
  }
};

const getEventColor = (type: SystemEvent['type']) => {
  switch (type) {
    case 'crash':
      return 'border-l-red-500';
    case 'weather':
      return 'border-l-amber-500';
    case 'grid':
      return 'border-l-orange-500';
    case 'success':
      return 'border-l-emerald-500';
    default:
      return 'border-l-cyan-500';
  }
};

/**
 * EventLog Component - Shows recent system events
 */
export const EventLog = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    // Register listener
    const listener = (newEvents: SystemEvent[]) => setEvents(newEvents);
    eventListeners.push(listener);
    setEvents([...eventLog]);

    return () => {
      eventListeners = eventListeners.filter(l => l !== listener);
    };
  }, []);

  if (events.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock size={20} className="mx-auto text-slate-600 mb-2" />
        <p className="text-[10px] text-slate-600 font-mono">No events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
      {events.map((event) => (
        <div
          key={event.id}
          className={`flex items-start gap-2 p-1.5 bg-black/30 rounded border-l-2 ${getEventColor(event.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getEventIcon(event.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-300 truncate">{event.message}</p>
            <p className="text-[8px] text-slate-600 font-mono">
              {event.timestamp.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
