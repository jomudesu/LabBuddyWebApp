import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  ShieldAlert,
  HeartPulse,
  BookOpen,
  Info
} from 'lucide-react';

const SafetyGuide = () => {
  const generalRules = [
    { title: "Personal Protective Equipment (PPE)", text: "Always wear safety goggles, protective latex or nitrile gloves, and a standard long-sleeve laboratory coat before interacting with any compound.", icon: "🥽" },
    { title: "No Food or Drink", text: "Eating, drinking, or chewing gum is strictly prohibited within the laboratory workspace to avoid random chemical ingestion or cross-contamination.", icon: "🚫" },
    { title: "Read Lab Procedures First", text: "Thoroughly review structural guidelines and chemical background properties prior to triggering reactions or compound interactions.", icon: "📖" },
    { title: "Immediate Reporting", text: "Report all physical or chemical spill occurrences, breakage of glass instruments, or minor injuries to your handling instructor immediately.", icon: "📢" },
  ];

  const emergencyProtocols = [
    { action: "Chemical Splashes", instruction: "Flush affected skin zones or eyes with continuous clean running water for at least 15 consecutive minutes using safety stations.", color: "border-amber-200 bg-amber-50/50 text-amber-900" },
    { action: "Thermal or Chemical Burns", instruction: "Apply cold running water instantly to the burn sector. Avoid applying secondary ointments before instructor examination.", color: "border-orange-200 bg-orange-50/50 text-orange-900" },
    { action: "Fire Emergencies", instruction: "Smother small bench fires using dry sand blankets or safety extinguishers. Evacuate following mapped arrows if uncontrolled.", color: "border-red-200 bg-red-50/50 text-red-900" },
  ];

  return (
    // Removed h-full, added pb-12 for bottom scrolling clearance
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col animate-fade-in bg-slate-100 pb-12">
      
      {/* HEADER banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-lg mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/10 border border-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Shield size={32} className="text-white" />
            </div>
            <span className="text-sm font-bold bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">Manual V1.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-3">Laboratory Safety Manual</h1>
          <p className="text-blue-100 font-medium text-base md:text-lg mt-3 max-w-2xl leading-relaxed">
            Essential guidelines, hazard identifiers, and emergency response protocols for safe virtual and physical scientific exploration.
          </p>
        </div>
        <div className="hidden lg:block shrink-0 relative z-10 opacity-20">
          <ShieldAlert size={160} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER COLUMNS: RULES & HAZARDS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Rules */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <BookOpen size={24} className="text-blue-600" /> General Code of Conduct
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generalRules.map((rule, idx) => (
                <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex items-start hover:shadow-md transition-all duration-300">
                  <span className="text-4xl mr-5 bg-white p-3 rounded-xl shadow-sm shrink-0">{rule.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base leading-snug">{rule.title}</h4>
                    <p className="text-sm md:text-base text-slate-600 font-medium mt-2 leading-relaxed">{rule.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NFPA Chemical Hazard Identification Diamond System Explained */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <AlertTriangle size={24} className="text-orange-500" /> Chemical Hazard Rating System (NFPA 704)
            </h2>
            <p className="text-sm md:text-base font-medium text-slate-500 mb-8">Standard diamond coding system utilized globally to mark safety handling limits.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 border-l-4 border-red-500 bg-red-50/40 rounded-r-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Flame className="text-red-500 shrink-0" size={24} />
                  <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">Flammability</h4>
                </div>
                <p className="text-sm text-red-800 font-medium leading-relaxed">Indicates susceptibility of organic compounds to ignition, fire, or heat flashes.</p>
              </div>
              
              <div className="p-5 border-l-4 border-blue-500 bg-blue-50/40 rounded-r-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="text-blue-500 shrink-0" size={24} />
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-wide">Health Hazard</h4>
                </div>
                <p className="text-sm text-blue-800 font-medium leading-relaxed">Measures structural toxicity level upon skin exposure, vapor inhalation, or accidental touch.</p>
              </div>
              
              <div className="p-5 border-l-4 border-amber-500 bg-amber-50/40 rounded-r-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Droplet className="text-amber-500 shrink-0" size={24} />
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide">Instability</h4>
                </div>
                <p className="text-sm text-amber-800 font-medium leading-relaxed">Rates structural capability of undergoing violent chemical change or detonation under pressure.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: EMERGENCY RESPONSIBILITY */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <ShieldAlert size={24} className="text-red-600" /> Emergency Response
            </h2>
            <p className="text-sm md:text-base font-medium text-slate-500 mb-6">First-line field actions to carry out in case of structural laboratory anomalies.</p>
            
            <div className="space-y-4 flex-1">
              {emergencyProtocols.map((protocol, idx) => (
                <div key={idx} className={`p-5 border rounded-xl flex flex-col gap-2 ${protocol.color}`}>
                  <h4 className="text-sm md:text-base font-black uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-current" /> {protocol.action}
                  </h4>
                  <p className="text-sm md:text-base font-medium leading-relaxed">{protocol.instruction}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 p-5 rounded-xl flex items-start gap-3">
              <Info size={24} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 font-semibold leading-relaxed">
                This digital layout is fully supplementary. Always abide by standard physical laboratory constraints laid out by your instructors.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SafetyGuide;