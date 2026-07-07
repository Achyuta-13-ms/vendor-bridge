"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, ArrowLeft, UploadCloud, CheckCircle2, Building, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "Business Information" },
  { id: 2, title: "Business Details" },
  { id: 3, title: "Business Address" },
  { id: 4, title: "Authorized Person" },
  { id: 5, title: "Upload Documents" }
];

export default function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    legalName: "", tradeName: "", businessType: "", industry: "", companySize: "", website: "",
    gst: "", pan: "", cin: "", msme: "",
    address: "", city: "", state: "", pin: "",
    authName: "", authDesig: "", authEmail: "", authMobile: "",
  });

  const [uploads, setUploads] = useState({
    gst: false, pan: false, inc: false, cheque: false, other: false
  });

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push("/onboarding/verifying");
    } catch (error) {
      toast({ title: "Submission Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Simplified Mock File Upload Component
  const MockUpload = ({ label, uploadedKey }: { label: string, uploadedKey: keyof typeof uploads }) => {
    const isUploaded = uploads[uploadedKey];
    return (
      <div 
        className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3
          ${isUploaded ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 hover:border-black hover:bg-zinc-50"}
        `}
        onClick={() => {
          if (!isUploaded) {
            setUploads(prev => ({ ...prev, [uploadedKey]: true }));
            toast({ title: `${label} uploaded successfully` });
          }
        }}
      >
        {isUploaded ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span className="font-semibold text-emerald-700">{label} Uploaded</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-zinc-400" />
            <span className="font-semibold text-zinc-600">Click to upload {label}</span>
            <span className="text-xs text-zinc-400">PDF, JPG or PNG (Max 5MB)</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <span className="font-extrabold text-xl text-black tracking-tight hidden sm:block">VyapaarSetu</span>
          </Link>
          <div className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Secure Setup
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar / Progress */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-sm font-bold text-black uppercase tracking-widest mb-6">Profile Setup</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                {STEPS.map((s) => {
                  const isActive = step === s.id;
                  const isCompleted = step > s.id;
                  return (
                    <div key={s.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center gap-4 ${isActive ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors
                          ${isCompleted ? 'bg-black text-white' : isActive ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-zinc-200 text-zinc-500'}
                        `}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{s.id}</span>}
                        </div>
                        <span className={`font-semibold ${isActive ? 'text-black' : 'text-zinc-600'}`}>{s.title}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.04)] overflow-hidden min-h-[500px]">
            <div className="p-8 sm:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="mb-8 border-b border-zinc-100 pb-6">
                    <h1 className="text-2xl font-extrabold text-black mb-2">{STEPS[step - 1].title}</h1>
                    <p className="text-zinc-500">Provide accurate information to ensure seamless verification.</p>
                  </div>

                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Legal Business Name</label>
                          <Input value={formData.legalName} onChange={e => updateForm("legalName", e.target.value)} className="h-12 bg-zinc-50" placeholder="As per PAN" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Trade Name</label>
                          <Input value={formData.tradeName} onChange={e => updateForm("tradeName", e.target.value)} className="h-12 bg-zinc-50" placeholder="Store or brand name" />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Business Type</label>
                          <Select onValueChange={v => updateForm("businessType", v)} value={formData.businessType}>
                            <SelectTrigger className="h-12 bg-zinc-50"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prop">Sole Proprietorship</SelectItem>
                              <SelectItem value="llp">LLP</SelectItem>
                              <SelectItem value="pvt">Private Limited</SelectItem>
                              <SelectItem value="pub">Public Limited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Industry</label>
                          <Select onValueChange={v => updateForm("industry", v)} value={formData.industry}>
                            <SelectTrigger className="h-12 bg-zinc-50"><SelectValue placeholder="Select industry" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retail">Retail & FMCG</SelectItem>
                              <SelectItem value="tech">Technology / SaaS</SelectItem>
                              <SelectItem value="logistics">Logistics</SelectItem>
                              <SelectItem value="finance">Financial Services</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Company Size</label>
                          <Select onValueChange={v => updateForm("companySize", v)} value={formData.companySize}>
                            <SelectTrigger className="h-12 bg-zinc-50"><SelectValue placeholder="Select size" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 Employees</SelectItem>
                              <SelectItem value="11-50">11-50 Employees</SelectItem>
                              <SelectItem value="51-200">51-200 Employees</SelectItem>
                              <SelectItem value="200+">200+ Employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Website (Optional)</label>
                          <Input value={formData.website} onChange={e => updateForm("website", e.target.value)} className="h-12 bg-zinc-50" placeholder="https://" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">GST Number</label>
                          <Input value={formData.gst} onChange={e => updateForm("gst", e.target.value)} className="h-12 bg-zinc-50 uppercase" placeholder="22AAAAA0000A1Z5" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">PAN Number</label>
                          <Input value={formData.pan} onChange={e => updateForm("pan", e.target.value)} className="h-12 bg-zinc-50 uppercase" placeholder="ABCDE1234F" />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">CIN (Optional)</label>
                          <Input value={formData.cin} onChange={e => updateForm("cin", e.target.value)} className="h-12 bg-zinc-50 uppercase" placeholder="U12345MH2023PTC123456" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">MSME Number (Optional)</label>
                          <Input value={formData.msme} onChange={e => updateForm("msme", e.target.value)} className="h-12 bg-zinc-50 uppercase" placeholder="UDYAM-MH-12-1234567" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-black">Registered Address</label>
                        <Input value={formData.address} onChange={e => updateForm("address", e.target.value)} className="h-12 bg-zinc-50" placeholder="Plot No, Street Name, Area" />
                      </div>
                      
                      <div className="grid sm:grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">City</label>
                          <Input value={formData.city} onChange={e => updateForm("city", e.target.value)} className="h-12 bg-zinc-50" placeholder="Mumbai" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">State</label>
                          <Input value={formData.state} onChange={e => updateForm("state", e.target.value)} className="h-12 bg-zinc-50" placeholder="Maharashtra" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">PIN Code</label>
                          <Input value={formData.pin} onChange={e => updateForm("pin", e.target.value)} className="h-12 bg-zinc-50" placeholder="400001" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Full Name</label>
                          <Input value={formData.authName} onChange={e => updateForm("authName", e.target.value)} className="h-12 bg-zinc-50" placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Designation</label>
                          <Input value={formData.authDesig} onChange={e => updateForm("authDesig", e.target.value)} className="h-12 bg-zinc-50" placeholder="Director / CEO" />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Work Email</label>
                          <Input value={formData.authEmail} onChange={e => updateForm("authEmail", e.target.value)} className="h-12 bg-zinc-50" type="email" placeholder="jane@company.com" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-black">Mobile Number</label>
                          <Input value={formData.authMobile} onChange={e => updateForm("authMobile", e.target.value)} className="h-12 bg-zinc-50" type="tel" placeholder="+91 9876543210" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      <MockUpload label="GST Certificate" uploadedKey="gst" />
                      <MockUpload label="Company PAN" uploadedKey="pan" />
                      <MockUpload label="Incorporation Certificate" uploadedKey="inc" />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <MockUpload label="Cancelled Cheque" uploadedKey="cheque" />
                        <MockUpload label="Other (Optional)" uploadedKey="other" />
                      </div>
                    </div>
                  )}
                  
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="bg-zinc-50 border-t border-zinc-200 p-6 sm:px-12 flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={step === 1 || loading}
                className="h-12 px-6 border-zinc-200 text-black hover:bg-zinc-100 font-semibold rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {step < 5 ? (
                <Button 
                  onClick={nextStep} 
                  className="h-12 px-8 bg-black text-white hover:bg-black/90 font-bold rounded-xl shadow-md"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="h-12 px-8 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl shadow-md"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Verification"}
                </Button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
