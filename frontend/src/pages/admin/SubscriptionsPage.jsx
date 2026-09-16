import React from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';

export default function SubscriptionsPage() {
  const { organizations, subscriptionPlans, setOrgPlan } = useStore();
  const primaryOrg = organizations[0];

  const handleChoose = (plan) => {
    if (!primaryOrg) return;
    setOrgPlan(primaryOrg.id, plan.id, plan.name);
    toast.success(`Switched to the ${plan.name} plan`);
  };

  return (
    <PortalLayout>
      <style>{`.subscription-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:16px}@media(max-width:900px){.subscription-plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.subscription-plan-grid{grid-template-columns:1fr}}`}</style>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Subscription plan</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Subscription plan</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Current plan for {primaryOrg?.name}: <b style={{ color: '#12213F' }}>{primaryOrg?.plan}</b></div>
      </div>

      <div className="subscription-plan-grid">
        {subscriptionPlans.map((plan) => {
          const isCurrent = primaryOrg?.plan === plan.name;
          return (
            <div key={plan.id} style={{ background: '#fff', border: `2px solid ${isCurrent ? '#F5A524' : '#E3E7EF'}`, borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#12213F' }}>{plan.name}</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22, color: '#12213F', margin: '8px 0 16px' }}>{plan.price}</div>
              <div style={{ display: 'grid', gap: 8, marginBottom: 20, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#697086' }}>
                    <Check size={14} color="#0C8C6B" /> {f}
                  </div>
                ))}
              </div>
              <Button variant={isCurrent ? 'secondary' : 'accent'} disabled={isCurrent} onClick={() => handleChoose(plan)}>
                {isCurrent ? 'Current plan' : 'Switch to this plan'}
              </Button>
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}
