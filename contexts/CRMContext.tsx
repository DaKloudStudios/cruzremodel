import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { Lead, Client, CallLog, Appointment, LeadStatus, DesignProject } from '../types';

// --- MOCK DESIGN PORTFOLIO ---
const MOCK_DESIGN_PROJECTS: DesignProject[] = [
    {
        id: 'dp-1',
        title: 'Modern Backyard Oasis',
        description: 'Complete overhaul featuring a zero-edge pool, limestone pavers, and drought-tolerant planting.',
        beforeImageUrls: [
            'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=1000'
        ],
        afterImageUrls: [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000'
        ],
        // Just a placeholder for Sketchfab or similar
        design3dUrl: 'https://sketchfab.com/models/442c548d94744641ba279ae94b5f45ec/embed'
    },
    {
        id: 'dp-2',
        title: 'Luxury Estate Entrance',
        description: 'Grand circular driveway with intricate brickwork, monumental lighting, and mature oak transplants.',
        beforeImageUrls: [
            'https://images.unsplash.com/photo-1510627498534-fc24136d47b5?auto=format&fit=crop&q=80&w=1000'
        ],
        afterImageUrls: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'
        ]
    },
    {
        id: 'dp-3',
        title: 'Sustainable Desertscape',
        description: 'Low-maintenance xeriscaping using native flora, river rock dry beds, and drip irrigation.',
        beforeImageUrls: [
            'https://images.unsplash.com/photo-1598902108854-10e07d5cb4bc?auto=format&fit=crop&q=80&w=1000'
        ],
        afterImageUrls: [
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1416879598555-52030f2eece9?auto=format&fit=crop&q=80&w=1000'
        ]
    }
];

interface CRMContextType {
    leads: Lead[];
    clients: Client[];
    calls: CallLog[];
    appointments: Appointment[];
    addLead: (lead: Omit<Lead, 'id' | 'dateCreated' | 'status' | 'tags'>) => Promise<void>;
    updateLeadStatus: (id: string, status: LeadStatus) => void;
    updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
    updateLeadDesign: (leadId: string, designId: string) => Promise<void>;
    convertLeadToClient: (leadId: string) => Promise<void>;
    addClient: (client: Omit<Client, 'id' | 'dateCreated' | 'totalSpent'>) => Promise<string>;
    updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    addCall: (call: Omit<CallLog, 'id'>) => Promise<void>;
    addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<void>;
    designProjects: DesignProject[];
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
    const context = useContext(CRMContext);
    if (!context) {
        throw new Error('useCRM must be used within a CRMProvider');
    }
    return context;
};

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthorized, currentUser } = useAuth();

    const [leads, setLeads] = useState<Lead[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        if (!isAuthorized || !currentUser) {
            setLeads([]);
            setClients([]);
            setCalls([]);
            setAppointments([]);
            return;
        }

        const leadsQuery = query(collection(db, 'leads'), orderBy('dateCreated', 'desc'));
        const unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
            setLeads(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Lead)));
        });

        const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
            setClients(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Client)));
        });

        const callsQuery = query(collection(db, 'calls'), orderBy('date', 'desc'));
        const unsubCalls = onSnapshot(callsQuery, (snapshot) => {
            setCalls(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CallLog)));
        });

        const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
            setAppointments(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Appointment)));
        });

        return () => {
            unsubLeads();
            unsubClients();
            unsubCalls();
            unsubAppointments();
        };
    }, [isAuthorized, currentUser]);

    // --- ACTIONS ---

    const addLead = async (leadData: Omit<Lead, 'id' | 'dateCreated' | 'status' | 'tags'>) => {
        const newLead = {
            ...leadData,
            dateCreated: new Date().toISOString(),
            status: 'New' as LeadStatus,
            tags: []
        };
        await addDoc(collection(db, 'leads'), newLead);
    };

    const updateLead = async (id: string, updates: Partial<Lead>) => {
        await updateDoc(doc(db, 'leads', id), updates);
    };

    const updateLeadStatus = (id: string, status: LeadStatus) => {
        updateLead(id, { status });
    };

    const updateLeadDesign = async (leadId: string, designId: string) => {
        await updateLead(leadId, { designProjectId: designId });
    };

    const convertLeadToClient = async (leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        const newClient = {
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            address: lead.address,
            sourceLeadId: lead.id,
            totalSpent: 0,
            propertyNotes: lead.notes,
            gateCode: '',
            preferredContact: 'Phone',
            tags: ['Maintenance'],
            dateCreated: new Date().toISOString()
        };

        await addDoc(collection(db, 'clients'), newClient);
        await updateLeadStatus(leadId, LeadStatus.WON);
    };

    const addClient = async (clientData: Omit<Client, 'id' | 'dateCreated' | 'totalSpent'>): Promise<string> => {
        const newClient = {
            ...clientData,
            dateCreated: new Date().toISOString(),
            totalSpent: 0
        };
        const docRef = await addDoc(collection(db, 'clients'), newClient);
        return docRef.id;
    };

    const updateClient = async (id: string, updates: Partial<Client>) => {
        await updateDoc(doc(db, 'clients', id), updates);
    };

    const deleteClient = async (id: string) => {
        await deleteDoc(doc(db, 'clients', id));
    };

    const addCall = async (callData: Omit<CallLog, 'id'>) => {
        await addDoc(collection(db, 'calls'), callData);
    };

    const addAppointment = async (apptData: Omit<Appointment, 'id'>) => {
        await addDoc(collection(db, 'appointments'), apptData);
    };

    return (
        <CRMContext.Provider value={{
            leads, clients, calls, appointments,
            addLead, updateLeadStatus, updateLead, updateLeadDesign, convertLeadToClient,
            addClient, updateClient, deleteClient, addCall, addAppointment,
            designProjects: MOCK_DESIGN_PROJECTS
        }}>
            {children}
        </CRMContext.Provider>
    );
};
