import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  MapPin,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const initialForm = {
  recipientName: '',
  recipientPhone: '',
  deliveryAddress: '',
  city: 'Kandy',
  instructions: '',
  weight: '1',
  description: '',
  service: 'Standard',
  payment: 'Cash on Delivery',
  codAmount: '',
  pickupDate: '2026-09-09',
};

export default function CreateShipmentPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const charges = useMemo(() => {
    const weight = Number(form.weight) || 0;
    const base = weight <= 1 ? 350 : weight <= 2 ? 450 : weight <= 5 ? 650 : 900;
    const serviceFee = form.service === 'Express' ? 250 : form.service === 'Priority' ? 450 : 0;
    const codFee = form.payment === 'Cash on Delivery' ? 50 : 0;
    return { base, serviceFee, codFee, total: base + serviceFee + codFee };
  }, [form.weight, form.service, form.payment]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return <ConfirmationPage form={form} />;
  }

  return (
    <div className="customer-booking-page">
      <style>{bookingStyles}</style>
      <header className="booking-header">
        <Link className="booking-brand" to="/customer" aria-label="Back to customer dashboard">
          <span className="booking-brand-mark">EG</span>
          <span><strong>EgoTECHWORLD</strong><small>Customer portal</small></span>
        </Link>
        <div className="booking-header-note"><ShieldCheck size={17} /> Secure shipment booking</div>
      </header>

      <main className="booking-layout">
        <div className="booking-form-column">
          <Link className="booking-back" to="/customer"><ArrowLeft size={15} /> Back to dashboard</Link>
          <div className="booking-title"><span className="booking-eyebrow">New shipment</span><h1>Send a package</h1><p>Tell us where it needs to go. We will handle the rest.</p></div>
          <div className="booking-steps"><span className="active"><b>1</b> Shipment details</span><span><b>2</b> Review & confirm</span></div>

          <form onSubmit={submit}>
            <section className="booking-section">
              <SectionHeading number="01" icon={MapPin} title="Recipient details" description="Who should receive this shipment?" />
              <div className="booking-fields booking-fields-two">
                <Field label="Recipient name" name="recipientName" value={form.recipientName} onChange={update} placeholder="e.g. John Perera" required />
                <Field label="Phone number" name="recipientPhone" value={form.recipientPhone} onChange={update} placeholder="07X XXX XXXX" required />
              </div>
              <div className="booking-fields booking-fields-two">
                <Field label="Delivery address" name="deliveryAddress" value={form.deliveryAddress} onChange={update} placeholder="House number, street and area" required />
                <SelectField label="City / district" name="city" value={form.city} onChange={update} options={['Kandy', 'Colombo', 'Galle', 'Jaffna', 'Kurunegala', 'Matara']} />
              </div>
              <Field label="Delivery instructions (optional)" name="instructions" value={form.instructions} onChange={update} placeholder="Landmark or notes for the driver" />
            </section>

            <section className="booking-section">
              <SectionHeading number="02" icon={Package} title="Package details" description="A few details help us price and handle it correctly." />
              <div className="booking-fields booking-fields-three">
                <Field label="Weight (kg)" name="weight" type="number" min="0.1" step="0.1" value={form.weight} onChange={update} required />
                <Field label="What is inside?" name="description" value={form.description} onChange={update} placeholder="e.g. Clothing" required />
                <SelectField label="Delivery service" name="service" value={form.service} onChange={update} options={['Standard', 'Express', 'Priority']} />
              </div>
              <div className="service-note"><CircleHelp size={15} /><span>Fragile or valuable items may need additional handling. Please mention them in the description.</span></div>
            </section>

            <section className="booking-section">
              <SectionHeading number="03" icon={CalendarDays} title="Pickup and payment" description="Choose how and when we collect your package." />
              <div className="booking-fields booking-fields-two">
                <Field label="Preferred pickup date" name="pickupDate" type="date" value={form.pickupDate} onChange={update} required />
                <SelectField label="Payment method" name="payment" value={form.payment} onChange={update} options={['Cash on Delivery', 'Prepaid']} />
              </div>
              {form.payment === 'Cash on Delivery' && <Field label="Amount to collect (Rs)" name="codAmount" type="number" min="0" value={form.codAmount} onChange={update} placeholder="e.g. 4500" required />}
            </section>

            <div className="booking-form-footer"><span><ShieldCheck size={16} /> Final charges are calculated securely by EgoTECHWORLD.</span><button className="booking-submit" type="submit">Review shipment <ArrowRight size={16} /></button></div>
          </form>
        </div>

        <aside className="booking-summary-column">
          <div className="booking-summary booking-sticky">
            <span className="booking-eyebrow">Live estimate</span><h2>Charge summary</h2>
            <div className="summary-route"><span className="summary-route-point origin">C</span><div><small>Pickup</small><strong>Colombo Central</strong></div><ArrowRight size={15} /><span className="summary-route-point destination">{form.city.slice(0, 1)}</span><div><small>Delivery</small><strong>{form.city}</strong></div></div>
            <div className="summary-lines"><SummaryLine label="Base delivery charge" value={`Rs ${charges.base}`} /><SummaryLine label={`${form.service} service`} value={`Rs ${charges.serviceFee}`} /><SummaryLine label="COD handling" value={`Rs ${charges.codFee}`} /></div>
            <div className="summary-total"><span>Estimated total</span><strong>Rs {charges.total}</strong></div>
            <p className="summary-disclaimer">This is an estimate. Final pricing is confirmed after address and package verification.</p>
          </div>
          <div className="booking-side-card"><div className="side-card-icon"><Check size={17} /></div><div><strong>What happens next?</strong><p>We will confirm the pickup window and send your tracking number by SMS and email.</p></div></div>
        </aside>
      </main>
    </div>
  );
}

function SectionHeading({ number, icon: Icon, title, description }) {
  return <div className="booking-section-heading"><span className="section-number">{number}</span><span className="section-icon"><Icon size={17} /></span><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function Field({ label, name, value, onChange, placeholder, type = 'text', ...props }) {
  return <label className="booking-field"><span>{label}</span><input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} {...props} /></label>;
}

function SelectField({ label, name, value, onChange, options }) {
  return <label className="booking-field"><span>{label}</span><span className="select-wrap"><select name={name} value={value} onChange={onChange}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></span></label>;
}

function SummaryLine({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function ConfirmationPage({ form }) {
  return <div className="customer-booking-page"><style>{bookingStyles}</style><header className="booking-header"><Link className="booking-brand" to="/customer"><span className="booking-brand-mark">EG</span><span><strong>EgoTECHWORLD</strong><small>Customer portal</small></span></Link></header><main className="booking-confirmation"><div className="confirmation-check"><Check size={30} /></div><span className="booking-eyebrow">Shipment request received</span><h1>We are getting it moving.</h1><p>Your pickup request for <strong>{form.recipientName}</strong> is ready for confirmation. We will send the tracking number once a courier accepts the pickup.</p><div className="confirmation-reference"><span>Pickup to</span><strong>{form.city}</strong><span>Preferred date</span><strong>{form.pickupDate}</strong></div><Link className="booking-submit" to="/customer">Return to dashboard <ArrowRight size={16} /></Link></main></div>;
}

const bookingStyles = `
  .customer-booking-page { min-height: 100vh; background: #f4f6fa; color: #151a2e; font-family: Inter, sans-serif; } .booking-header { height: 76px; padding: 0 6vw; display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e3e7ef; } .booking-brand { display: flex; align-items: center; gap: 10px; color: #12213f; } .booking-brand > span:last-child strong, .booking-brand > span:last-child small { display: block; } .booking-brand strong { font: 700 14px Sora, sans-serif; } .booking-brand small { margin-top: 2px; color: #9aa1b4; font-size: 10px; } .booking-brand-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: #f5a524; color: #211200; font: 800 13px Sora, sans-serif; } .booking-header-note { display: flex; align-items: center; gap: 7px; color: #087367; font-size: 11px; font-weight: 700; }
  .booking-layout { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 40px 0 72px; display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(290px, .75fr); gap: 34px; } .booking-back { display: inline-flex; align-items: center; gap: 6px; color: #697086; font-size: 12px; font-weight: 600; } .booking-back:hover { color: #12213f; } .booking-title { margin: 28px 0 25px; } .booking-title h1, .booking-confirmation h1 { margin: 7px 0 8px; color: #12213f; font: 700 30px Sora, sans-serif; } .booking-title p { margin: 0; color: #697086; font-size: 13px; } .booking-eyebrow { color: #9aa1b4; font-size: 10px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; } .booking-steps { display: flex; gap: 30px; margin-bottom: 18px; border-bottom: 1px solid #e3e7ef; } .booking-steps span { display: flex; align-items: center; gap: 8px; padding: 0 2px 12px; color: #9aa1b4; font-size: 12px; font-weight: 700; border-bottom: 2px solid transparent; } .booking-steps span.active { color: #12213f; border-color: #f5a524; } .booking-steps b { width: 21px; height: 21px; display: grid; place-items: center; border-radius: 50%; background: #eef0f4; font-size: 10px; } .booking-steps .active b { background: #f5a524; color: #211200; }
  .booking-section { margin-top: 16px; padding: 24px; background: #fff; border: 1px solid #e3e7ef; border-radius: 14px; } .booking-section-heading { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 22px; } .section-number { color: #9aa1b4; font: 600 10px 'IBM Plex Mono', monospace; padding-top: 4px; } .section-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: #e8effe; color: #3e7bfa; } .booking-section-heading h2 { margin: 0; color: #12213f; font: 700 14px Sora, sans-serif; } .booking-section-heading p { margin: 4px 0 0; color: #9aa1b4; font-size: 11px; } .booking-fields { display: grid; gap: 14px; margin-bottom: 14px; } .booking-fields-two { grid-template-columns: repeat(2, 1fr); } .booking-fields-three { grid-template-columns: repeat(3, 1fr); } .booking-field { display: block; min-width: 0; } .booking-field > span:first-child { display: block; margin-bottom: 7px; color: #697086; font-size: 11px; font-weight: 700; } .booking-field input, .booking-field select { width: 100%; height: 42px; padding: 0 12px; border: 1px solid #e3e7ef; border-radius: 9px; outline: 0; background: #fff; color: #151a2e; font-size: 12px; } .booking-field input:focus, .booking-field select:focus { border-color: #3e7bfa; box-shadow: 0 0 0 3px #e8effe; } .booking-field input::placeholder { color: #b1b6c5; } .select-wrap { position: relative; display: block; } .select-wrap select { appearance: none; padding-right: 32px; } .select-wrap svg { position: absolute; top: 13px; right: 11px; color: #697086; pointer-events: none; } .service-note { display: flex; gap: 8px; align-items: flex-start; margin-top: 4px; padding: 10px 12px; border-radius: 8px; background: #f4f6fa; color: #697086; font-size: 10.5px; line-height: 1.45; } .service-note svg { flex: 0 0 auto; color: #3e7bfa; }
  .booking-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 18px; } .booking-form-footer > span { display: flex; align-items: center; gap: 6px; color: #697086; font-size: 10.5px; } .booking-form-footer > span svg { color: #0ea394; } .booking-submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 17px; border: 0; border-radius: 10px; background: #12213f; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .booking-summary { padding: 22px; border: 1px solid #e3e7ef; border-radius: 14px; background: #fff; } .booking-sticky { position: sticky; top: 20px; } .booking-summary h2 { margin: 6px 0 20px; color: #12213f; font: 700 17px Sora, sans-serif; } .summary-route { display: flex; align-items: center; gap: 7px; padding-bottom: 19px; border-bottom: 1px solid #e3e7ef; } .summary-route-point { width: 25px; height: 25px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 7px; font: 700 11px Sora, sans-serif; } .summary-route-point.origin { background: #e8effe; color: #3e7bfa; } .summary-route-point.destination { background: #e4f7f4; color: #0ea394; } .summary-route div { min-width: 0; flex: 1; } .summary-route small, .summary-route strong { display: block; } .summary-route small { color: #9aa1b4; font-size: 9px; } .summary-route strong { margin-top: 2px; color: #12213f; font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .summary-route > svg { color: #9aa1b4; } .summary-lines { padding: 13px 0; } .summary-lines > div, .summary-total { display: flex; justify-content: space-between; gap: 10px; } .summary-lines > div { padding: 7px 0; color: #697086; font-size: 11px; } .summary-lines strong { color: #151a2e; font-size: 11px; } .summary-total { padding-top: 13px; border-top: 1px solid #12213f; color: #12213f; font-size: 12px; font-weight: 700; } .summary-total strong { font: 700 18px Sora, sans-serif; } .summary-disclaimer { margin: 16px 0 0; padding: 11px; border-radius: 8px; background: #f4f6fa; color: #697086; font-size: 10px; line-height: 1.5; }
  .booking-side-card { display: flex; gap: 10px; margin-top: 14px; padding: 16px; border: 1px solid #e3e7ef; border-radius: 14px; background: #fff; } .side-card-icon { width: 30px; height: 30px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 8px; background: #e4f7f4; color: #0ea394; } .booking-side-card strong { color: #12213f; font-size: 11px; } .booking-side-card p { margin: 5px 0 0; color: #697086; font-size: 10px; line-height: 1.5; }
  .booking-confirmation { width: min(560px, calc(100% - 32px)); margin: 0 auto; padding: 110px 0; text-align: center; } .confirmation-check { width: 64px; height: 64px; margin: 0 auto 25px; display: grid; place-items: center; border-radius: 20px; background: #e4f7f4; color: #0ea394; } .booking-confirmation p { margin: 0 auto 25px; color: #697086; font-size: 13px; line-height: 1.7; } .booking-confirmation p strong { color: #12213f; } .confirmation-reference { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 auto 25px; padding: 16px; border: 1px solid #e3e7ef; border-radius: 12px; background: #fff; text-align: left; } .confirmation-reference span { color: #9aa1b4; font-size: 10px; } .confirmation-reference strong { color: #12213f; font-size: 12px; }
  @media (max-width: 820px) { .booking-layout { grid-template-columns: 1fr; width: min(640px, calc(100% - 32px)); padding-top: 28px; } .booking-sticky { position: static; } .booking-summary-column { grid-row: 1; } .booking-form-column { grid-row: 2; } }
  @media (max-width: 540px) { .booking-header { padding: 0 18px; } .booking-header-note { font-size: 0; } .booking-header-note svg { width: 18px; } .booking-layout { width: calc(100% - 24px); } .booking-title h1 { font-size: 26px; } .booking-section { padding: 17px; } .booking-fields-two, .booking-fields-three { grid-template-columns: 1fr; } .booking-form-footer { align-items: stretch; flex-direction: column; } .booking-submit { width: 100%; } .summary-route { gap: 5px; } }
`;