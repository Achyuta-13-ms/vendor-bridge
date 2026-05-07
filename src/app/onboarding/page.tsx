"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { FileUpload } from "@/components/ui/file-upload";

const step1Schema = z.object({
  name: z.string().min(2, "Name is required"),
  businessName: z.string().min(2, "Business name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
});

const step2Schema = z.object({
  documents: z.object({
    gst: z.string().min(1, "GST document is required"),
    pan: z.string().min(1, "PAN document is required"),
    bank: z.string().nullable().optional(),
  })
});

const formSchema = step1Schema.merge(step2Schema);

const STEPS = ["Business Profile", "Documents", "Review"];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("vendorSession");
    if (!raw) {
      router.push("/login");
      return;
    }
    setSession(JSON.parse(raw));
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(currentStep === 0 ? step1Schema : (currentStep === 1 ? step2Schema : formSchema)),
    defaultValues: {
      name: "", businessName: "", address: "", city: "",
      documents: { gst: "", pan: "", bank: null }
    },
    mode: "onChange"
  });

  const onNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/vendor", {
        businessName: values.businessName,
        address: values.address,
        city: values.city,
        documents: values.documents,
        userId: session?.id,
      });
      if (res.data.success) {
        toast({ title: "Setup Complete", description: "Your vendor profile is under review." });
        router.push("/dashboard");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to create profile.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">Complete your profile to get verified.</p>
        </div>

        <ProgressStepper steps={STEPS} currentStep={currentStep} />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{STEPS[currentStep]}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Tell us about your business."}
              {currentStep === 1 && "Upload your verification documents."}
              {currentStep === 2 && "Review your information before submitting."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* STEP 1: Profile */}
                <div className={currentStep === 0 ? "block" : "hidden"}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="businessName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Registered Address</FormLabel>
                        <FormControl><Input placeholder="123 Sector 4..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="New Delhi" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* STEP 2: Documents */}
                <div className={currentStep === 1 ? "block" : "hidden"}>
                  <div className="space-y-6">
                    <FormField control={form.control} name="documents.gst" render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Certificate *</FormLabel>
                        <FormControl>
                          <FileUpload 
                            label="Upload GST" 
                            className={field.value ? "border-success bg-success/5" : ""} 
                            initialUrl={field.value}
                            onUpload={(url) => { form.setValue("documents.gst", url, { shouldValidate: true }) }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="documents.pan" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company PAN *</FormLabel>
                        <FormControl>
                          <FileUpload 
                            label="Upload PAN" 
                            className={field.value ? "border-success bg-success/5" : ""} 
                            initialUrl={field.value}
                            onUpload={(url) => { form.setValue("documents.pan", url, { shouldValidate: true }) }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="documents.bank" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancelled Cheque (Optional)</FormLabel>
                        <FormControl>
                          <FileUpload 
                            label="Upload Cheque" 
                            className={field.value ? "border-success bg-success/5" : ""} 
                            initialUrl={field.value || undefined}
                            onUpload={(url) => { form.setValue("documents.bank", url || null, { shouldValidate: true }) }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* STEP 3: Review */}
                <div className={currentStep === 2 ? "block" : "hidden"}>
                  <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Provider Name</p>
                        <p className="font-medium">{form.getValues().name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Business</p>
                        <p className="font-medium">{form.getValues().businessName}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium">{form.getValues().address}, {form.getValues().city}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Admin Email</p>
                        <p className="font-medium text-xs truncate">{session?.email || "Pending verification"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">GST Document</p>
                        <p className="font-medium text-success text-xs truncate">{form.getValues().documents.gst ? "Uploaded" : "Pending"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">PAN Document</p>
                        <p className="font-medium text-success text-xs truncate">{form.getValues().documents.pan ? "Uploaded" : "Pending"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 pb-2">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0 || loading}>
                    Back
                  </Button>
                  
                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={onNext}>Next Step</Button>
                  ) : (
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Profile"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
