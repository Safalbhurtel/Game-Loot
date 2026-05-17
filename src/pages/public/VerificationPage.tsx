import { ShieldCheck, UserCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function VerificationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-heading font-bold mb-4 text-on-surface">Seller Verification Process</h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
          We take trust seriously. Learn how we ensure every seller on GameLoot Nepal is legitimate and reliable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold font-heading flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-tertiary" /> Identity Verification
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Every seller must provide official government ID (Citizenship/Passport) and business registration credentials. We manually verify these documents to ensure the seller is a legally operating entity in Nepal.
          </p>
        </div>
        
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold font-heading flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-primary" /> Product Sourcing Proof
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Sellers must demonstrate their supply chain. Whether it's direct retailer partnerships, authorized wholesale, or bulk purchases, we ensure digital goods are obtained legally and are not stolen or fraudulent.
          </p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
        <AlertOctagon className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-bold font-heading mb-4">Zero Tolerance Policy</h2>
        <p className="text-on-surface-variant max-w-3xl mx-auto leading-relaxed mb-8">
          We actively monitor transactions. Any seller caught providing invalid keys, delaying deliveries unprofessionally, or attempting fraud is permanently banned from GameLoot Nepal.
        </p>
        <button className="bg-surface-container-high text-on-surface border border-outline-variant py-3 px-6 rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
          Report a Seller
        </button>
      </div>
    </div>
  );
}
