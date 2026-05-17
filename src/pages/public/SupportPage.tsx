import { Mail, MessageSquare, ExternalLink } from 'lucide-react';

export function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold text-on-surface mb-4">Help & Support</h1>
        <p className="text-on-surface-variant">We're here to help if you encounter any issues with the platform or a verified seller.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center text-center">
          <Mail className="w-10 h-10 text-primary mb-4" />
          <h2 className="text-xl font-bold font-heading mb-2">Email Us</h2>
          <p className="text-sm text-on-surface-variant mb-6">For general inquiries, partnership requests, or dispute escalations.</p>
          <a href="mailto:admin@gamelootnepal.store" className="bg-surface-container-high hover:bg-surface-container-highest px-6 py-2 rounded-xl border border-outline-variant/30 text-sm font-semibold transition-colors mt-auto">
            admin@gamelootnepal.store
          </a>
        </div>
        
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center text-center">
          <MessageSquare className="w-10 h-10 text-tertiary mb-4" />
          <h2 className="text-xl font-bold font-heading mb-2">Social Support</h2>
          <p className="text-sm text-on-surface-variant mb-6">Message our official community pages for quick community-level assistance.</p>
          <div className="flex gap-3 mt-auto">
             <button className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-semibold transition-colors flex items-center gap-2">
               Discord
             </button>
             <button className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-semibold transition-colors flex items-center gap-2">
               Facebook
             </button>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="font-heading font-bold text-lg mb-1">Are you a verified seller?</h3>
           <p className="text-sm text-on-surface-variant">Check out the API documentation and seller portal resources.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-primary-container transition-colors">
          Seller Portal
        </button>
      </div>
    </div>
  );
}
