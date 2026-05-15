"use client";

import React, { useState } from "react";
import axios from "axios";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  PackageCheck,
  ChevronRight,
  Printer
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  externalOrderId: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  placedAt: string;
  platform: { displayName: string };
  items: OrderItem[];
  customer?: { name: string; phone: string; deliveryAddress?: string } | null;
}

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (updatedOrder: Order) => void;
}

const statusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "NEW": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "CONFIRMED": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    case "PREPARING": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "READY": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "DELIVERED": return "bg-blue-500 text-white border-transparent";
    case "CANCELLED": return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export function OrderDetailsSheet({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsSheetProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/vendor/orders/status', { orderId: order.id, newStatus });
      if (res.data.success) {
        toast({ title: "Status Updated", description: `Order is now ${newStatus}` });
        onStatusUpdate(res.data.order);
      }
    } catch (err: any) {
      toast({ 
        title: "Update Failed", 
        description: err.response?.data?.message || "Internal error", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderActionButtons = () => {
    switch (order.status.toUpperCase()) {
      case "NEW":
        return (
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => updateStatus("CANCELLED")} disabled={loading}>Reject</Button>
            <Button className="flex-1 gap-2 font-bold shadow-lg" onClick={() => updateStatus("CONFIRMED")} disabled={loading}>
              <PackageCheck className="h-4 w-4" /> Accept Order
            </Button>
          </div>
        );
      case "CONFIRMED":
        return (
          <Button className="w-full gap-2 font-bold bg-amber-500 hover:bg-amber-600 shadow-lg" onClick={() => updateStatus("PREPARING")} disabled={loading}>
            <Clock className="h-4 w-4" /> Start Preparing
          </Button>
        );
      case "PREPARING":
        return (
          <Button className="w-full gap-2 font-bold bg-blue-500 hover:bg-blue-600 shadow-lg" onClick={() => updateStatus("READY")} disabled={loading}>
            <CheckCircle2 className="h-4 w-4" /> Mark as Ready
          </Button>
        );
      case "READY":
        return (
          <Button className="w-full gap-2 font-bold bg-indigo-500 hover:bg-indigo-600 shadow-lg" onClick={() => updateStatus("PICKED_UP")} disabled={loading}>
            <Truck className="h-4 w-4" /> Dispatched
          </Button>
        );
      case "PICKED_UP":
        return (
          <Button className="w-full gap-2 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={() => updateStatus("DELIVERED")} disabled={loading}>
            <CheckCircle2 className="h-4 w-4" /> Mark Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l shadow-2xl overflow-y-auto no-scrollbar">
        <SheetHeader className="p-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest", statusColor(order.status))}>
              {order.status}
            </Badge>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Printer className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>✕</Button>
            </div>
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Order {order.externalOrderId}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-xs font-medium">
            <span className="text-primary font-bold">{order.platform.displayName}</span>
            <span className="text-muted-foreground">•</span>
            <span>{new Date(order.placedAt).toLocaleString()}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 py-4">
          
          {/* Customer Details */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <User className="h-3 w-3" /> Customer Intel
            </h4>
            <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-background rounded-full flex items-center justify-center border shadow-sm">
                  <span className="text-xs font-bold text-primary">{order.customer?.name?.[0] || 'G'}</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{order.customer?.name || "Guest Customer"}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" /> {order.customer?.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {order.customer?.deliveryAddress || "Dine-in / Pickup Order"}
                </p>
              </div>
            </div>
          </section>

          {/* Itemized Bill */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <ShoppingBag className="h-3 w-3" /> Itemized Bill
            </h4>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm px-1">
                  <div className="flex gap-3">
                    <span className="font-mono text-primary font-bold w-4">x{item.quantity}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <Separator className="bg-border/50" />
            
            <div className="space-y-2 text-sm px-1">
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Taxes & Charges</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-dashed border-border/50 mt-2">
                <span>Grand Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          </section>

        </div>

        <SheetFooter className="p-0 pt-6 border-t bg-background sticky bottom-0 mt-auto">
          {renderActionButtons()}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
