import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageReceiptProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  size?: 'sm' | 'md';
}

export const MessageReceipt: React.FC<MessageReceiptProps> = ({ status, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const statusConfig = {
    sending: {
      icon: Clock,
      color: 'text-slate-400',
      label: 'Sending...'
    },
    sent: {
      icon: Check,
      color: 'text-slate-400',
      label: 'Sent'
    },
    delivered: {
      icon: CheckCheck,
      color: 'text-slate-400',
      label: 'Delivered'
    },
    read: {
      icon: CheckCheck,
      color: 'text-emerald-400',
      label: 'Read'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1" title={config.label}>
      <Icon className={`${iconSize} ${config.color}`} />
    </div>
  );
};
