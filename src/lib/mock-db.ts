export type VendorStatus = 'Pending' | 'Verified' | 'Failed';

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  address: string;
  phone: string;
  city: string;
  documents: {
    gst: string | null;
    pan: string | null;
    bank: string | null;
  };
  statuses: {
    gst: VendorStatus;
    pan: VendorStatus;
    bank: VendorStatus;
  };
  overallStatus: VendorStatus;
  createdAt: string;
}

export const mockVendors: Vendor[] = [
  {
    id: 'VND-001',
    name: 'Rahul Sharma',
    businessName: 'Sharma Enterprises',
    address: '123 Main St, New Delhi',
    phone: '9876543210',
    city: 'New Delhi',
    documents: {
      gst: '/public/uploads/mock-gst-1.pdf',
      pan: '/public/uploads/mock-pan-1.pdf',
      bank: '/public/uploads/mock-bank-1.pdf'
    },
    statuses: {
      gst: 'Verified',
      pan: 'Verified',
      bank: 'Verified'
    },
    overallStatus: 'Verified',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'VND-002',
    name: 'Anita Desai',
    businessName: 'Desai Tradings',
    address: '45 Linking Road, Mumbai',
    phone: '9123456789',
    city: 'Mumbai',
    documents: {
      gst: '/public/uploads/mock-gst-2.pdf',
      pan: '/public/uploads/mock-pan-2.pdf',
      bank: null
    },
    statuses: {
      gst: 'Verified',
      pan: 'Verified',
      bank: 'Pending'
    },
    overallStatus: 'Pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const addVendor = (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
  const newVendor: Vendor = {
    ...vendor,
    id: `VND-00${mockVendors.length + 1}`,
    createdAt: new Date().toISOString()
  };
  mockVendors.push(newVendor);
  return newVendor;
};
