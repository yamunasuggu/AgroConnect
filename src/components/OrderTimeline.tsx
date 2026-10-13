import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

const STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'accepted', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: PackageCheck },
  { status: 'shipped', label: 'In Transit', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const isFailed = order.status === 'cancelled' || order.status === 'rejected';

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  if (isFailed) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm capitalize">Order {order.status}</h4>
          <p className="text-xs text-red-700 mt-1">
            This order was {order.status}. If funds were held in escrow, they have been automatically refunded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
        
        {/* Active progress line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-700 -z-0"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 90}%` }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isPassed
                    ? isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                      : 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold tracking-tight text-center ${
                  isPassed ? 'text-emerald-900' : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline logs */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="mt-5 space-y-2 pt-4 border-t border-stone-100">
          <div className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
            Activity Log
          </div>
          <div className="space-y-1.5">
            {order.timeline.map((item, i) => (
              <div key={i} className="text-xs flex items-start justify-between text-stone-600">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-stone-900 capitalize">{item.status}:</span>
                  <span>{item.note}</span>
                </div>
                <span className="text-stone-400 shrink-0 text-[11px]">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
