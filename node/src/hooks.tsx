import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { PingBusClient } from './client';
import { Notification, EmailLog, PingBusResponse, PaginatedResponse } from './types';

const PingBusContext = createContext<PingBusClient | null>(null);

interface PingBusProviderProps {
  client: PingBusClient;
  children: ReactNode;
}

export const PingBusProvider = ({ client, children }: PingBusProviderProps) => {
  return <PingBusContext.Provider value={client}>{children}</PingBusContext.Provider>;
};

export const usePingBus = () => {
  const client = useContext(PingBusContext);
  if (!client) throw new Error('usePingBus must be used within a PingBusProvider');
  return client;
};

// --- WhatsApp Hooks ---

export const useWhatsAppStatus = (instanceId: string, options?: any) => {
  const sdk = usePingBus();
  return useQuery({
    queryKey: ['whatsapp', instanceId, 'status'],
    queryFn: () => sdk.whatsapp.getStatus(instanceId),
    ...options
  });
};

export const useSendMessage = (options?: any) => {
  const sdk = usePingBus();
  return useMutation({
    mutationFn: ({ instanceId, chatId, msg }: { instanceId: string; chatId: string; msg: string }) => 
      sdk.whatsapp.sendMessage(instanceId, chatId, msg),
    ...options
  });
};

export const useReceiveNotification = (instanceId: string, options?: any) => {
  const sdk = usePingBus();
  return useQuery({
    queryKey: ['whatsapp', instanceId, 'notifications'],
    queryFn: () => sdk.whatsapp.receive(instanceId),
    ...options
  });
};

// --- Email Hooks ---

export const useEmailLogs = (limit?: number, offset?: number, options?: any) => {
  const sdk = usePingBus();
  return useQuery({
    queryKey: ['email', 'logs', limit, offset],
    queryFn: () => sdk.email.listLogs(limit, offset),
    ...options
  });
};

export const useSendEmail = (options?: any) => {
  const sdk = usePingBus();
  return useMutation({
    mutationFn: (data: { to: string; subject: string; body: string; instanceId?: string }) => 
      sdk.email.send(data.to, data.subject, data.body, { instanceId: data.instanceId }),
    ...options
  });
};

// --- Account & Balance ---

export const useBalance = (options?: any) => {
  const sdk = usePingBus();
  return useQuery({
    queryKey: ['account', 'balance'],
    queryFn: () => sdk.balance.getBalance(),
    ...options
  });
};
